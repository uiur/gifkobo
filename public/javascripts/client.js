// gif simulator on canvas
var GifSim = (function(){
  var that = {};

  var canvas, ctx;
  var images = [], delay, current = 0, timer;

  that.init = function () {
    canvas = $('#gif_sim')[0];
    ctx = canvas.getContext("2d");
    that.start();
  };

  that.start = function () {
    if (images.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    timer = setInterval(function () {
      if (current >= images.length) {
        current = 0;
      }

      var image = images[0]
        , larger = _.max([image.width, image.height]);

      if (image.width > image.height) {
        ctx.drawImage(images[current], 0, 0, canvas.width, image.height * (canvas.height / larger));
      } else {
        ctx.drawImage(images[current], 0, 0, image.width * (canvas.width / larger), canvas.height);
      }

      current++;
    }, delay * 10);
  };

  that.reset = function () {
    clearInterval(timer);
  };

  that.update = function (args) {
    that.reset();

    that.updateImages(args.images);
    delay = args.delay || 10;

    that.start();
  };

  that.updateImages = function (srcs) {
    images = srcs.map(function (src) {
      var image = new Image();
      image.src = src;
      return image;
    });
  };

  return that;
}());

$(function () {
  GifSim.init();

  var image_template = _.template($('#image_template').text());

  $.get('/api/thumbs.json')
   .success(function (data) {
     _.each(data, function (file) {
       $("#images").append(image_template({ path: file }));
     });
   });

  var selected_images = [];

  $('#images').on('click', '.image', function () {
    var $image = $(this)
      , src = $image.attr('src').split('/').pop();

    if ($image.hasClass('image_selected')) {
      selected_images.splice(selected_images.indexOf(src), 1);
      $image.removeClass('image_selected');
    } else {
      selected_images.push(src);
      $image.addClass('image_selected');
    }

    GifSim.update({ images: selected_images, delay: $gif_delay.val() });
  });

  var gif_template = _.template($('#gif_template').text())
    , gif_loading = false
    , $loader = $('#loader')
    , $gif_delay = $('#gif_delay')
    , $gif_delay_value = $('#gif_delay_value')
    , $gif_size = $('#gif_size');

  $('#get_gif').click(function (e) {
    e.preventDefault();

    if (selected_images.length > 0 && !gif_loading) {
      gif_loading = true;
      $loader.show();

      $.get('/gif.json?' + $.param({ images: selected_images, delay: $gif_delay.val(), size: $gif_size.val() }))
      .success(function (data) {
        gif_loading = false;
        $loader.hide();

        $('#gifs').append(gif_template(data));
      });
    }
  });

  $('#dropbox').on('drop', function (e) {
    e.preventDefault();

    var form_data = new FormData();
    var files = e.originalEvent.dataTransfer.files;

    if (files && files.length > 0) {
      var file = files[0];
      form_data.append('image_file', file);
    } else {
      var image_url = e.originalEvent.dataTransfer.getData('text/plain');
      if (!image_url) {
        var node = $(e.originalEvent.dataTransfer.getData('text/html'));
        image_url = $("<div>").append(node).find('img').attr('src');
      }

      form_data.append("image_url", image_url);
    }
    
    $.ajax({
      url: '/api/upload.json'
    , type: 'POST'
    , data: form_data
    , processData: false
    , contentType: false
    , dataType: 'json'
    }).success(function (data) {
      $("#images").append(image_template({ path: data.path }));
    });

  }).on('dragenter', function (e) {
    e.preventDefault();
  }).on('dragover', function (e) {
    e.preventDefault();
  });

  $gif_delay_value.text($gif_delay.val() * 10);
  $gif_delay.change(_.throttle(function () {
    $gif_delay_value.text($gif_delay.val() * 10);
  }, 100));

  $gif_delay.change(_.debounce(function () {
    GifSim.update({ images: selected_images, delay: $gif_delay.val() });
  }, 100));
});
