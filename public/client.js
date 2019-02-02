$( document ).ready(function() {
  var items = [];
  var itemsRaw = [];
  
  var getBooks = function getBooks() {
    $.getJSON('/api/books', function(data) {
      items = [];
      itemsRaw = data;
      $.each(data, function(i, val) {
        items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comment' + (val.commentcount !== 1 ? 's' : '') + '</li>');
        return ( i !== 14 );
      });
      if (items.length >= 15) {
        items.push('<p>...and '+ (data.length - 15)+' more!</p>');
      }
      
      $('#display').html($('<ul/>', {
        'class': 'listWrapper',
        html: items.join('')
      }));
    });
  };

  getBooks();
  $('#newBookForm, #newCommentForm').on('submit', function(e) {
    e.preventDefault();
    $('input[type="text"]').val('');
  });
  
  var comments = [];
  var bookItemClickHandler = function bookItemClickHandler() {
    $('#display').off('click', 'li.bookItem').on('click','li.bookItem',function() {
      $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
      $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
        comments = [];
        $.each(data.comments, function(i, val) {
          comments.push('<li class="comment">' +val+ '</li>');
        });
        comments.push('<form id="newCommentForm" style="margin: 20px 0 0;"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment" style="margin: 20px 0;"></form>');
        comments.push('<button class="btn btn-info addComment" id="'+ data._id+'" style="margin: 0 15px 20px 0;">Add Comment</button>');
        comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'" style="margin: 0 0 20px;">Delete Book</button>');
        $('#detailComments').html(comments.join(''));
      });
    });
  };

  bookItemClickHandler();
  
  $('#bookDetail').on('click','button.deleteBook',function() { 
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html('<p style="color: red;">'+data+'<p><!--<p>Refresh the page</p>-->');
        getBooks();
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function() {
    var newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.unshift('<li class="comment">' + newComment + '</li>'); //adds new comment to top of list
        $('#detailComments').html(comments.join(''));
        getBooks();
      }
    });
  });
  
  $('#newBook').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        if (items.length < 14) {
          $('.listWrapper').append('<li class="bookItem" id="' + items.length + '">' + data.title + ' - 0 comments</li>');
          itemsRaw.push(data);
          bookItemClickHandler();
        }
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    var shouldDelete = window.confirm('Are you sure you want to delete all books from this library?');
    if (!shouldDelete) {
      return false;
    }

    $.ajax({
      url: '/api/books',
      type: 'delete',
      //dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        $('#display, #detailTitle').html('');
        $('#detailComments').html('<p style="color: red;">' + data + '</p>');
        $('input[type="text"]').val('');
      }
    });
  });
});

