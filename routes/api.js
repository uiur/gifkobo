var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , im = require('../lib/imagemagick_ext.js')
  , utils = require('../lib/utils.js')
  , request = require('request')
  , app = module.parent.exports;

function typeToExt (type) {
  if (type === 'image/png') {
    return 'png';
  } else if (type === 'image/gif') {
    return 'gif';
  } else if (type === 'image/jpeg') {
    return 'jpg';
  }

  return undefined;
}

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

exports.upload = function (req, res) {
  var file = req.files;

  if (file && file.image_file) {
    var ext = typeToExt(file.image_file.type)
      , filename = utils.filename(file.image_file.path, ext)
      , image_path = path.join(app.get('image_dir'), filename);

    fs.rename( file.image_file.path, image_path, function (err) {
      if (err) {
        res.send(500);
        return;
      }

      res.json({ path: filename });
    });
  } else if (req.body.image_url) {
    request.get({
      url: req.body.image_url
    , encoding: null
    }, function (err, response, body) {
      if (err || response.statusCode !== 200) {
        res.send(500);
        return;
      }

      var ext = typeToExt(response.headers['content-type']);
      if (!ext) {
        res.send(400, 'Bad Request');
        return;
      }

      var filename = utils.filename(req.body.image_url, ext)
        , image_path = path.join(app.get('image_dir'), filename);

      fs.writeFile(image_path, body, function (err) {
        if (err) {
          res.send(500);
          return;
        }

        res.json({ path: filename });
      });
    });
  } else {
    res.send(400, 'Bad Request');
  }
};
