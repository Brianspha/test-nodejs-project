const carFunctions = require('../helpers/carFunctions')
const schemaValidator = require('../helpers/schemaValidators')
async function registerCarHandler(req, res){
    if (schemaValidator.verifyCarSchema(req.body)) {
        var success = await Promise.resolve(carFunctions.uploadCar(req.body));
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
}

async function removeCarHandler (req, res) {
    if (schemaValidator.verifyCarRequestSchema(req.body)) {
        var success = await Promise.resolve(carFunctions.removeCar(req.body));
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
}

async function updateCarHandler (req, res) {
    if (schemaValidator.verifyCarSchema(req.body)) {
        var removed = await Promise.resolve(carFunctions.updateCar(req.body));
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
}

async function getCarsHandler (req, res) {
    if (schemaValidator.verifyGetCarsSchema(req.body)) {
        var cars = await Promise.resolve(carFunctions.getUserCars(req.body));
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
}
module.exports={
    registerCarHandler,
    removeCarHandler,
    updateCarHandler,
    getCarsHandler
}