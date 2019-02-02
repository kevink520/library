'use strict';

require('dotenv').config();
var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');
var helmet      = require('helmet');
var mongoose    = require('mongoose');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();
app.use(helmet({
  noCache: true,
  hidePoweredBy: {
    setTo: 'PHP 4.2.0',
  },
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var bookSchema = new Schema({
  title: String,
  commentcount: Number,
  comments: [String],
});

var Book = mongoose.model('Book', bookSchema);

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

app.route('/api/books')
  .post(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    if ((req.body.title || '').trim() === '') {
      return res.send('missing title field');
    }

    var book = new Book({
      title: req.body.title,
      commentcount: 0,
      comments: [],
    });

    book.save(function(err, book) {
      if (err) {
        return res.send('could not save book');
      }

      res.json({
        title: book.title,
        _id: book._id,
      });      
    });
  })
  .get(function(req, res) {
    Book.find({}, function(err, books) {
      if (err) {
        return res.send('error retrieving books');
      }

      res.json((books || []).map(function(book) {
        return {
          title: book.title,
          _id: book._id,
          commentcount: book.commentcount,
        };
      }));
    });
  })
  .delete(function(req, res) {
    Book.deleteMany({}, function(err) {
      if (err) {
        return res.send('error deleting all books');
      }
      
      res.send('complete delete successful');
    });
  });

app.route('/api/books/:_id')
  .get(function(req, res) {
    Book.findById(req.params._id, function(err, book) {
      if (err) {
        return res.send('no book exists');
      }

      res.json({
        title: book.title,
        _id: book._id,
        comments: book.comments,
      });
    });
  })
  .post(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    if ((req.body.comment || '').trim() === '') {
      return res.send('missing comment');
    }

    Book.findByIdAndUpdate(req.params._id, {
      $push: {
        comments: req.body.comment,
      },
      $inc: {
        commentcount: 1,
      },
    }, {
      new: true,
    }, function(err, book) {
      if (err) {
        return res.send('no book exists');
      }

      res.json({
        title: book.title,
        _id: book._id,
        comments: book.comments,
      });
    });
  })
  .delete(function(req, res) {
    Book.findByIdAndDelete(req.params._id, function(err, book) {
      if (err) {
        return res.send('no book exists');
      }

      res.send('delete successful');
    });
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + (process.env.PORT || 3000));
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
