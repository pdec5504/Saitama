const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// in-memory storage for exercises
const exercisesByRoutineId = {};

app.post('/routines/:routineId/exercises', (req, res) => {
    const { routineId } = req.params;
    const exerciseId = uuidv4();
    const { name, reps, sets } = req.body;

    const routineExercises = exercisesByRoutineId[routineId] || [];
    routineExercises.push({
        id: exerciseId, name, reps, sets, routineId });
    exercisesByRoutineId[routineId] = routineExercises;
    console.log(`Exercise ${name} added to routine ${routineId}. Exercise ID: ${exerciseId}`);
    // send event to the event bus
    axios.post('http://localhost:10000/events',{
        type: 'ExerciseAdded',
        data: {
            id: exerciseId,
            name,
            reps,
            sets,
            routineId
        }
    })
    res.status(201).send(routineExercises);
});

app.get('/routines/:routineId/exercises', (req, res) => {
    const { routineId } = req.params;
    console.log(`GET request /routines/${routineId}/exercises received`);
    res.send(exercisesByRoutineId[routineId] || []);
});

app.post('/events', (req, res) => {
    res.status(200).send({ status: 'OK' });
    console.log('Event received:', req.body);
});

app.listen(4000, () => {
    console.log("Exercises server is running on port 4000");
})
