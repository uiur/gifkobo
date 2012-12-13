// Utils
exports.selectImage = function (files) {
  return files.filter(function (file) { return (/\.(jpg|jpeg|png|gif)$/).test(file); });
};
