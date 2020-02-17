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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = 3000;
var app = (0, _express2.default)();
app.server = _http2.default.createServer(app);

app.use((0, _morgan2.default)('dev'));

app.use((0, _cors2.default)({
    exposedHeaders: "*"
}));

app.use(_bodyParser2.default.json({
    limit: '50mb'
}));

var WebSocket = require('ws');

app.ws = new WebSocket.Server({
    server: app.server
});

var clients = [];

app.ws.on('connection', function (socket) {

    var userId = clients.length + 1;

    socket.userId = userId;

    var newClient = {
        ws: socket,
        userId: userId
    };

    clients.push(newClient);
    console.log('New Client connected', userId);
    // listen to client
    socket.on('message', function (message) {
        // socket.send(message +""+ new Date());
        console.log('Message from', message);
    });

    socket.on('close', function () {
        console.log('Client with userId', userId, 'is disconnected');

        clients = clients.filter(function (client) {
            return client.userId !== userId;
        });
    });
});

app.get('/', function (req, res) {
    res.json({
        version: _package.version
    });
});

app.get('/api/all_connections', function (req, res, next) {
    return res.json({
        people: clients
    });
});

setInterval(function () {
    // each 3 sec the function executes
    console.log('There are', clients.length, 'clients in connection');
    if (clients.length > 0) {
        clients.forEach(function (client) {
            var msg = 'Hey ID ' + client.userId + ' this is a message from Server';
            client.ws.send(msg);
        });
    }
}, 3000);

app.server.listen(process.env.PORT || PORT, function () {
    console.log('App is running on port ' + app.server.address().port);
});

exports.default = app;
//# sourceMappingURL=index.js.map