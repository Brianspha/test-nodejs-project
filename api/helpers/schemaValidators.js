
const Joi = require("@hapi/joi");


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

module.exports = {
    verifyCarRequestSchema,
    verifyGetCarsSchema,
    verifySignupSchema,
    verifyCarSchema
}