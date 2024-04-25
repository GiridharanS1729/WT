var http=require('http')
var url=require('url')
var querystring=require('querystring')
var util=require('util')

http.createServer(function(req,res){
    var path=url.parse(req.url).pathname;
    var query=url.parse(req.url).query;
    var p=parseInt(querystring.parse(query)["principal"]);
    var r=parseInt(querystring.parse(query)["rate"])/100;
    var n=parseInt(querystring.parse(query)["compounding"]);
    var t=parseInt(querystring.parse(query)["time"]);
    const ci = p * Math.pow(1 + r / n, n * t) - p;
    const tot = p + ci;
    res.write("Principal Amount="+p+"\nRate="+(r*100)+"%\nFrequency="+n+" months\nTime="+t+" years\nCompound Interest="+ci.toFixed(2)+"\n"+ "Total Amount="+tot.toFixed(2));
    res.end()
}).listen(4000);
console.log("starting")
util.log("server is running in http://localhost:4000/");