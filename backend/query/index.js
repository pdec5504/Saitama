const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const base = {} //base consulta

const functions = {
    RoutineCreated: (routine) => {
        base[routine.id] = {...routine, exercises: []}
        console.log(`Query: Routine ${routine.id} created`)
    },
    ExerciseAdded: (exercise) => {
        const routine = base[exercise.routineId]
        if(routine){
            routine.exercises.push(exercise)
            console.log(`Query: Exercise ${exercise.id} added to routine ${exercise.routineId}`)
        }
    }
};

app.get('/routines', (req, res) => {
    res.status(200).send(base)
});

app.post('/events', (req, res) => {
    const event = req.body;
    console.log("Processing event:", event.type);

    try{
        const handler = functions[event.type];
        if(handler){
            handler(event.data);
        }
    }
    catch (error) {
        console.error("Error processing event:", error);
    }
    res.status(200).send({status: 'ok'});
});

// inicialização e sincronização de eventos
app.listen(6000, async () => {
    console.log('Query server is running on port 6000')

    try {
        console.log('Synchronizing events...')
        const res = await axios.get('http://localhost:10000/events')

        for(const event of res.data){
            console.log('Processing event:', event.type);
            const handler = functions[event.type];
            if(handler){
                handler(event.data);
            }
        }
        console.log("Synchronization complete.")
    } catch (error){
        console.error("Error during synchronization:", error.message);
    }
})