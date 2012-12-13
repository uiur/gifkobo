var im = require('imagemagick')
  , crypto = require('crypto')
  , path = require('path');

im.createGIF = function (args, callback) {
  var images = args.images || []
    , delay = args.delay || 10
    , size = args.size || 400
    , image_dir = args.image_dir || './';

  if (images.length === 0) {
    throw new TypeError('images are empty');
  }

  images = images.map(function (image) { return image_dir + image; });

  var sha1 = crypto.createHash('sha1');
  sha1.update(images.join(',') + '-' + delay + '-' + size, 'ascii');

  var filename = sha1.digest('hex') + '.gif'
    , gif_path = path.join('gifs', filename)
    , gif_fs_path = path.join(image_dir, gif_path);

  im.convert(['-geometry', size + 'x' + size, '-delay', delay, '-loop', 0].concat(images, gif_fs_path), function(err) {
    callback(err, gif_path);
  });
};

im.generateThumb = function (args, callback) {
  var size = args.size || 100;

  im.convert(['-geometry', size + 'x' + size, args.from, args.to], callback);
};

module.exports = im;
