require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const axios = require('axios');
const amqp = require('amqplib');

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

    const reps = routine.exercises.map(ex => parseInt(ex.reps, 10));

    const minReps = Math.min(...reps);
    const maxReps = Math.max(...reps);

    let classification = "General Training"; //default

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

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = "event_exchange";

        const analysisEvent = {
            type: 'RoutineAnalyzed',
            data: {
                routineId: routine.id,
                classification: classification
            }
        };

        await channel.assertExchange(exchange, 'fanout', { durable:false });
        channel.publish(exchange, '', Buffer.from(JSON.stringify(analysisEvent)));
        console.log(`Publisher (Analysis): Event [${analysisEvent.type}] published.`)

        await channel.close()
        await connection.close();
    } catch(error){
        console.error("Error to send analysis event: ", error.message);
    }
};


//     try{
//         await axios.post("http://localhost:10000/events", {
//             type: "RoutineAnalyzed",
//             data:{
//                 routineId: routine.id,
//                 classification: classification
//             }
//         });
//     } catch(error){
//         console.error("Error to send analysis event: ", error.message);
//     }
// };

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

// old logic
// app.post("/events", (req, res) => {
//     const { type, data } = req.body;
//     console.log("Event received (Analysis):", type);

//     if(functions[type]){
//         functions[type](data);
//     }

//     res.status(200).send({ status: "OK" });
// });

async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = "event_exchange";

        await channel.assertExchange(exchange, 'fanout', { durable:false });
        const q = await channel.assertQueue('analysis_event', { durable: true });
        console.log(`Consumer (Analysis): Waiting for messages in queue: ${q.queue}`);

        await channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, (msg) => {
            if(msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Analysis): Event received - ${event.type}`, event.type);

                if(functions[event.type]){
                    functions[event.type](event.data);
                }
                channel.ack(msg);
            }
        });
    }catch(error){
        console.error("Error in Consumer (Analysis):", error.message);
    }

}

app.listen(7000, () => {
    console.log("Analysis server is running on port 7000.");
    startConsumer();
})