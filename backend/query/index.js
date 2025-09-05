require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// const base = {};
let collection;


const functions = {
    RoutineCreated: async (routine) => {
        await collection.insertOne({
            _id: routine.id,
            name: routine.name,
            weekDay: routine.weekDay,
            exercises: []
        });
        console.log(`Query: Routine ${routine.id} created.`);
       
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

    },

    RoutineUpdated: async (data) => {
        await collection.updateOne(
            { _id: data.id },
            { $set: { name: data.name, weekDay: data.weekDay } }
        );
        console.log(`Query: Routine ${data.id} updated.`);

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
                const existingOrder = routine.exercises[index].order;
                const updatedExercise = {
                    originalId: exercise.id,
                    order: existingOrder,
                    name: exercise.name,
                    reps: exercise.reps,
                    sets: exercise.sets
                    
                };
                await collection.updateOne(
                    { _id: exercise.routineId, "exercises.originalId": exercise.id },
                    { $set: { "exercises.$": updatedExercise } }
                );
                console.log(`Query: Exercise #${existingOrder} in routine ${exercise.routineId} updated.`);
                // const updatedExercise = { ...routine.exercises[index], ...exercise };
                // await collection.updateOne(
                //     { _id: exercise.routineId, "exercises.originalId": exercise.id },
                //     { $set: { "exercises.$": updatedExercise } }
                // )
                // console.log(`Query: Exercise ${exercise.id} in routine ${exercise.routineId} updated.`);
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

app.get('/routines/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const routine= await collection.findOne({ _id: id });
        if (routine) {
            res.send(routine);
        }else{
            res.status(404).send({ message: 'Routine not found.'});
        }
    }catch(error){
        res.status(500).send({message: 'Error searching for routine.'})
    }
});


async function startConsumer(){
    const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`;

    try{
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        const exchange = 'event_exchange';

        await channel.assertExchange(exchange, 'fanout', { durable:false})

        const q = await channel.assertQueue('query_events', { durable: true})
        channel.prefetch(1);
        console.log(`Consumer (Query) waiting for events in queue: ${q.queue}`);

        await channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, async (msg) => {
            if(msg.content){
                const event = JSON.parse(msg.content.toString());
                console.log(`Consumer (Query): Event received - ${event.type}`)

                if(functions[event.type]){
                    try{
                        await functions[event.type](event.data)
                    } catch(error){
                        console.error(`Error processing event ${event.type}:`, error);
                    }
                    
                }
                channel.ack(msg);
            }
        });
    } catch(error){
        console.error('Error in Consumer (Query):', error);
    }
}


app.listen(6001, async () => {
    console.log('Query server is running on port 6001');
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