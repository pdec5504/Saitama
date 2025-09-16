require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());


let collection; // MongoDB collection


const functions = {
    ExerciseAdded: async (exercise) => {
        const simpleExercise = {
            id: exercise.id,
            name: exercise.name,
            phases: exercise.phases
        };
        await collection.updateOne(
            { _id: exercise.routineId },
            { $push: {exercises: simpleExercise } }
        );
        console.log(`Consumer (Routines): Exercise ${exercise.name} added to routine ${exercise.routineId}.`);
    },

    ExerciseUpdated: async (exercise) => {
        const updatedExercise = {
            id: exercise.id,
            name: exercise.name,
            phases: exercise.phases
        };
        await collection.updateOne(
            { _id: exercise.routineId, "exercises.id": exercise.id },
            { $set: { "exercises.$": updatedExercise}}
        );
        console.log(`Consumer (Routines): Exercise ${exercise.id} updated in routine ${exercise.routineId}.`)
    },

    ExerciseDeleted: async (data) => {
        await collection.updateOne(
            { _id: data.routineId },
            { $pull: { exercises: { id: data.id } } }
        );
        console.log(`Consumer (Routines): Exercise ${data.id} deleted from routine ${data.routineId}.`)
    }
}

app.get('/routines', async (req, res) => {
    const routines = await collection.find({}).sort({ order: 1 }).toArray();
    res.send(routines)
})

app.post('/routines', async (req, res) => {
    const routineId = uuidv4();
    const { name, weekDay } = req.body;
    const order = await collection.countDocuments();
    const routine = {
        _id: routineId,
        name,
        weekDay,
        exercises: [],
        order: order
    };

    await collection.insertOne(routine);

    const eventData = {
        id: routine._id,
        name: routine.name,
        weekDay: routine.weekDay,
        order: routine.order
    }

    // connect to RabbitMQ server
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'RoutineCreated',
            data: eventData
        };
        await channel.assertExchange(exchange, 'fanout', { durable: false})
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)))
        console.log(`Publisher (Routines): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
    } catch (error){
        console.error('Error connecting to RabbitMQ:', error);
    }

    res.status(201).send(routine);
});

app.post('/routines/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).send({ message: 'Ordered IDs Array is necessary'})
    }

    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { order: index } }
        }
    }));

    if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
    }

    try{
        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = { type: 'RoutinesReordered', data: { orderedIds } };
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        await channel.close();
        await connection.close();
    } catch(error) {
        console.error('Error publishing event "RoutinesReordered":', error)
    }

    res.status(200).send({message:"Order successfully updated."})
})

//routine edit endpoint
app.put('/routines/:id', async (req, res) => {
    const { id } = req.params;
    const { name, weekDay } = req.body;

    await collection.updateOne({ _id: id }, { $set: { name, weekDay } });
    const updatedRoutine = await collection.findOne({ _id: id });
    if (!updatedRoutine) return res.status(404).send({ message: "Routine not found" });

    const eventData = {
        id: updatedRoutine._id,
        name: updatedRoutine.name,
        weekDay: updatedRoutine.weekDay
    };

    //publish 'RoutineUpdated' event
    try{
        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        
        const event = {
            type: 'RoutineUpdated',
            data: eventData
        };

        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Routines): Event [${event.type}] published.`);

        await channel.close();
        await connection.close();
    } catch (error){
        console.error('Error publishing event "RoutineUpdated":', error)
    }

    res.status(200).send(updatedRoutine);
})

// delete routine endpoint
app.delete('/routines/:id', async (req, res) => {
    const { id } = req.params;

    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).send({ message: "Routine not found" });

    const remainingRoutines = await collection.find({}).sort({ order: 1}).toArray()
    const bulkOps = remainingRoutines.map((routine, index) => ({
        updateOne: {
            filter: { _id: routine._id },
            update: { $set: { order: index } }
        }
    }));
    
    if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
    }

    try{
        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        const deleteEvent = {
            type: 'RoutineDeleted',
            data: { id: id }
        };

        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(deleteEvent)));
        console.log(`Publisher (Routines): Event [${deleteEvent.type}] published.`);

        const reorderEvent = {
            type: 'RoutinesReordered',
            data: { orderedIds: remainingRoutines.map(r => r._id)}
        }
        channel.publish(exchange, '', Buffer.from(JSON.stringify(reorderEvent)));
        console.log(`Publisher (Routines): Event [${reorderEvent.type}] published after deletion.`);

        await channel.close();
        await connection.close();
    }catch (error){
        console.error('Error publishing event "RoutineDeleted":', error)
    }
    res.status(204).send();
})

async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        await channel.assertExchange(exchange, 'fanout', { durable: false });

        const q = await channel.assertQueue('routines_events', {durable: true});
        channel.prefetch(1);
        console.log(`Consumer (Routines) waiting for events in queue: ${q.queue}`);

        await channel.bindQueue(q.queue, exchange, '');
        channel.consume(q.queue, (msg) => {
            if(msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Routines): Event received - ${event.type}`);

                if(functions[event.type]){
                    functions[event.type](event.data);
                }
                channel.ack(msg);
            }
        });
    } catch (error){
        console.error('Error in Consumer (Routines):', error);
    }
}


app.listen(3001, async () => {
    console.log('Routines server is running on port 3001');

    try{
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        const mongoUrl = `mongodb://${process.env.MONGO_USER}:${encodedPassword}@${process.env.MONGO_HOST}:27017`;
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        collection = db.collection('routines');
        console.log('Connected to MongoDB (Routines)');
    }catch (error){
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }

    startConsumer();
});

