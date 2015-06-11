var fs = require('fs');

fs.readFile('./index.html', function (err, content) {
    if (err) throw err;
    console.log(content.toString());
});
console.log("Potato");