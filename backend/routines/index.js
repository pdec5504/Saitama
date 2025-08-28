require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// const routines = {};
let collection; // MongoDB collection


const functions = {
    ExerciseAdded: async (exercise) => {
        const simpleExercise = {
            id: exercise.id,
            name: exercise.name,
            reps: exercise.reps,
            sets: exercise.sets
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
            reps: exercise.reps,
            sets: exercise.sets
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
    const routines = await collection.find({}).toArray();
    res.send(routines)
})

app.post('/routines', async (req, res) => {
    const routineId = uuidv4();
    const { name, weekDay } = req.body;
    // esse jeito funciona sem a linha de cima
    // const routine = {
    //     id: routineId,
    //     name: req.body.name,
    //     weekDay: req.body.weekDay,
    //     exercises: req.body.exercises || []
    // };
    const routine = {
        _id: routineId,
        name,
        weekDay,
        exercises: []
    };
    // routines[routineId] = routine;
    await collection.insertOne(routine);

    // connect to RabbitMQ server
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'RoutineCreated',
            data: routine
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

//routine edit endpoint
app.put('/routines/:id', async (req, res) => {
    const { id } = req.params;
    const { name, weekDay } = req.body;

    // const existingRoutine = routines[id];
    // if(!existingRoutine){
    //     return res.status(404).send({ message: "Routine not found" });
    // }
    
    // //update data 
    // existingRoutine.name = name
    // existingRoutine.weekDay = weekDay

    await collection.updateOne({ _id: id }, { $set: { name, weekDay } });
    const updatedRoutine = await collection.findOne({ _id: id });
    if (!updatedRoutine) return res.status(404).send({ message: "Routine not found" });

    //publish 'RoutineUpdated' event
    try{
        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        
        const event = {
            type: 'RoutineUpdated',
            data: updatedRoutine
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

    // if(!routines[id]){
    //     return res.status(404).send({ message: "Routine not found" });
    // }

    // delete routines[id];

    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).send({ message: "Routine not found" });

    try{
        const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        const event = {
            type: 'RoutineDeleted',
            data: { id: id }
        };

        await channel.assertExchange(exchange, 'fanout', { durable: false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Routines): Event [${event.type}] published.`);

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


app.listen(3000, async () => {
    console.log('Routines server is running on port 3000');

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

