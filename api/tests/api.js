/**============================== api imports  ==============================*/
var expect = require('chai').expect;
require('dotenv').config({
    path: '../config/vars.env',
    encoding: 'utf8'
})
const cryptoRandomString = require('crypto-random-string');

process.env.SECRET = cryptoRandomString({
    length: 10,
    type: 'url-safe'
});
var port = process.env.PORT
console.log(`Server Port ${port}`)
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../js/api');
let should = chai.should();
let authToken = ''
let request = require('supertest')
/**============================== unit tests  ==============================*/

chai.use(chaiHttp);

describe('/POST user', () => {
    it('should register a user', (done) => {
        chai.request(server)
            .post('/register')
            .send({
                "username": "sphamandla",
                "password": "123456789"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error').eql('Sign-up succesfull');
                done();
            });
    })
})
var authenticatedUser = request.agent(server);

describe('/GET login', () => {
    it('should login a user', (done) => {
        chai.request(server)
            .get('/login')
            .send({
                "username": "sphamandla",
                "password": "123456789"
            })
            .end((err, res) => {
                authToken = res.body.token
                console.log('returned token: ', authToken)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Authentication successful!');
                done();
            });
    })
})
describe('/POST car', () => {
    it('should register a car', (done) => {
        chai.request(server)
            .post('/registercar')
            .set('authorization', 'Bearer ' + authToken)
            .send({
                "username": "sphamandla",
                "make": "toyota",
                "model": "yaris",
                "millage": 1234,
                "year": 123123,
                "price":123123
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error').eql('Succesfully uploaded car');
                done();
            });
    })
})

describe('/GET get a car', () => {
    it('should get a car', (done) => {
        chai.request(server)
            .get('/getcar')
            .set('authorization', 'Bearer ' + authToken)
            .send({
                "username": "sphamandla",
                "make": "toyota",
                "model": "yaris"
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success').eql(true);
                done();
            });
    })
})

describe('/GET get all user cars', () => {
    it('should get all user cars', (done) => {
        chai.request(server)
            .get('/getcars')
            .set('authorization', 'Bearer ' + authToken)
            .send({
                "username": "sphamandla"
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('cars').should.be.a('object');
                done();
            });
    })
})


describe('/POST remove car', () => {
    it('remove a user registered car', (done) => {
        chai.request(server)
            .post('/removecar')
            .set('authorization', 'Bearer ' + authToken)
            .send({
                "username": "sphamandla",
                "make": "toyota",
                "model": "yaris"
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success').eql(true);
                done();
            });
    })
})