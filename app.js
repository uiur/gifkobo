var express = require('express')
  , http = require('http')
  , path = require('path');

var app = module.exports = express();

var routes = { 
    index: require('./routes/index.js')
  , api:   require('./routes/api.js')
};

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.set('image_dir', module.parent.exports.image_dir || __dirname);
  app.set('thumb_dir', path.join(app.get('image_dir'), 'thumbs'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(app.get('image_dir')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index.index);
app.get('/api/images.json', routes.api.images);
app.get('/api/thumbs.json', routes.api.thumbs);
app.get('/gif', routes.api.gif);
app.get('/gif.json', routes.api.gifJSON);

http.createServer(app).listen(app.get('port'), function(){
  console.log("GIFBREW server listening on port " + app.get('port'));
});

