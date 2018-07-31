module.exports = function ( RED ) {
  "use strict";
  var fs = require("fs");
  var path = require("path");

  const imagesDir = "/root/userdir/images"
  const imageMimeTypes = [
    {
      mime: 'image/jpeg',
      exts: ['.jpeg', '.jpg']
    },
    {
      mime: 'image/png',
      exts: ['.png']
    },
    {
      mime: 'image/gif',
      exts: ['.gif']
    },
    {
      mime: 'image/bmp',
      exts: ['.bmp']
    },
    {
      mime: 'image/webp',
      exts: ['.webp']
    }
  ]

  function main(n){
    RED.nodes.createNode(this, n);
    this.picture = n.picture;
    this.picture_name = n.picture_name;
    var node = this;
    this.on("input", function(msg) {
      var picture = node.picture;
      if(typeof msg.picture !== "undefined" && msg.picture !== ""){
        picture = msg.picture;
      }
      if(picture !== ""){
        msg.picture = path.resolve(imagesDir, picture);
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType("picturepicker", main);

  function getPicture(p){
    return (new Promise(resolve => {
      fs.readFile(p, (err, data) => {
        if(err) { resolve(null) }
        else {
          let pathInfo = path.parse(p)
          let mime = imageMimeTypes.filter( i => i.exts.indexOf(pathInfo.ext.toLowerCase()) !== -1)
          if(mime.length < 1){
            resolve(null)
          } else {
            resolve({
              data: data.toString('base64'),
              path: p,
              name: pathInfo.name,
              mime_type: mime[0].mime
            })
          }
        }
      });
    }))
  }

  RED.httpAdmin.get("/picture/list", function(req, res) {
    fs.readdir(imagesDir, function(err, filesImages){
      var promisesImages = []
      for(var f in filesImages){
        promisesImages.push(getPicture(path.join(imagesDir, filesImages[f])))
      }

      Promise.all(promisesImages).then( dataImages => {
        dataImages = dataImages.filter(d => d)
        res.send(dataImages)
      })
    });
  });
}
