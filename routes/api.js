var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , im = require('../lib/imagemagick_ext.js')
  , utils = require('../lib/utils.js')
  , app = module.parent.exports;

exports.images = function (req, res) {
  fs.readdir(app.get('image_dir'), function (err, files) {
    if (err) {
      res.send(500);
    }
    res.json(utils.selectImage(files));
  });
};

exports.thumbs = function (req, res) {
  fs.readdir(app.get('thumb_dir'), function (err, files) {
    if (err) {
      res.send(500);
    }

    files = utils.selectImage(files).map(function (file) {
      return 'thumbs/' + file; 
    });

    res.json(files);
  });
};

// GET /gif?images[0]=1.jpg&images[1]=2.jpg
exports.gif = function (req, res) {
  req.query.image_dir = app.get('image_dir');

  im.createGIF(req.query, function (err, path) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.redirect(path);
    }
  });
};

// GET /gif.json?images[0]=1.jpg&images[1]=2.jpg
// -> { path: '/gifs/hogefuga.gif' }
exports.gifJSON = function (req, res) {
  req.query.image_dir = app.get('image_dir');

  im.createGIF(req.query, function (err, path) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.json({ path: path });
    }
  });
};
