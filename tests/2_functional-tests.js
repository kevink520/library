/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  /*test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });*/
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {
    var bookIdPromise = new Promise(function(resolve, reject) {
      suite('POST /api/books with title => create book object/expect book object', function() {      
        test('Test POST /api/books with title', function(done) {
          chai.request(server)
            .post('/api/books')
            .send({ title: 'Test Book' })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, '_id', 'Book object should contain _id');
              assert.property(res.body, 'title', 'Book object should contain title');
              resolve(res.body._id);
              done();
            });
        });
      
        test('Test POST /api/books with no title given', function(done) {
          chai.request(server)
            .post('/api/books')
            .send({})
            .end(function(err, res) {
              assert.equal(res.status, 400);
              assert.deepEqual(res.body, {});
              done();
            }); 
        });      
      });
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            if (res.body.length > 0) {   
              assert.isObject(res.body[0], 'books in array should br objects');
              assert.property(res.body[0], '_id', 'Books in array should contain _id');
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount'); 
            }

            done();
          });
      });            
    });

    bookIdPromise.then(function(bookId) {
      suite('GET /api/books/[id] => book object with [id]', function(){
      
        test('Test GET /api/books/[id] with id not in db',  function(done){
          chai.request(server)
            .get('/api/books/notindb')
            .end(function(err, res) {
              assert.equal(res.status, 404);
              assert.deepEqual(res.body, {});
              done();
            });
        });
      
        test('Test GET /api/books/[id] with valid id in db',  function(done){
          chai.request(server)
            .get('/api/books/' + bookId)
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, '_id', 'book object should contain _id');
              assert.equal(res.body._id, bookId);
              assert.property(res.body, 'title', 'book object should contain title');
              assert.equal(res.body.title, 'Test Book');
              assert.property(res.body, 'comments', 'book object should contain comments');
              assert.isArray(res.body.comments, 'comments should be an array');
              done();
            });
        });      
      });


      suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
        test('Test POST /api/books/[id] with comment', function(done){
          chai.request(server)
            .post('/api/books/' + bookId)
            .send({ comment: 'Test comment' })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, '_id', 'book object should contain _id');
              assert.equal(res.body._id, bookId);
              assert.property(res.body, 'title', 'book object should contain title');
              assert.equal(res.body.title, 'Test Book');
              assert.property(res.body, 'comments', 'book object should contain comments');
              assert.isArray(res.body.comments, 'comments should be an array');
              assert.equal(res.body.comments[0], 'Test comment');
              done();
            });  
        });
      });;
    });
  });
});

