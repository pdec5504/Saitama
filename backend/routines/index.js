const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
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
    // counter++;
    // const { text } = req.body;
    // routines[counter] = { id: counter, text };
    const routineId = uuidv4();
    const routine = {
        id: routineId,
        name: req.body.name,
        weekDay: req.body.weekDay,
        exercises: req.body.exercises || []
    };
    routines[routineId] = routine;
    // send event to the event bus
    await axios.post('http://localhost:10000/events', {
        type: 'RoutineCreated',
        data: routine
    });
    res.status(201).send(routines[routineId]);
})

app.post('/events', (req, res) => {
    const event = req.body;
    console.log('Event received:', event.type);

    try {
        if(functions[event.type]){
            functions[event.type](event.data);
        }else{
            console.log("Event type not handled:", event.type);
        }
    } catch (error) {
        console.error('Error handling event:', error);
    }
    res.status(200).send({ status: 'OK' });
});

app.listen(3000, () => {
    console.log('Routines server is running on port 3000');
});

