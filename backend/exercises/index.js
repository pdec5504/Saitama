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
    res.status(201).send(routineExercises);
});

app.get('/routines/:routineId/exercises', (req, res) => {
    const { routineId } = req.params;
    console.log(`GET request /routines/${routineId}/exercises received`);
    res.send(exercisesByRoutineId[routineId] || []);
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
})
