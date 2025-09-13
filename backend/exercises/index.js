require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');


const app = express();
app.use(express.json());
app.use(cors());

// in-memory storage for exercises
// const exercisesByRoutineId = {};

let collection;

const functions = {
    RoutineDeleted: async (data) => {
        const { id } = data;
        await collection.deleteMany({ routineId: id });
        console.log(`Consumer (Exercises): Exercises of routine ${id} deleted.`);
    }
};

app.post('/routines/:routineId/exercises', async (req, res) => {
    const { routineId } = req.params;
    const { name, reps, sets } = req.body;
    const exerciseId = uuidv4();

    // Adicionado: Contar exercícios existentes para definir a ordem
    const order = await collection.countDocuments({ routineId });

    const newExercise = {
        _id: exerciseId,
        name,
        reps,
        sets,
        routineId,
        order // Adicionado: Salvar o campo 'order' na criação
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
                reps,
                sets,
                routineId,
                order
            }
        };

        await channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Exercises): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
     } catch (error){
        console.error("Error to publish event 'ExerciseAdded' to RabbitMQ:", error);
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
    const { name, reps, sets} = req.body;

    const result = await collection.updateOne(
        { _id: exerciseId },
        { $set: { name, reps, sets } }
    );
    if(result.matchedCount === 0) return res.status(404).send({ message: 'Exercise not found'});

    const updatedExercise = await collection.findOne({ _id: exerciseId });

    const eventData = {
        id: updatedExercise._id,
        name: updatedExercise.name,
        reps: updatedExercise.reps,
        sets: updatedExercise.sets,
        routineId: updatedExercise.routineId,
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
        console.error("Error to publish event 'ExerciseUpdated' to RabbitMQ:", error);
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
        console.error("Error to publish event 'ExerciseDeleted' to RabbitMQ:", error);
    }
    res.status(204).send();
})

app.post('/routines/:routineId/exercises/reorder', async (req, res) => {
    const { routineId } = req.params;
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).send({ message: 'Array with ordered IDs required.' });
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

        res.status(200).send({ message: "Ordem dos exercícios atualizada com sucesso." });
    } catch (error) {
        console.error("Erro ao reordenar exercícios:", error);
        res.status(500).send({ message: "Erro interno ao reordenar exercícios." });
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
