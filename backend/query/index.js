require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const authMiddleware = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

let collection;

const functions = {
    RoutineCreated: async (routine) => {
        await collection.insertOne({
            _id: routine.id,
            name: routine.name,
            weekDay: routine.weekDay,
            exercises: [],
            order: routine.order,
            userId: routine.userId
        });
        console.log(`Query: Routine ${routine.id} created for user ${routine.userId}.`);
       
    },
    RoutinesReordered: async (data) => {
        const { orderedIds, userId } = data;
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, userId: userId },
                update: { $set: { order: index } }
            }
        }));
        if (bulkOps.length > 0) {
            await collection.bulkWrite(bulkOps);
        }
        console.log("Query: Routines order updated for user.");
    },
    ExerciseAdded: async (exercise) => {
        const routine = await collection.findOne({ _id: exercise.routineId });

        if (routine && Array.isArray(routine.exercises)) {
            const order = routine.exercises.length + 1;

            const exerciseToDisplay = {
                originalId: exercise._id, 
                order: exercise.order,
                name: exercise.name,
                phases: exercise.phases,
                gifUrl: exercise.gifUrl
            };

            await collection.updateOne(
                { _id: exercise.routineId, userId: exercise.userId },
                { $push: { exercises: exerciseToDisplay } }
            );
            console.log(`Query: Exercise #${order} (${exercise.name}) added to routine ${exercise.routineId}`);
        } else {
            console.warn(`Query: Routine ${exercise.routineId} not found for exercise ${exercise.name}. Event ignored.`);
        }
    },
    RoutineAnalyzed: async (analysis) => {
        const { routineId, classification } = analysis;
        await collection.updateOne(
            { _id: routineId },
            { $set: { classification: classification } }
        );
        console.log(`Query: Routine ${analysis.routineId} classified as ${analysis.classification}`);

    },

    RoutineUpdated: async (data) => {
        await collection.updateOne(
            { _id: data.id, userId: data.userId },
            { $set: { name: data.name, weekDay: data.weekDay } }
        );
        console.log(`Query: Routine ${data.id} updated.`);

    },

    RoutineDeleted: async (data) => {
        await collection.deleteOne({ _id: data.id, userId: data.userId });
        console.log(`Query: Routine ${data.id} deleted.`);
    },

    ExerciseUpdated: async (exercise) => {
        const routine = await collection.findOne({ _id: exercise.routineId, userId: exercise.userId });
        if (routine){
            const index = routine.exercises.findIndex(ex => ex.originalId === exercise._id);
            if(index !== -1){
                const existingOrder = routine.exercises[index].order;
                const updatedExercise = {
                    originalId: exercise._id,
                    order: existingOrder,
                    name: exercise.name,
                    phases: exercise.phases,
                    gifUrl: exercise.gifUrl
                    
                };
                await collection.updateOne(
                    { _id: exercise.routineId, "exercises.originalId": exercise._id, userId: exercise.userId },
                    { $set: { "exercises.$": updatedExercise } }
                );
                console.log(`Query: Exercise #${existingOrder} in routine ${exercise.routineId} updated.`);
            }
        }
    },

    ExerciseDeleted: async (data) => {
        // const routine = await collection.findOne({ _id: data.routineId, userId: data.userId });
        // if (routine && Array.isArray(routine.exercises)){
        //     const remaningExercises = routine.exercises.filter(ex => ex.originalId !== data.id);
        //     const reorderedExercises = remaningExercises.map((exercise, index) => {
        //         return { ...exercise, order: index };
        //     });
        //     await collection.updateOne(
        //         { _id: data.routineId, userId: data.userId },
        //         { $set: { exercises: reorderedExercises } }
        //     )
        //     console.log(`Query: Exercise ${data.id} in routine ${data.routineId} deleted.`);
        // }

        const result = await collection.updateOne(
            { _id: data.routineId, userId: data.userId },
            { $pull: { exercises: { originalId: data.id } } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Query: Exercise ${data.id} in routine ${data.routineId} deleted.`);
        } else {
            console.log(`Query: Could not find routine ${data.routineId} for user ${data.userId} to delete exercise ${data.id}.`);
        }
    },

    ExercisesReordered: async (data) => {
        const { routineId, orderedIds, userId } = data;
        const routine = await collection.findOne({ _id: routineId, userId: userId });

        if (routine && Array.isArray(routine.exercises)) {
            const exercisesMap = new Map(routine.exercises.map(ex => [ex.originalId, ex]));
            
            const reorderedExercises = orderedIds.map((id, index) => {
                const exercise = exercisesMap.get(id);
                if (exercise) {
                    return { ...exercise, order: index };
                }
                return null;
            }).filter(Boolean);

            await collection.updateOne(
                { _id: routineId, userId: userId },
                { $set: { exercises: reorderedExercises } }
            );
            console.log(`Query: Exercises order updated for routine ${routineId}.`);
        }
    }
};

app.get('/routines', authMiddleware, async (req, res) => {
    const routines = await collection.find({userId:req.user.id}).sort({ order: 1 }).toArray();
    res.status(200).send(routines);
});

app.get('/routines/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try{
        const routine= await collection.findOne({ _id: id, userId: req.user.id });
        if (routine) {
            res.send(routine);
        }else{
            res.status(404).send({ message: 'Routine not found.'});
        }
    }catch(error){
        res.status(500).send({message: 'Error fetching routine.'})
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