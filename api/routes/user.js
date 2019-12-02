const userFunctions = require('../helpers/userFunctions');
const tokenGenerator = require('../helpers/tokenGenerator')
const schemaValidator = require('../helpers/schemaValidators')
const carFunctions = require('../helpers/userFunctions')
async function registerUserHandler (req, res) {
    if (schemaValidator.verifySignupSchema(req.body)) {
        var registered = await userFunctions.registerUserDetails(req.body)
        if (registered.success) {
            res.status(200).send({
                "error": "Sign-up succesfull",
                "success": registered.success,
                "token": tokenGenerator.getToken(req.body.username),
                "cars": []
            })
        } else {
            var cars = await Promise.resolve(carFunctions.getUserCars(req.body.username))
            res.status(403).send({
                "error": "user already registered",
                "success": registered.success,
                "token": tokenGenerator.getToken(req.body.username),
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
}

module.exports = {
    registerUserHandler
}