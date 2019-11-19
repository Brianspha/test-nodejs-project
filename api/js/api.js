/**================================================== package imports ================================================== **/
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
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const secret = config.secret
var cors = require('cors')

/**============================== Pre-reqs initialisation ==============================*/
app.use(cors())
app.use(express.json());
var port = process.env.PORT;
app.use(bodyParser.urlencoded({ // Middleware
    extended: true
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
db.serialize(function () {
    db.run("CREATE TABLE User(username varchar(60) PRIMARY KEY, password varchar(65))")
    db.run("CREATE TABLE Car(owner varchar(60),model varchar(60) PRIMARY KEY, make varchar(100), millage INTEGER, year INTEGER, price INTEGER,photo BLOB,  FOREIGN KEY(owner) REFERENCES User(username))")
});


/**============================== Functions ==============================*/

/**
 * @dev registerUser checkAndRegister checks if a user is registered and registers them
 * @param user the user to be registered
 */
async function registerUserDetails(user) {
    var passwordHash = createHash(user.password)
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM User where username='${user.username}'`, (err, userTemp) => {
            if (!userTemp) {
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

/**
 * @dev createHash responsible for creating a one way hash of the user password
 * @param password the user password to be hashed
 */
function createHash(password) {
    var hash = crypto.createHash('sha256')
        .update(password)
        .digest('hex');
    return hash
}


/**
 * @dev getUserCars responsible for fetching all cars belonging to a user
 * @param user username 
 */
async function getUserCars(user) {
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
/**
 * @dev uploadCar responsible for adding a new car to a users list
 * @param car the car to be added to the users car list
 */
async function uploadCar(car) {
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
/**
 * @dev getCar responsible for fetching a car from the users list
 * @param car the car id and make
 */
async function getCar(car) {
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

/**
 * @dev removeCar responsible for removing a car from a users car list
 * @param car the car to be removed 
 */
async function removeCar(car) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE From Car where model='${car.model}' AND make='${car.make}'`, async (err, ok) => {
            var queryCar = await Promise.resolve(getCar(car)) //@dev query car to check if it has been removed
            if (!queryCar) { //sometimes undefined so just return an empty object
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}
/**
 * @dev responsible for update the details of a car
 * @param car represents the car containing the new details
 */
async function updateCar(car) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE Car SET model= '${car.model}',make='${car.make}', year='${car.year}', price='${car.price}', millage='${car.millage}' WHERE owner='${car.username}'`, (err, ok) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}
/**============================== Schema Functions ==============================*/
/**
 * @dev verifySignupSchema responsible for verifying the user json object passed in by user 
 *@param user the user json object to be verified contains user details
 */
function verifySignupSchema(user) {
    const schema = Joi.object()
        .keys({
            username: Joi.string()
                .alphanum()
                .min(2)
                .max(60)
                .required(),
            password: Joi.string()
                .alphanum()
                .min(8)
                .max(65)
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
/**
 * @dev verifyCarSchema responsible for verifying the car json object passed in by user 
 *@param car the user json object to be verified
 */

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
        .with("username", ["model", "make", "millage", "year", "price"]);

    try {
        const result = schema.validate(car);
        return !result.error;
    } catch (err) {
        return false;
    }
}
/**
 * @dev verifyCarRequestSchema responsible for verifying the json object passed in by user requesting 
 * a vehichles details
 *@param car the user json object to be verified
 */
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
        return !result.error;
    } catch (err) {
        return false;
    }
}

/**
 * @dev verifyGetCarsSchema responsible for verifying the json object passed in by user
 *@param user the user json object to be verified
 */
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
        return !result.error;
    } catch (err) {
        return false;
    }
}

function getToken(username) {
    let token = jwt.sign({
            username: username
        },
        secret, {
            expiresIn: '1h' // expires in 1 hour
        }
    );
    return token
}


/**============================== Routes Initialisation ==============================*/

/**
 * @dev route responsible for preventing random thus forcing the requirment of a token
 * @requirement the user is required to supply an acess token inorder to update the car details
 */
app.get('/', middleware.checkToken);
/**
 * @dev route responsible for adding a new user
 * @requirement the user is required to supply an acess token 
 */
app.post('/register', async (req, res) => {
    if (verifySignupSchema(req.body)) {
        var registered = await registerUserDetails(req.body)
        if (registered.success) {
            res.status(200).send({
                "error": "Sign-up succesfull",
                "success": registered.success,
                "token": getToken(req.body.username),
                "cars": []
            })
        } else {
            var cars = await Promise.resolve(getUserCars(req.body.username))
            res.status(403).send({
                "error": "user already registered",
                "success": registered.success,
                "token": getToken(req.body.username),
                "cars": cars
            })
        }
    } else {
        res.status(400).send({
            "error": "invalid user details",
            "sucess": false,
            "token": ""
        })
    }
})
/**
 * @dev route responsible for adding a new car to a users car list
 * @requirement the user is required to supply an acess token 
 */
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
        res.status(404).json({
            "error": "Invalid car object",
            "success": false
        })
    }
})
/**
 * @dev route responsible for removing a regitered car
 * @requirement the user is required to supply an acess token 
 */
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
/**
 * @dev route responsible for updating the details of a car
 * @requirement the user is required to supply an acess token 
 */
app.post('/updatecar', middleware.checkToken, async (req, res) => {
    if (verifyCarSchema(req.body)) {
        var removed = await Promise.resolve(updateCar(req.body));
        if (removed) {
            res.status(200).json({
                "error": 'Succesfull removed car',
                "success": removed
            })
        } else {
            res.status(403).json({
                "error": 'Something went wrong whilst removing your car, please try again later',
                "success": removed
            })
        }
    } else {
        res.status(404).json({
            "error": "Invalid car details",
            "success": false
        })
    }
})
/**
 * @dev route repsonsible for fetching all user cars for a particular user
 * @requirement the user is required to supply an acess token 
 */
app.post('/getcars', middleware.checkToken, async (req, res) => {
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
        res.status(404).json({
            "error": "Invalid user details",
            "car": {},
            "success": false
        })
    }
})
app.listen(port, () => console.log(`Server is listening on port: ${port}`));
module.exports = app