require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

let collection;

const analyseAndClassify = async (routineId) => {
    const routine = await collection.findOne({ _id: routineId});
    if (!routine || !routine.exercises || routine.exercises.length === 0) {
        return;
    }
    
    let classification = "General Training"; //default
    let repsAvg = 0;
    
    const allReps = routine.exercises.flatMap(ex => 
        (ex.phases || []).map(phase => parseInt(phase.reps, 10))
    );
    console.log(allReps)

    if(allReps.length > 0 ){
        const repsSum = allReps.reduce((sum, current) => sum + current, 0);
        repsAvg = repsSum / allReps.length;

        // const minReps = Math.min(...reps);
        // const maxReps = Math.max(...reps);
        
        if(repsAvg <= 6){
            classification = "Strength Training";
        } else if(repsAvg >= 6 && repsAvg <= 12){
            classification = "Hypertrophy Training";
        } else if( repsAvg > 12){
            classification = "Resistance Training";
        } else{
            classification = "Hybrid Training (Strength/ Hypertrophy)";
        }
    //     if(minReps <= 6 && maxReps >= 8){
    //     classification = "Hybrid Training (Strength/ Hypertrophy)";
    // }
    // else{
    //     // const repsSum = reps.reduce((sum, cur) => sum + cur, 0);
    //     // const repsAvg = repsSum / reps.length;

    // }
    };
    console.log(`${routineId} Routine Analyses: [${allReps.join(', ')}] reps -> Classification: ${classification}`);

    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = "event_exchange";

        const analysisEvent = {
            type: 'RoutineAnalyzed',
            data: {
                routineId: routine._id,
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



const functions = {

    RoutineCreated: async (routine) => {
        await collection.insertOne({ _id: routine.id, ...routine, exercises: []});
        console.log(`Analysis: Routine ${routine.id} registred to future analysis.`);
    },

    ExerciseAdded: async (exercise) => {
        await collection.updateOne(
            { _id: exercise.routineId },
            { $push: { exercises: exercise } }
        );
        await analyseAndClassify(exercise.routineId);
    },

    ExerciseUpdated: async (exercise) => {
        // const exerciseData = { ...exercise, id: exercise._id };
        // delete exerciseData._id;
        await collection.updateOne(
            { _id: exercise.routineId, "exercises._id": exercise._id },
            { $set: { "exercises.$": exercise } }
        );
        await analyseAndClassify(exercise.routineId);
    },

    ExerciseDeleted: async (data) => {
        await collection.updateOne(
            { _id: data.routineId },
            { $pull: { exercises: { id: data.id } } }
        );
        await analyseAndClassify(data.routineId);
    },

    RoutineDeleted: async (data) => {
        const result = await collection.deleteOne({ _id: data.id });
        if(result.deletedCount > 0){
            console.log(`Analysis: Routine ${data.id} data deleted from databse.`);
        }
    }
};


async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;
    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = "event_exchange";

        await channel.assertExchange(exchange, 'fanout', { durable:false });
        const q = await channel.assertQueue('analysis_event', { durable: true });
        channel.prefetch(1);
        console.log(`Consumer (Analysis): Waiting for messages in queue: ${q.queue}`);

        await channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, async (msg) => {
            if(msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Analysis): Event received - ${event.type}`);

                if(functions[event.type])
                    try {
                    await functions[event.type](event.data);
                } catch(error){
                    console.error(`Error processing the event ${event.type}:`, error);
                }
                channel.ack(msg);
            }
        });
    }catch(error){
        console.error("Error in Consumer (Analysis):", error.message);
    }

}

app.listen(7001, async () => {
    console.log("Analysis server is running on port 7001.");

    try{
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        const mongoUrl = `mongodb://${process.env.MONGO_USER}:${encodedPassword}@${process.env.MONGO_HOST}:27017`;
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        collection = db.collection('analysis_routines');
        console.log("Connected to MongoDB (Analysis).");
    } catch(error){
        console.error("Error connecting to MongoDB (Analysis): ", error.message);
        process.exit(1);
    }

    startConsumer();
})