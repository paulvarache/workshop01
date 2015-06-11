var http = require('http'),
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

server.listen(3000);