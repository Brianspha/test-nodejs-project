/**================================================== Pre-reqs initialisation ================================================== **/
require('dotenv').config({
    path: '../config/vars.env',
    encoding: 'utf8'
})
const crypto = require('crypto')
const Joi = require("@hapi/joi");
var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const middleware = require('./middleware');
const secret = config.secret
db.serialize(function () {
    db.run("CREATE TABLE User(username varchar(60) PRIMARY KEY, password varchar(65))")
    db.run("CREATE TABLE Car(owner varchar(60),model varchar(60) PRIMARY KEY, make varchar(100), millage INTEGER, year INTEGER, price INTEGER,photo BLOB,  FOREIGN KEY(owner) REFERENCES User(username))")
});
/**============================== class definition ==============================*/

class HandlerGenerator {
    async login(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        if (username && password) {
            var registered = await Promise.resolve(verifyUserRegistered({
                "username": username,
                "password": password
            }))

            console.log("user registered?: ", registered)
            if (registered) {
                let token = jwt.sign({
                        username: username
                    },
                    secret, {
                        expiresIn: '1h' // expires in 1 hour
                    }
                );
                var car = await Promise.resolve(getUserCars(req.body))
                console.log("car details: ", car)
                // return the JWT token for the future API calls
                res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token,
                    car: car
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }
    }
    index(req, res) {
        res.json({
            success: true,
            message: 'Index page'
        });
    }
}
/**============================== Functions ==============================*/
async function registerUser(user) {
    console.log("user to register: ", user)
    return Promise.resolve(checkAndRegister(user))

}
async function checkAndRegister(user) {
    var passwordHash = createHash(user.password)
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM User where username='${user.username}'`, (err, userTemp) => {
            console.log("user: ", userTemp)
            if (!userTemp) {
                console.log('adding new user')

                db.run(`REPLACE INTO user (username,password) VALUES('${user.username}','${passwordHash}')`)
                resolve({
                    "success": true
                })
            } else {
                resolve({
                    "success": false
                })
            }
        })
    })
}

function createHash(password) {
    var hash = crypto.createHash('sha256')
        .update(password)
        .digest('hex');
    return hash
}
async function verifyUserRegistered(user) {
    console.log('checking: ', user)
    db.all("select * from User", (err, rows) => {
        console.log(rows)
    })
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM User where username='${user.username}'`, (err, userTemp) => {
            console.log('userTemp: ', userTemp)
            if (!userTemp) {
                resolve(false)
            } else {
                var passwordHash = createHash(user.password)
                console.log(passwordHash, userTemp.password)
                resolve(passwordHash === userTemp.password)
            }
        })
    })
}

async function getUserCars(user) {
    db.all('Select * from Car', (err, rows) => {
        console.log("cars: ", rows)
    })
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Car where owner='${user.username}'`, (err, cars) => {
            if (!cars) {
                resolve({})
            } else {
                resolve(cars)
            }
        })
    })
}
async function uploadCar(car) {
    db.all('Select * from Car', (err, rows) => {
        console.log(rows)
    })
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO Car (owner,model,make,millage,year,price) VALUES('${car.username}','${car.model}','${car.make}','${car.millage}','${car.year}','${car.price}')`, [], (err) => {
            if (err) {
                resolve(false)

            } else {
                resolve(true)
            }
        })
    })
}

async function getCar(car) {
    db.all('Select * from Car', (err, rows) => {
        console.log(rows)
    })
    return new Promise((resolve, reject) => {
        db.get(`Select * from Car where model='${car.model}' AND make='${car.make}'`, (err, car) => {
            if (!car) { //sometimes undefined so just return an empty object
                resolve({})
            } else {
                resolve(car)
            }
        })
    })
}

async function removeCar(car) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE From Car where model='${car.model}' AND make='${car.make}'`, async (err, ok) => {
            console.log('ok: ', ok)
            var queryCar = await Promise.resolve(getCar(car)) //@dev query car to check if it has been removed
            console.log('car removed: ', queryCar)
            if (!queryCar) { //sometimes undefined so just return an empty object
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}
/**============================== Schema Functions ==============================*/
function verifySignupSchema(user) {
    const schema = Joi.object()
        .keys({
            username: Joi.string()
                .alphanum()
                .min(6)
                .max(60)
                .required(),
            password: Joi.string()
                .alphanum()
                .min(8)
                .max(14)
                .required()
        })
        .with("username", ["password"]);

    try {
        const result = schema.validate(user);
        return !result.error;
    } catch (err) {
        return false;
    }
}

function verifyCarSchema(car) {
    const schema = Joi.object()
        .keys({
            username: Joi.string()
                .alphanum()
                .min(6)
                .max(60)
                .required(),
            model: Joi.string()
                .alphanum()
                .min(1)
                .max(64)
                .required(),
            make: Joi.string()
                .alphanum()
                .min(1)
                .max(100)
                .required(),
            millage: Joi.number()
                .required(),
            year: Joi.number()
                .required(),
            price: Joi.number()
                .required()
        })
        .with("username", ["model", "make", "millage", "year","price"]);

    try {
        const result = schema.validate(car);
        console.log(result)
        return !result.error;
    } catch (err) {
        return false;
    }
}

function verifyCarRequestSchema(car) {
    const schema = Joi.object()
        .keys({
            username: Joi.string()
                .alphanum()
                .min(6)
                .max(60)
                .required(),
            model: Joi.string()
                .alphanum()
                .min(1)
                .max(64)
                .required(),
            make: Joi.string()
                .alphanum()
                .min(1)
                .max(100)
                .required()
        })
        .with("username", ["model", "make"]);

    try {
        const result = schema.validate(car);
        console.log(result)
        return !result.error;
    } catch (err) {
        return false;
    }
}

function verifyGetCarsSchema(user) {
    const schema = Joi.object()
        .keys({
            username: Joi.string()
                .alphanum()
                .min(6)
                .max(60)
                .required()
        })
    try {
        const result = schema.validate(user);
        console.log(result)
        return !result.error;
    } catch (err) {
        return false;
    }
}
/**============================== Main entry ==============================*/
function main() {
    /**============================== package imports ==============================*/
    var express = require('express')
    var app = express();
    const bodyParser = require('body-parser');
    let middleware = require('./middleware');
    app.use(express.json());
    var port = process.env.PORT;
    let handlers = new HandlerGenerator();
    app.use(bodyParser.urlencoded({ // Middleware
        extended: true
    }));
    app.use(bodyParser.json());
    // Routes & Handlers
    app.get('/login', handlers.login);
    app.get('/', middleware.checkToken, handlers.index);

    app.post('/register', async (req, res) => {
        if (verifySignupSchema(req.body)) {
            var registered = await registerUser(req.body)
            console.log('success: ', registered)
            if (registered.success) {
                res.status(200).send({
                    "error": "Sign-up succesfull",
                    "success": registered.success
                })
            } else {
                res.status(403).send({
                    "error": "user already registered",
                    "success": registered.success
                })
            }
        } else {
            res.status(400).send({
                "error": "invalid user details",
                "sucess": false
            })
        }
    })
    app.post('/registercar', middleware.checkToken, async (req, res) => {
        if (verifyCarSchema(req.body)) {
            var success = await Promise.resolve(uploadCar(req.body));
            if (success) {
                res.status(200).json({
                    "error": 'Succesfully uploaded car',
                    "success": success
                })
            } else {
                res.status(403).json({
                    "error": 'Something went wrong whilst adding the car to your profile, please try again later',
                    "success": success
                })
            }
        } else {
            res.status(403).json({
                "error": "Invalid car object",
                "success": false
            })
        }
    })
    app.post('/removecar', middleware.checkToken, async (req, res) => {
        if (verifyCarRequestSchema(req.body)) {
            var success = await Promise.resolve(removeCar(req.body));
            if (success) {
                res.status(200).json({
                    "error": 'Succesfully removed car',
                    "success": success
                })
            } else {
                res.status(403).json({
                    "error": 'Something went wrong whilst removing the car from your profile, please try again later',
                    "success": success
                })

            }
        } else {
            res.status(403).json({
                "error": "Invalid car object",
                "success": false
            })
        }
    })

    app.get('/getcar', middleware.checkToken, async (req, res) => {
        if (verifyCarRequestSchema(req.body)) {
            var car = await Promise.resolve(getCar(req.body));
            if (car) {
                res.status(200).json({
                    "error": 'Succesfull fetched car',
                    "car": car,
                    "success": true
                })
            } else {
                res.status(403).json({
                    "error": 'Something went wrong whilst fetching your cars details, please try again later',
                    "car": car,
                    "success": false
                })
            }
        } else {
            res.status(403).json({
                "error": "Invalid car request details",
                "car": {},
                "success": false
            })
        }
    })
    app.get('/getcars', middleware.checkToken, async (req, res) => {
        if (verifyGetCarsSchema(req.body)) {
            var cars = await Promise.resolve(getUserCars(req.body));
            if (cars) {
                res.status(200).json({
                    "error": 'Succesfully fetched cars',
                    "cars": cars,
                    "success": true
                })
            } else {
                res.status(403).json({
                    "error": 'Something went wrong whilst fetching your cars, please try again later',
                    "cars": cars,
                    "success": false
                })
            }
        } else {
            res.status(403).json({
                "error": "Invalid user details",
                "car": {},
                "success": false
            })
        }
    })
    app.listen(port, () => console.log(`Server is listening on port: ${port}`));
    module.exports = app
}
main()