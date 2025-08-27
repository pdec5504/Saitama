require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const e = require('express');


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

// edit exercise endpoint
app.put('/routines/:routineId/exercises/:exerciseId', async (req, res) => {
    const { routineId, exerciseId } = req.params;
    const { name, reps, sets} = req.body;

    const routineExercises = exercisesByRoutineId[routineId];
    if(!routineExercises){
        return res.status(404).send({ message: 'Routine not found'});
    }

    const exerciseToUpdate = routineExercises.find(ex => ex.id === exerciseId);
    if(!exerciseToUpdate){
        return res.status(404).send({ message: 'Exercise not found'});
    }

    exerciseToUpdate.name = name || exerciseToUpdate.name;
    exerciseToUpdate.reps = reps || exerciseToUpdate.reps;
    exerciseToUpdate.sets = sets || exerciseToUpdate.sets;

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';
        const event = {
            type: 'ExerciseUpdated',
            data: exerciseToUpdate
        };
        await channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));
        console.log(`Publisher (Exercises): Event [${event.type}] sent to RabbitMQ.`);
        await channel.close();
        await connection.close();
    }catch (error){
        console.error("Error to publish event 'ExerciseUpdated' to RabbitMQ:", error);
    }
    res.status(200).send(exerciseToUpdate);
})

//delete exercise endpoint
app.delete('/routines/:routineId/exercises/:exerciseId', async (req, res) => {
    const { routineId, exerciseId } = req.params;

    const routineExercises = exercisesByRoutineId[routineId];
    if(!routineExercises){
        return res.status(404).send({ message: 'Routine not found'});
    }

    const exerciseIndex = routineExercises.findIndex(ex => ex.id === exerciseId);
    if(exerciseIndex === -1){
        return res.status(404).send({ message: 'Exercise not found'});
    }

    exercisesByRoutineId[routineId].splice(exerciseIndex, 1);

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

app.listen(4000, () => {
    console.log("Exercises server is running on port 4000");
})
