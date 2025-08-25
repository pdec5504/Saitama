require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
// const axios = require('axios');
const amqp = require('amqplib');


const app = express();
app.use(express.json());
app.use(cors());

// in-memory storage for exercises
const exercisesByRoutineId = {};

app.post('/routines/:routineId/exercises', async (req, res) => {
    const { routineId } = req.params;
    const { name, reps, sets } = req.body;

    const exerciseId = uuidv4();

    const routineExercises = exercisesByRoutineId[routineId] || [];
    routineExercises.push({
        id: exerciseId, name, reps, sets, routineId });
    exercisesByRoutineId[routineId] = routineExercises;

    // console.log(`Exercise ${name} added to routine ${routineId}. Exercise ID: ${exerciseId}`);
    // send event to the event bus (old logic using axios)
    // axios.post('http://localhost:10000/events',{
    //     type: 'ExerciseAdded',
    //     data: {
    //         id: exerciseId,
    //         name,
    //         reps,
    //         sets,
    //         routineId
    //     }
    // })

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
                routineId
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

    res.status(201).send(routineExercises);
});

app.get('/routines/:routineId/exercises', (req, res) => {
    const { routineId } = req.params;
    console.log(`GET request /routines/${routineId}/exercises received`);
    res.send(exercisesByRoutineId[routineId] || []);
});

//old logic using event bus
// app.post('/events', (req, res) => {
//     res.status(200).send({ status: 'OK' });
//     console.log('Event received:', req.body);
// });

app.listen(4000, () => {
    console.log("Exercises server is running on port 4000");
})
