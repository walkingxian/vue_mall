let http = require('http');


function getBaidu() {
    return new Promise(function(resolve, reject) {
        http.get('http://www.baidu.com/', function (res) {
            let data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            })
        });
    })
}

http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', "text/html; charset=UTF-8");
    getBaidu().then(function(data) {
        res.end(data);
    })
}).listen(5000, '127.0.0.1', function () {
    console.log('server is running in 127.0.0.1:5000');
})


