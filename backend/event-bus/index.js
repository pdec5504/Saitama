const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
const events = [];

app.post('/events', (req, res) => {
    const event = req.body;
    events.push(event);

    // send the event to Routines service
    axios.post('http://localhost:3000/events', event).catch(err => {})
    // send the event to Exercises service
    axios.post('http://localhost:4000/events', event).catch(err => {})
    // send the event to Query service
    axios.post('http://localhost:6000/events', event).catch(err => {})
    // send the event to Analysis service
    axios.post('http://localhost:7000/events', event).catch(err => {})
    
    res.status(200).send({ status: 'OK' });
});

app.get('/events', (req, res) => {
    res.send(events);
});

app.listen(10000, () => {
    console.log('Event bus is running on port 10000');
});