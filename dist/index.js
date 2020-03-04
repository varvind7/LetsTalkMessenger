'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _package = require('../package.json');

var _net = require('net');

var _appRouter = require('./app-router.js');

var _appRouter2 = _interopRequireDefault(_appRouter);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _database = require('./database.js');

var _database2 = _interopRequireDefault(_database);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = 3001;
var app = (0, _express2.default)();
app.server = _http2.default.createServer(app);

app.use((0, _morgan2.default)('dev'));

app.use((0, _cors2.default)({
    exposedHeaders: "*"
}));

app.use(_bodyParser2.default.json({
    limit: '50mb'
}));

//connect to mongo Database

new _database2.default().connect().then(function (db) {
    console.log("Succesfully connected to database");
    app.db = db;
}).catch(function (err) {
    throw err;
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

app.models = new _models2.default(app);
app.routers = new _appRouter2.default(app);

var WebSocket = require('ws');

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

app.server.listen(process.env.PORT || PORT, function () {
    console.log('App is running on port ' + app.server.address().port);
});

exports.default = app;
//# sourceMappingURL=index.js.map