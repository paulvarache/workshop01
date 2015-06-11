var http = require('http'),
    io = require('socket.io'),
    fs = require('fs');

var server = http.createServer(function (req, res) {
    var url = req.url === "/" ? "/index.html" : req.url;
    fs.readFile('.' + url, function (err, data) {
        if (err) {
            if (err.code === "ENOENT") {
                return res.end(http.STATUS_CODES["404"], 404);
            }
            return res.end(err.message, 500);
        }
        res.end(data, 200);
    });
});

io = io.listen(server.listen(3000));

var counter = 0;

io.on('connection', function (socket) {
    socket.emit('click', counter);
    socket.on('clicked', function () {
        counter++;
        io.emit('clicked', counter);
    });
});