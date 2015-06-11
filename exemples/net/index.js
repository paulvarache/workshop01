var net = require('net');

var clients = {};

function onConnection (client) {
    var id = Date.now();
    clients[id] = client;
    console.log("Client " + id + " connected");
    client.write('Hello you\n');
    client.on('data', onMessage);
    client.on('end', onDisconnect);
}

function onMessage(data) {
    for (var key in clients) {
        clients[key].write(data);
    }
}

function onDisconnect() {
    delete clients[id];
}

var server = net.createServer(onConnection);

server.listen(3000);