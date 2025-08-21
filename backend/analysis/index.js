const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const routinesToAnalyze = {};

const analyseAndClassify = async (routineId) => {
    const routine = routinesToAnalyze[routineId];

    if(!routine || !routine.exercises || routine.exercises.length === 0){
        console.log(`Analysis: Routine ${routineId} don't have exercises to analyze.`)
        return;
    } 

    // calculate the average of reps
    // let repsSum = 0;
    // for(const ex of routine.exercises){
    //     repsSum += parseInt(ex.reps, 10);
    // }

    const reps = routine.exercises.map(ex => parseInt(ex.reps, 10));

    const minReps = Math.min(...reps);
    const maxReps = Math.max(...reps);

    let classification = "General Training"; //defaul

    if(minReps <= 6 && maxReps >= 8){
        classification = "Hybrid Training (Strength/ Hypertrophy)";
    }
    else{
        const repsSum = reps.reduce((sum, cur) => sum + cur, 0);
        const repsAvg = repsSum / reps.length;

        if(repsAvg <= 6){
            classification = "Strength Training";
        } else if(repsAvg >= 8 && repsAvg <= 12){
            classification = "Hypertrophy Training";
        } else if( repsAvg > 12){
            classification = "Resistance Training";
        } else{
            classification = "Hybrid Training (Strength/ Hypertrophy)";
        }
    }
    console.log(`${routineId} Routine Analyses: [${reps.join(', ')}] reps -> Classification: ${classification}`);


    // routine.exercises.forEach(ex => {
    //     repsSum += parseInt(ex.reps, 10)
    // })
    // const repsAvg = repsSum / routine.exercises.length;

    // if(repsAvg <= 6){
    //     classification = "Strength Training"
    // } else if(repsAvg >= 8 && repsAvg <= 12){
    //     classification = "Hypertrophy Training"
    // } else if(repsAvg > 12){
    //     classification = "Resistance Training"
    // } else{ // 6<avg<8
    //     classification = "Hybrid Training (Strength/Hypertrophy)";
    // }

    try{
        await axios.post("http://localhost:10000/events", {
            type: "RoutineAnalyzed",
            data:{
                routineId: routine.id,
                classification: classification
            }
        });
    } catch(error){
        console.error("Error to send analysis event: ", error.message);
    }
};

const functions = {

    RoutineCreated: (routine) => {
        routinesToAnalyze[routine.id] = { ...routine, exercises: []};
        console.log(`Analysis: Routine ${routine.id} registred to future analysis.`);
    },

    ExerciseAdded: (exercise) => {
        const routine = routinesToAnalyze[exercise.routineId];
        if(routine){
            routine.exercises.push(exercise);
            analyseAndClassify(exercise.routineId);
        }
    }

};

app.post("/events", (req, res) => {
    const { type, data } = req.body;
    console.log("Event received (Analysis):", type);

    if(functions[type]){
        functions[type](data);
    }

    res.status(200).send({ status: "OK" });
});

app.listen(7000, () => {
    console.log("Analysis server is running on port 7000.");
})