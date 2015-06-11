var http = require('http'),
    io = require('socket.io'),
    fs = require('fs'),
    path = require('path');

var cache = {};

var staticServer = http.createServer(function (req, res) {
    if (req.url === '/') req.url = "/index.html";
    if (req.url in cache) return res.end(cache[req.url], 200);
    fs.readFile(path.join('../wclient', req.url), function (err, data) {
        if (err && err.code === 'ENOENT') return res.end("Not Found", 404);
        cache[req.url] = data;
        res.end(data, 200);
    });
});

var server = http.createServer(function (req, res) {res.end("OK", 200)});

var users = {},
    diffToWin = {
        red: 10,
        blue: 10
    },
    playing = true;

io = io.listen(server.listen(3000));
staticServer.listen(3001);

function notify() {
    var count = Object.keys(users).reduce(function (total, key) {
        total[users[key].team] += users[key].clicks;
        return total;
    }, {blue: 0, red: 0});
    var diffRed = (count.red - count.blue) / diffToWin.red,
        diffBlue = (count.blue - count.red) / diffToWin.blue;

    io.emit('update', {red: diffRed, blue: diffBlue});

    if (diffBlue === 1 || diffRed === 1) {
        if (diffBlue === 1)
            io.emit('win', 'blue');
        else
            io.emit('win', 'red');
        playing = false;
        for (var key in users) {
            users[key].clicks = 0;
        }
        setTimeout(function () {
            playing = true;
            io.emit('update', {red: 0, blue: 0})
        }, 5000);
    }
}

io.on('connection', function (socket) {
    var user = null;

    socket.on('user', function (info) {
        user = {};
        user.id = socket.id;
        user.name = info.name;
        team = 'red';

        count = Object.keys(users).reduce(function (total, key) {
            total.blue += users[key].team === 'blue';
            total.red += users[key].team === 'red';
            return total;
        }, {blue: 0, red: 0});

        if (count.red > count.blue) team = "blue";

        user.team = team;
        user.clicks = 0;

        diffToWin[user.team] += 4;

        console.log(user.name, " Joined");

        users[socket.id] = user;
        socket.emit('init', {users: users, user: user});
    });

    socket.on('click', function () {
        if (!playing) return;
        var player = users[this.id];
        console.log("user :" + user.name + " clicked");
        user.clicks++;
        notify();
    });

    socket.on('disconnect', function () {
        if (!users[socket.id]) return;
        diffToWin[users[socket.id].team] -= 4;
        delete users[socket.id];
        delete user;
    });
});