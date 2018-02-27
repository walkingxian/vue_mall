let http = require('http');
let url = require('url');
let util = require('util');

http.createServer(function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type',"text/plain; charset=UTF-8");
    console.log(req.url)

    res.end(util.inspect(url.parse(req.url)));
}).listen(3000,'127.0.0.1',function(){
    console.log('server is running in 127.0.0.1:3000');
})