require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const axios = require('axios');


const app = express();
app.use(express.json());
app.use(cors());

let collection;

const functions = {
    RoutineDeleted: async (data) => {
        const { id } = data;
        await collection.deleteMany({ routineId: id });
        console.log(`Consumer (Exercises): Exercises of routine ${id} deleted.`);
    }
};

app.get('/image/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const imageUrl = `https://${process.env.RAPIDAPI_HOST}/image?exerciseId=${id}&resolution=180`;
        
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            }
        });

        res.setHeader('Content-Type', 'image/gif');
        
        response.data.pipe(res);

    } catch (error) {
        console.error("Error proxying image:", error.message);
        res.status(500).send({ message: "Could not load image." });
    }
});

app.post('/routines/:routineId/exercises', async (req, res) => {
    const { routineId } = req.params;
    const { name, phases } = req.body;
    const exerciseId = uuidv4();

    if (!name || !Array.isArray(phases) || phases.length === 0) {
        return res.status(400).send({ message: "Name and at least one phase are required." });
    }

    let gifUrl = '';
    try {
        const searchName = name.toLowerCase();
        console.log(`Searching for ID for: "${searchName}"`);
        
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST}/exercises/name/${encodeURIComponent(name.toLowerCase())}`,
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            }
        };
        const response = await axios.request(options);

        let bestMatch = null;

        if (response.data && response.data.length > 0) {
            bestMatch = response.data.find(ex => ex.name.toLowerCase() === searchName);

            if (!bestMatch) {
                const potentialMatches = response.data.filter(ex => ex.name.toLowerCase().includes(searchName));
                if (potentialMatches.length > 0) {
                    potentialMatches.sort((a, b) => a.name.length - b.name.length);
                    bestMatch = potentialMatches[0];
                }
            }
        }

        if (bestMatch && bestMatch.id) {
            const exerciseId = bestMatch.id;
            gifUrl = `http://localhost:4001/image/${exerciseId}`;
            
            console.log(`Proxy URL built for '${name}' (ID: ${exerciseApiId}): ${gifUrl}`);
        } else {
            console.log(`Could not find a matching exercise for '${name}' in the API.`);
        }

    } catch (error) {
        if (error.response) {
            console.error("Error in ExerciseDB API response (status):", error.response.status);
            console.error("Error in ExerciseDB API response (data):", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("Error in request to ExerciseDB API (no response):", error.request);
        } else {
            console.error("Error setting up request to ExerciseDB API:", error.message);
        }
    }

    const order = await collection.countDocuments({ routineId });

    const newExercise = {
        _id: exerciseId,
        name,
        routineId,
        phases,
        order,
        gifUrl
    };

    await collection.insertOne(newExercise);

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        const event = {
            type: 'ExerciseAdded',
            data: {
                id: exerciseId,
                name,
                routineId,
                phases,
                order,
                gifUrl
            }
        };

        await channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Exercises): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
     } catch (error){
        console.error("Error publishing 'ExerciseAdded' event to RabbitMQ:", error);
     }

    res.status(201).send(newExercise);
});

app.get('/routines/:routineId/exercises', async (req, res) => {
    const { routineId } = req.params;
    const exercises = await collection.find({ routineId:routineId }).sort({order: 1}).toArray();
    res.send(exercises || []);
});

// edit exercise endpoint
app.put('/routines/:routineId/exercises/:exerciseId', async (req, res) => {
    const { exerciseId } = req.params;
    const { name, phases } = req.body;

    if (!name || !Array.isArray(phases) || phases.length === 0) {
        return res.status(400).send({ message: "Name and at least one phase are required." });
    }

    const result = await collection.updateOne(
        { _id: exerciseId },
        { $set: { name, phases } }
    );
    if(result.matchedCount === 0) return res.status(404).send({ message: 'Exercise not found'});

    const updatedExercise = await collection.findOne({ _id: exerciseId });

    const eventData = {
        id: updatedExercise._id,
        routineId: updatedExercise.routineId,
        name: updatedExercise.name,
        phases: updatedExercise.phases,
        order: updatedExercise.order
    };

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'ExerciseUpdated',
            data: eventData
        };
        await channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Exercises): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
    }catch (error){
        console.error("Error publishing event 'ExerciseUpdated' to RabbitMQ:", error);
    }
    res.status(200).send(updatedExercise);
})

//delete exercise endpoint
app.delete('/routines/:routineId/exercises/:exerciseId', async (req, res) => {
    const { routineId, exerciseId } = req.params;

    const result = await collection.deleteOne({ _id: exerciseId });
    if(result.deletedCount === 0) return res.status(404).send({ message: 'Exercise not found'});

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'ExerciseDeleted',
            data: { id: exerciseId, routineId: routineId}
        };
        await channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Exercises): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
    }catch (error){
        console.error("Error publishing event 'ExerciseDeleted' to RabbitMQ:", error);
    }
    res.status(204).send();
})

app.post('/routines/:routineId/exercises/reorder', async (req, res) => {
    const { routineId } = req.params;
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).send({ message: 'Array with ordered IDs is required.' });
    }

    try {
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, routineId: routineId },
                update: { $set: { order: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await collection.bulkWrite(bulkOps);
        }

        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'ExercisesReordered',
            data: { routineId, orderedIds }
        };
        
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        
        await channel.close();
        await connection.close();

        res.status(200).send({ message: "Exercises order updated successfully." });
    } catch (error) {
        console.error("Error reordering exercises:", error);
        res.status(500).send({ message: "Internal error while reordering exercises." });
    }
});

async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        await channel.assertExchange(exchange, 'fanout', { durable:false });
        const q = await channel.assertQueue('exercises_events', { durable: true });
        channel.prefetch(1);
        console.log(`Consumer (exercises) waiting for events in queue: ${q.queue}`);
        await channel.bindQueue(q.queue, exchange, '');
        channel.consume(q.queue, (msg) => {
            if (msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Exercises): Event received - ${event.type}`);

                if(functions[event.type]){
                    functions[event.type](event.data);
                }
                channel.ack(msg);
            }
        });
    } catch (error){
        console.error('Error in Consumer (Exercises):', error.message);
    }
}

app.listen(4001, async () => {
    console.log("Exercises server is running on port 4001");

    try{
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        const mongoUrl = `mongodb://${process.env.MONGO_USER}:${encodedPassword}@${process.env.MONGO_HOST}:27017`;
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        collection = db.collection('exercises');
        console.log("Connected to MongoDB (Exercises)");
    }catch (error){
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }

    startConsumer();
})
