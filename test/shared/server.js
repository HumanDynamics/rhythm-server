var MongoClient = require('mongodb').MongoClient;
var db;

exports.load = function(app) {
  before(function(done) {
    MongoClient.connect('mongodb://localhost:27017/breakout').then(function(database) {
      db = database;
    })

    this.server = app.listen(3000)
    this.server.once('listening', done);

  })

  after(function(done) {
    db.dropDatabase().then(function() {
      db.close();
      done();
    });
  });
}


