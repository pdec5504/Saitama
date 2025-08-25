require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
// const axios = require('axios');
const amqp = require('amqplib');

const app = express();
app.use(cors());
app.use(express.json());

const routines = {}
// counter para controlar os IDs das rotinas
// let counter = 0;

const functions = {
    ExerciseAdded: (exercise) => {
        if(routines[exercise.routineId]){
            if(!routines[exercise.routineId].exercises || !Array.isArray(routines[exercise.routineId].exercises)){
                routines[exercise.routineId].exercises = [];
            }
            // add the exercise to the routine
            routines[exercise.routineId].exercises.push({
                id: exercise.id,
                name: exercise.name,
                reps: exercise.reps,
                sets: exercise.sets
            });
            console.log(`Exercise ${exercise.name} added to routine ${exercise.routineId}.`);
        }else{
            console.warn(`Routine ${exercise.routineId} not found for exercise ${exercise.name}.`);
        }
    }
}

app.get('/routines', (req, res) => {
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
        id: routineId,
        name,
        weekDay,
        exercises: []
    };
    routines[routineId] = routine;
    // send event to the event bus
    // await axios.post('http://localhost:10000/events', {
    //     type: 'RoutineCreated',
    //     data: routine
    // });

    // connect to RabbitMQ server
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        // console.log("--- DEBUG DE CONEXÃO (Publisher) ---");
        // console.log("Host:", process.env.RABBITMQ_HOST);
        // console.log("User:", process.env.RABBITMQ_USER);
        // console.log("Password:", process.env.RABBITMQ_PASSWORD);
        // console.log("------------------------------------");
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

    res.status(201).send(routines[routineId]);
});

async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        // console.log("--- DEBUG DE CONEXÃO (Consumer) ---");
        // console.log("Host:", process.env.RABBITMQ_HOST);
        // console.log("User:", process.env.RABBITMQ_USER);
        // console.log("Password:", process.env.RABBITMQ_PASSWORD);
        // console.log("------------------------------------");
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

// old logic
// app.post('/events', (req, res) => {
//     const event = req.body;
//     console.log('Event received:', event.type);

//     try {
//         if(functions[event.type]){
//             functions[event.type](event.data);
//         }else{
//             console.log("Event type not handled:", event.type);
//         }
//     } catch (error) {
//         console.error('Error handling event:', error);
//     }
//     res.status(200).send({ status: 'OK' });
// });

app.listen(3000, () => {
    console.log('Routines server is running on port 3000');
    startConsumer();
});

