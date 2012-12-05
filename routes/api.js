var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , im = require('imagemagick')
  , app = module.parent.exports;

exports.images = function (req, res) {
  fs.readdir(app.get('image_dir'), function (err, files) {
    if (err) {
      res.send(500);
    }
    res.json(files.filter(function (file) {
      return (/\.(jpg|jpeg|png)$/).test(file);
    }));
  });
};

var createGIF = function (images, callback) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(images.join(','), 'ascii');

  var filename = sha1.digest('hex') + '.gif'
    , gif_path = path.join('gifs', filename)
    , gif_fs_path = path.join(app.get('image_dir'), gif_path);

  images = images.map(function (image) { return app.get('image_dir') + image; });

  fs.mkdir(path.join(app.get('image_dir'), 'gifs'), function () {
    im.convert(['-geometry', '400x400', '-delay', 10, '-loop', 0].concat(images, gif_fs_path), function(err) {
      callback(err, gif_path);
    });
  });
};

// GET /gif?images[0]=1.jpg&images[1]=2.jpg
exports.gif = function (req, res) {
  createGIF(req.query.images, function (err, path) {
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
  createGIF(req.query.images, function (err, path) {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.json({ path: path });
    }
  });
};
