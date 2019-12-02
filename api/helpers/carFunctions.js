const db = require('../databases/db').db

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

module.exports={
    updateCar,
    removeCar,
    getCar,
    uploadCar,
    getUserCars
}