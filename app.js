// https://ict.swisscom.ch/2015/12/move-with-your-mongodb-node-js-into-the-cloud/
var config = require("./config/env");

var express = require("express"); 
var app = express();
var mongoClient = require("mongodb").MongoClient;
var assert = require("assert");

console.log(__dirname);
app.use(express.static(__dirname + "/static", {
      dotfiles: "ignore",
      etag: true,
      extensions:false,
      falltrhrough:true,
      index:"index.html",
      lastModified:true,
      maxAge: 0, // 30*60000, // 30 minutes
      redirect:true
   })
);

app.get("/html/todo/list", function(req, res) {
  //mongoClient.connect("mongodb://localhost:27017/todoDB", 
  mongoClient.connect(config.todoDB.uri, 
      function(err, db) {
        assert.equal(err, null);

        res.writeHead(200, {"Content-Type" : "text/html"}); 
        res.write("<html><body>");
        res.write("<h1>TODO's</h1>");
        res.write("<ul>");
        
        var collection = db.collection("todos");
        collection.find({}).each(function(err,obj) {
          if( obj ) {
            assert.equal(err, null);
            res.write("<li>");
            res.write(obj.name);
            res.write("</li>");
            return true;
          } else {
            res.write("</ul>");
            res.write("</body></html>");
            res.end();
            db.close() ;
            return false;
          }
        });
        
      });
});

//var port = process.env.PORT || 3000;
//app.listen(port);

app.listen(config.server.port, function() {
  console.log("server starting host ", config.server.port);
});
