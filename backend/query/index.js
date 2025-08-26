require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');

const app = express();
app.use(cors());
app.use(express.json());

const base = {}; //base consulta

// let routineCounter = 0;

const functions = {
    RoutineCreated: (routine) => {
        // add labels to routines if needed (A, B, C, ...)
        // const routineLabel = `${String.fromCharCode(65 + routineCounter)}`
        // routineCounter++;

        base[routine.id] = { ...routine, exercises: [] };
        console.log(`Query: Routine ${routine.id} created.`);
        // add labels to routines if needed (A, B, C, ...)
        // base[routine.id] = { ...routine, label: routineLabel, exercises: [] };
        // console.log(`Query: Routine ${routine.id} created and labeled as ${routineLabel}`);
    },
    ExerciseAdded: (exercise) => {
        const routine = base[exercise.routineId];
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

            routine.exercises.push(exerciseToDisplay);
            console.log(`Query: Exercise #${order} (${exercise.name}) added to routine ${exercise.routineId}`);
        } else {
            console.warn(`Query: Routine ${exercise.routineId} not found for exercise ${exercise.name}. Event ignored.`);
        }
    },
    RoutineAnalyzed: (analysis) => {
        const { routineId, classification } = analysis;
        const routine = base[analysis.routineId];

        if (routine){
            // routine.classification = analysis.classification;
            base[routineId] = { ...routine, classification: classification};
            console.log(`Query: Routine ${analysis.routineId} classified as ${analysis.classification}`);
        }
    },

    RoutineUpdated: (routine) => {
        base[routine.id] = routine;
        console.log(`Query: Routine ${routine.id} updated.`);
    },

    RoutineDeleted: (routine) => {
        delete base[routine.id]
        console.log(`Query: Routine ${routine.id} deleted.`);
    }
};

app.get('/routines', (req, res) => {
    res.status(200).send(base);
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


app.listen(6000, () => {
    console.log('Query server is running on port 6000')
    startConsumer();
})