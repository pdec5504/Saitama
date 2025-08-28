require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// const base = {}; //base consulta
let collection;


const functions = {
    RoutineCreated: async (routine) => {
        // add labels to routines if needed (A, B, C, ...)
        // const routineLabel = `${String.fromCharCode(65 + routineCounter)}`
        // routineCounter++;

        // base[routine.id] = { ...routine, exercises: [] };
        await collection.insertOne({ _id: routine.id, ...routine, exercises: []});
        console.log(`Query: Routine ${routine.id} created.`);
        // add labels to routines if needed (A, B, C, ...)
        // base[routine.id] = { ...routine, label: routineLabel, exercises: [] };
        // console.log(`Query: Routine ${routine.id} created and labeled as ${routineLabel}`);
    },
    ExerciseAdded: async (exercise) => {
        const routine = await collection.findOne({ _id: exercise.routineId });
        //verificação 'Array.isArray' para máxima segurança
        if (routine && Array.isArray(routine.exercises)) {
            const order = routine.exercises.length + 1;

            const exerciseToDisplay = {
                originalId: exercise.id, 
                order: order,
                name: exercise.name,
                reps: exercise.reps,
                sets: exercise.sets
            };

            // routine.exercises.push(exerciseToDisplay);
            await collection.updateOne(
                { _id: exercise.routineId },
                { $push: { exercises: exerciseToDisplay } }
            );
            console.log(`Query: Exercise #${order} (${exercise.name}) added to routine ${exercise.routineId}`);
        } else {
            console.warn(`Query: Routine ${exercise.routineId} not found for exercise ${exercise.name}. Event ignored.`);
        }
    },
    RoutineAnalyzed: async (analysis) => {
        const { routineId, classification } = analysis;
        // const routine = base[routineId];
        await collection.updateOne(
            { _id: routineId },
            { $set: { classification: classification } }
        );
        console.log(`Query: Routine ${analysis.routineId} classified as ${analysis.classification}`);


        // if (routine){
        //     // routine.classification = analysis.classification;
        //     base[routineId] = { ...routine, classification: classification};
        // }
    },

    RoutineUpdated: async (routine) => {
        // const existingRoutine = base[routine.id];
        // if (existingRoutine){
        //     const preservedExercises = existingRoutine.exercises;
        //     base[routine.id] = { ...existingRoutine, ...routine, exercises: preservedExercises};
        //     console.log(`Query: Routine ${routine.id} updated.`);
        // }
        await collection.updateOne(
            { _id: routine.id },
            { $set: { name: routine.name, weekDay: routine.weekDay } }
        );
        console.log(`Query: Routine ${routine.id} updated.`);

    },

    RoutineDeleted: async (data) => {
        await collection.deleteOne({ _id: data.id });
        console.log(`Query: Routine ${data.id} deleted.`);
    },

    ExerciseUpdated: async (exercise) => {
        const routine = await collection.findOne({ _id: exercise.routineId });
        if (routine){
            const index = routine.exercises.findIndex(ex => ex.originalId === exercise.id);
            if(index !== -1){
                // routine.exercises[index] = { ...routine.exercises[index], ...exercise};
                const updatedExercise = { ...routine.exercises[index], ...exercise };
                await collection.updateOne(
                    { _id: exercise.routineId, "exercises.originalId": exercise.id },
                    { $set: { "exercises.$": updatedExercise } }
                )
                console.log(`Query: Exercise ${exercise.id} in routine ${exercise.routineId} updated.`);
            }
        }
    },

    ExerciseDeleted: async (data) => {
        const routine = await collection.findOne({ _id: data.routineId });
        if (routine && Array.isArray(routine.exercises)){
            const remaningExercises = routine.exercises.filter(ex => ex.originalId !== data.id);
            const reorderedExercises = remaningExercises.map((exercise, index) => {
                return { ...exercise, order: index + 1};
            });
            // routine.exercises = reorderedExercises;
            await collection.updateOne(
                { _id: data.routineId },
                { $set: { exercises: reorderedExercises } }
            )
            console.log(`Query: Exercise ${data.id} in routine ${data.routineId} deleted.`);
        }
    }
};

app.get('/routines', async (req, res) => {
    const routines = await collection.find({}).toArray();
    res.status(200).send(routines);
});


async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        await channel.assertExchange(exchange, 'fanout', { durable:false})

        const q = await channel.assertQueue('query_events', { durable: true})
        console.log(`Consumer (Query) waiting for events in queue: ${q.queue}`);

        await channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, (msg) => {
            if(msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Query): Event received - ${event.type}`)

                if(functions[event.type]){
                    functions[event.type](event.data)
                }
                channel.ack(msg);
            }
        });
    } catch(error){
        console.error('Error in Consumer (Query):', error);
    }
}


app.listen(6000, async () => {
    console.log('Query server is running on port 6000');
    try{
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        const mongoUrl = `mongodb://${process.env.MONGO_USER}:${encodedPassword}@${process.env.MONGO_HOST}:27017`;
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        collection = db.collection('query_routines');
        console.log('Connected to MongoDB (Query).' );
    }catch(error){
        console.error('Error connecting to MongoDB (Query):', error);
        process.exit(1);
    }
    startConsumer();
})