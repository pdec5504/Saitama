const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(express.json());

const routines = {}
// counter para controlar os IDs das rotinas
// let counter = 0;

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
    res.status(201).send(routines[routineId]);
})

app.listen(3000, () => {
    console.log('Routine server is running on port 3000');
});

