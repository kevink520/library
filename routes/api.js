/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

require('dotenv').config();
var expect = require('chai').expect;
//var MongoClient = require('mongodb').MongoClient;
//var ObjectId = require('mongodb').ObjectId;
//const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
var mongoose = require('mongoose');

mongoose.connect(process.env.DB, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var bookSchema = new Schema({
  title: String,
  commentcount: Number,
  comments: [String],
});

var Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, function(err, books) {
        if (err) {
          return res.send('error retrieving books');
        }

        res.json((books || []).map(function(book) {
          return {
            _id: book._id,
            title: book.title,
            commentcount: book.commentcount,
          };
        }));
      });
    })
    
    .post(function (req, res) {
      var title = (req.body || {}).title;
      //response will contain new book object including atleast _id and title
      if (!req.body || (title || '').trim() === '') {
        return res.status(400).send('no book exists');
      }

      var book = new Book({
        title: title,
        commentcount: 0,
        comments: [],
      });

      book.save(function(err, book) {
        if (err) {
          return res.send('could not save book');
        }

        res.json({
          _id: book._id,
          title: book.title,
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, function(err) {
        if (err) {
          return res.send('error deleting all books');
        }

        res.send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, function(err, book) {
        if (err) {
          return res.status(404).send('no book exists');
        }

        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      if (!req.body) {
        return res.sendStatus(400);
      }

      if ((comment || '').trim() === '') {
        return res.send('missing comment');
      }

      Book.findByIdAndUpdate(bookid, {
        $push: {
          comments: comment,
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
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, function(err, book) {
        if (err) {
          return res.send('no book exists');
        }

        res.send('delete successful');
      });
    });
  
};
