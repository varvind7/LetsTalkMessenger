import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {version} from '../package.json';
import { createConnection } from 'net';
import Approuter from './app-router.js';
import Model from './models'
import Database from './database.js';
import { Db } from 'mongodb';

const PORT = 3001;
const app = express();
app.server = http.createServer(app);


//app.use(morgan('dev'));


app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

//connect to mongo Database

new Database().connect().then((db) => {
    console.log("Succesfully connected to database");
    app.db = db;

}).catch((err) => {
    throw(err);
});

/*
new Database().connect((err, db) => {
    if(err){
        throw(err);
    }
    console.log("Successful connected to database. ");
    app.db = db;
}); */
//End connect to mongo db

app.models = new Model(app);
app.routers = new Approuter(app);

const WebSocket = require('ws');

app.ws = new WebSocket.Server({
    server: app.server
});

/*
let clients = [];

app.ws.on('connection', (socket) => {

    const userId = clients.length + 1;

    socket.userId = userId;
    
    const newClient = {
        ws: socket,
        userId: userId,
    };

    clients.push(newClient);
    console.log('New Client connected', userId);
    // listen to client
    socket.on('message', (message) => {
        // socket.send(message +""+ new Date());
        console.log('Message from', message);
    });

    socket.on('close', () => {
        console.log('Client with userId', userId, 'is disconnected');

        clients = clients.filter((client) => client.userId !== userId);
    });
});


app.get('/', (req, res) => {
    res.json ({
        version: version 
    }) 
});

app.get('/api/all_connections', (req, res, next) => {
    return res.json({
        people: clients,
    })
});

setInterval(() => {
    // each 3 sec the function executes
    console.log('There are', clients.length ,'clients in connection');
    if(clients.length > 0) {
        clients.forEach((client) => {
            const msg = `Hey ID ${client.userId} this is a message from Server`;
            client.ws.send(msg);
        });
    }
}, 3000)
*/

app.server.listen(process.env.PORT || PORT, () => {
        console.log(`App is running on port ${app.server.address().port}`);
});

export default app;