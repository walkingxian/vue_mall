let http = require('http');
let url = require('url');
let util = require('util');
let fs = require('fs');

http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', "text/html; charset=UTF-8");
    var pathname = url.parse(req.url).pathname;
    fs.readFile(pathname.substring(1), function(err,data) {
        if(err) {
            res.writeHead(404,{
                'Content-type':'text/html'
            })
            res.end('404');
        }else {
            res.writeHead(200,{
                'Content-type':'text/html'
            })
            res.end(data.toString());
        }

    })
}).listen(4000, '127.0.0.1', function () {
    console.log('server is running in 127.0.0.1:4000');
})