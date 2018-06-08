module.exports = function ( RED ) {
  "use strict";
  var fs = require("fs");
  function main ( config ) {
    RED.nodes.createNode( this, config );
    this.picture = config.picture;
    var node = this;
    this.on("input", function(msg) {
      var picture = node.picture;
      if(typeof(msg.picture) != "undefined" && msg.picture != ""){picture = msg.picture;}
      if(picture != ""){
        msg.picture = picture;
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType("picturepicker", main);

  RED.httpAdmin.get("/picture/list", function(req, res) {
    fs.readdir(__dirname + "/icons/",function(err, files){
      var tabPics = [];
      var i = 0;
      for(var f in files){
        tabPics[i] = [];
        tabPics[i].push("/icons/" + files[i]);
        tabPics[i].push(__dirname + "/icons/" + files[i]);
        i++;
      }
      res.send(tabPics);
    });
  });
}
