var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , im = require('imagemagick')
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

var createGIF = function (args, callback) {
  var images = args.images.map(function (image) { return app.get('image_dir') + image; })
    , delay = args.delay || 10
    , size = args.size || 400;

  var sha1 = crypto.createHash('sha1');
  sha1.update(images.join(',') + '-' + delay + '-' + size, 'ascii');

  var filename = sha1.digest('hex') + '.gif'
    , gif_path = path.join('gifs', filename)
    , gif_fs_path = path.join(app.get('image_dir'), gif_path);

  im.convert(['-geometry', size + 'x' + size, '-delay', delay, '-loop', 0].concat(images, gif_fs_path), function(err) {
    callback(err, gif_path);
  });
};

// GET /gif?images[0]=1.jpg&images[1]=2.jpg
exports.gif = function (req, res) {
  createGIF(req.query, function (err, path) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.redirect(path);
    }
  });
};

// GET /gif.json?images[0]=1.jpg&images[1]=2.jpg
exports.gifJSON = function (req, res) {
  createGIF(req.query, function (err, path) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.json({ path: path });
    }
  });
};
