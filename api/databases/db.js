var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(function () {
    db.run("CREATE TABLE User(username varchar(60) PRIMARY KEY, password varchar(65))")
    db.run("CREATE TABLE Car(owner varchar(60),model varchar(60) PRIMARY KEY, make varchar(100), millage INTEGER, year INTEGER, price INTEGER,photo BLOB,  FOREIGN KEY(owner) REFERENCES User(username))")
});


module.exports ={
    db
}