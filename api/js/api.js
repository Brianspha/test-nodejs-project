/**================================================== package imports ================================================== **/


const middleware = require('../middleware/middleware.js');
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const userHandler = require('../routes/user')
const carHandler = require('../routes/car')
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
app.post('/register',userHandler.registerUserHandler)
/**
 * @dev route responsible for adding a new car to a users car list
 * @requirement the user is required to supply an acess token 
 */
app.post('/registercar', middleware.checkToken,carHandler.registerCarHandler)
/**
 * @dev route responsible for removing a regitered car
 * @requirement the user is required to supply an acess token 
 */
app.post('/removecar', middleware.checkToken,carHandler.removeCarHandler)
/**
 * @dev route responsible for updating the details of a car
 * @requirement the user is required to supply an acess token 
 */
app.post('/updatecar', middleware.checkToken,carHandler.updateCarHandler)
/**
 * @dev route repsonsible for fetching all user cars for a particular user
 * @requirement the user is required to supply an acess token 
 */
app.post('/getcars', middleware.checkToken,carHandler.getCarsHandler )
app.listen(port, () => console.log(`Server is listening on port: ${port}`));
module.exports = app