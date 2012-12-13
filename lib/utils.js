// Utils
var crypto = require('crypto');

exports.selectImage = function (files) {
  return files.filter(function (file) { return (/\.(jpg|jpeg|png|gif)$/).test(file); });
};

exports.filename = function (id, ext) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(id, 'ascii');
  return sha1.digest('hex') + '.' + ext;
};
