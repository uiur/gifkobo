$(function () {
  var image_template = _.template($('#image_template').text());

  $.get('/api/images.json')
   .success(function (data) {
     _.each(data, function (file) {
       $("#images").append(image_template({ path: file }));
     });
   });

  var selected_images = [];

  $('#images').on('click', '.image', function () {
    var $image = $(this)
      , src = $image.attr('src');

    if ($image.hasClass('image_selected')) {
      selected_images.splice(selected_images.indexOf(src), 1);
      $image.removeClass('image_selected');
    } else {
      selected_images.push(src);
      $image.addClass('image_selected');
    }

    $('#debug').text(selected_images.join(', '));
  });

  var gif_template = _.template($('#gif_template').text())
    , gif_loading = false
    , $loader = $('#loader');

  $('#get_gif').click(function (e) {
    e.preventDefault();

    if (!gif_loading) {
      gif_loading = true;
      $loader.show();

      $.get('/gif.json?' + $.param({ images: selected_images }))
      .success(function (data) {
        gif_loading = false;
        $loader.hide();

        $('#gifs').append(gif_template(data));
      });
    }
  });
});
