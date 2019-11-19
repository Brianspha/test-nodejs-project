<template>
<v-app id="inspire">
    <v-content>
        <v-container class="fill-height" fluid>
            <v-row align="start" justify="center">

                <v-col cols="12" v-if="!registered">
                    <v-card class="elevation-12">
                        <v-toolbar color="primary" dark flat>
                            <v-toolbar-title>Login/Registration Form</v-toolbar-title>
                            <v-spacer />
                        </v-toolbar>
                        <v-card-text>
                            <v-form ref="form" v-model="valid" lazy-validation>
                                <v-text-field label="Username e.g. brian" name="login" prepend-icon="person" type="text" v-model="username" :rules="userNameRules" />
                                <v-text-field id="password" label="Password" name="password" prepend-icon="lock" type="password" v-model="password" :rules="passwordRules" />
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn :ripple="{ center: true }" color="primary" @click="registerUser">Login
                            </v-btn>
                        </v-card-actions>
                        <loading :active.sync="isLoading" :can-cancel="false" :is-full-page="true">
                        </loading>
                    </v-card>
                </v-col>
                <v-col cols="12" v-else>
                    <template>
                        <v-card max-width="400" class="mx-auto">
                            <v-system-bar color="pink darken-2" dark>
                                <v-spacer></v-spacer>

                                <v-icon>mdi-window-minimize</v-icon>

                                <v-icon>mdi-window-maximize</v-icon>

                                <v-icon>mdi-close</v-icon>
                            </v-system-bar>

                            <v-app-bar dark color="pink">
                                <v-app-bar-nav-icon></v-app-bar-nav-icon>

                                <v-toolbar-title>My Cars</v-toolbar-title>

                                <v-spacer></v-spacer>
                                <v-btn @click="logOut" icon>
                                    <v-icon> mdi-arrow-right</v-icon>
                                </v-btn>
                            </v-app-bar>

                            <v-container>
                                <v-row dense>
                                    <v-col cols="12" v-if="cars.length===0">
                                        <v-card color="#385F73" dark>
                                            <v-card-title class="headline">No Cars Available</v-card-title>
                                            <v-card-actions>
                                                <v-btn @click="cardialog=true" text>Add Car</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-col>
                                    <v-col v-for="(car, i) in cars" :key="i" v-else cols="12">
                                        <v-card :color="car.color" dark>
                                            <div class="d-flex flex-no-wrap justify-space-between">
                                                <div>
                                                    <v-card-title class="headline" v-text="car.make"></v-card-title>
                                                    <v-card-subtitle v-text="car.model"></v-card-subtitle>
                                                    <v-card-text>
                                                        <v-select :items="car.prices" label="Price"></v-select>
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-btn @click="carItem=car; dialog=true">Update</v-btn>
                                                        <v-btn @click="deleteCar(car)">Delete</v-btn>
                                                    </v-card-actions>
                                                </div>
                                                <v-avatar class="ma-3" size="125" tile>
                                                    <v-img :src="car.src"></v-img>
                                                </v-avatar>
                                            </div>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card>
                    </template>
                </v-col>
                <template>
                    <v-row justify="center" v-if="dialog">
                        <v-dialog v-model="dialog" persistent max-width="600px">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">Car Profile</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field label="Car Make" :value="carItem.make" disabled>
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field label="Car Model" v-model="carItem.model" disabled>
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field label="Car Price" v-model="carItem.prices[0]" persistent-hint required></v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field label="Year" v-model="carItem.year" required>
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-text-field label="Millage" v-model="carItem.millage" required>
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                    <small>*indicates required field</small>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="dialog = false; ">Close</v-btn>
                                    <v-btn color="blue darken-1" text @click="updateUserCar()">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-row>
                </template>
                <template>
                    <v-row justify="center">
                        <v-dialog v-model="cardialog" persistent max-width="600px">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">Car Registration</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-form ref="form" v-model="valid" lazy-validation>
                                        <v-col cols="12">
                                            <v-text-field label="Car Make" v-model="carMake" :rules="carMakeRules" required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field label="Car Model" :rules="carModelRules" v-model="carModel">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field label="Car Millage" v-model="carMillage" :rules="carMillageRules" persistent-hint required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field label="Car Price" v-model="carPrice" :rules="carPriceRules" persistent-hint required>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field label="Year" v-model="carYear" :rules="carYearRules" required>
                                            </v-text-field>
                                        </v-col>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="cardialog = false; ">Close</v-btn>
                                    <v-btn color="blue darken-1" text @click="addUserCar()">Register</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-row>
                </template>
            </v-row>
        </v-container>
    </v-content>
</v-app>
</template>

<script>
import 'vue-loading-overlay/dist/vue-loading.css';
import Loading from 'vue-loading-overlay';
import Swal from 'sweetalert2'
import request from 'request'
import {
    reject
} from 'q';
export default {
    components: {
        Loading
    },
    data() {
        return {
            cardialog: false,
            carItem: {},
            registered: false,
            username: "",
            password: "",
            carName: "",
            carModel: "",
            carMake: "",
            carPrice: "",
            carYear: 0,
            carMillage: 0,
            isLoading: false,
            valid: true,
            dialog: false,
            carModelRules: [
                v => !!v || 'Car model is required',
                v => (v && v.length > 0) || 'Car Model must be greater than 0'
            ],
            carMakeRules: [
                v => !!v || 'Car Make is required',
                v => (v && v.length > 0) || 'Car make must be greater than 0'
            ],
            carPriceRules: [
                v => !!v || 'Car Price is required',
                v => (v && !isNaN(v)) || 'Car price must be greater than 0'
            ],
            carMillageRules: [
                v => !!v || 'Car Millage is required',
                v => (v && !isNaN(v)) || 'Car Millage must be greater than 0'
            ],
            carYearRules: [
                v => !!v || 'Car Year is required',
                v => (v && !isNaN(v) && v.length === 4) || 'Car Year must be a valid number e.g. 1994'
            ],
            userNameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length >= 2) || 'Username must be greater than 2 characters'
            ],
            passwordRules: [
                v => !!v || 'Password is required',
                v => (v && v.length >= 6) || 'Password must be greater than 6 characters'
            ],
            cars: [],

        }
    },
    /**@dev before we mount we check if the user has logged in 
     * in the instance where the user has refreshed the browser this will just repopulate the UI
     * However if they close the tab they will be required to relogin 
     * **/
    mounted: async function () {
        var registered = sessionStorage.getItem("registered");
        if (registered) {
            this.isLoading = true
            await this.getuserCars();
            this.registered = true
            this.isLoading = false
        }
    },
    methods: {
        /***
         * @dev registers and logs in a new user 
         */
        registerUser() {
            this.isLoading = true
            let This = this
            if (!this.$refs.form.validate()) {
                this.isLoading = false
                this.snackbar = true
            } else {
                request.post(`${this.$store.state.serverAddress}/register`, { //@dev register user
                    json: { //@dev supply the credentials specified by user
                        username: this.username,
                        password: this.password
                    }
                }, (error, res, body) => {
                    if (error || res.statusCode === 400) { //@dev if the request to add a new car was not succesfull we simply alert the user
                        this.error('Something went wrong whilst logging in please try again')
                    } else {
                        if (body && body.cars) {
                            sessionStorage.setItem("username", this.username); //@dev store auth token in case user refereshes browser
                            sessionStorage.setItem("token", body.token); //@dev store auth token in case user refereshes browser
                            body.cars.map(async (car) => {
                                var price = await getPrices() //@dev get price of 1 zar comapre to usd
                                This.cars.push({
                                    model: car.model,
                                    make: car.make,
                                    year: car.year,
                                    prices: [`R${car.price}`, `${Math.round(car.price*price,5)}`],
                                    millage: car.millage
                                })
                            })
                            sessionStorage.setItem('registered', true)
                            This.registered = true
                        }
                    }
                    this.isLoading = false
                })
            }
        },
        deleteCar(car) {
            this.isLoading = true
            var username = sessionStorage.getItem('username')
            var token = sessionStorage.getItem('token')
            request.post(`${this.$store.state.serverAddress}/removecar`, { //@dev register user
                json: { //@dev supply the credentials specified by user
                    username: username,
                    model: car.model,
                    make: car.make
                },
                auth: {
                    'bearer': token, //@dev pass in the auth token
                }
            }, async (error, res, body) => {
                if (error || res.statusCode === 400) { //@dev if the request to add a new car was not succesfull we simply alert the user
                    this.error('Something went wrong whilst removing the car, please try again')
                } else {
                    if (body && body.success) {
                        await this.getuserCars()
                        this.success("Succesfully removed car!!")
                    }
                }
                this.isLoading = false
            })
        },
        /**
         * @dev registers a new car 
         */
        addUserCar() {
            this.isLoading = true
            if (!this.$refs.form.validate()) { //@dev check if the user has inserted valid inputs
                this.snackbar = true
                this.isLoading = false
            } else {
                var username = sessionStorage.getItem('username')
                var token = sessionStorage.getItem('token')
                request.post(`${this.$store.state.serverAddress}/registercar`, { //@dev send the new cars details to the server
                    json: {
                        username: username,
                        model: this.carModel,
                        make: this.carMake,
                        millage: this.carMillage,
                        year: this.carYear,
                        price: this.carPrice
                    },
                    auth: {
                        'bearer': token, //@dev pass in the auth token
                    }
                }, async (error, res, body) => {
                    this.isLoading = true
                    if (error || res.statusCode === 400 || res.statusCode === 404) { //@dev if the request to add a new car was not succesfull we simply alert the user
                        this.error('Something went wrong whilst logging in please try again')
                    }
                    if (res.statusCode === 403) {
                        this.error('Car already registered')
                    } else {
                        this.cars = []
                        await this.getuserCars()
                        this.success('Succesfully registered car')
                    }
                    this.isLoading = false
                })
            }
        },
        /**
         * @dev fetches all user cars 
         */
        getuserCars: async function () {
            this.cars = []
            var username = sessionStorage.getItem("username"); //@dev fetch username stored on the localsession storage
            var token = sessionStorage.getItem('token')
            request.post(`${this.$store.state.serverAddress}/getcars`, {
                json: {
                    username: username
                },
                auth: {
                    'bearer': token, //@dev pass in the auth token
                }
            }, (error, res, body) => {
                if (error || res.statusCode !== 200) { //@dev if the request to add a new car was not succesfull we simply alert the user
                    this.error('Something went wrong whilst logging in please try again')
                } else {
                    if (body.cars) {
                        body.cars.map(async (car) => {
                            var price = await this.getPrices(car.price) //@dev get prices of 1 USD
                            this.cars.push({
                                model: car.model,
                                make: car.make,
                                year: car.year,
                                prices: [`R${car.price}`, `${Math.round(car.price*price,5)}`],
                                millage: car.millage
                            })
                        })
                    }
                }
                this.isLoading = false
            })
        },
        logOut() {
            sessionStorage.clear();
            this.registered = false
        },
        updateUserCar: async function () {
            this.isLoading = true
            var username = sessionStorage.getItem("username"); //@dev fetch username stored on the localsession storage
            var token = sessionStorage.getItem('token')
            var prices = this.carItem.prices[0].replace('R', '')
            request.post(`${this.$store.state.serverAddress}/updatecar`, {
                json: {
                    username: username,
                    model: this.carItem.model,
                    make: this.carItem.make,
                    millage: this.carItem.millage,
                    price: prices,
                    year: this.carItem.year
                },
                auth: {
                    'bearer': token, //@dev pass in the auth token
                }
            }, (error, res, body) => {
                if (error || res.statusCode !== 200) { //@dev if the request to add a new car was not succesfull we simply alert the user
                    this.error('Something went wrong whilst logging in please try again')
                } else {
                    if (body.cars) {
                        body.cars.map(async (car) => {
                            var price = await this.getPrices(car.price) //@dev get prices of 1 USD
                            this.cars.push({
                                model: car.model,
                                make: car.make,
                                year: car.year,
                                prices: [`R${car.price}`, `${Math.round(car.price*price,5)}`],
                                millage: car.millage
                            })
                        })
                        this.message('Succesfully updated car details')
                    }
                }
                this.isLoading = false
            })
        },
        /**
         * @dev fetches the latest conversion rate between the rand and USD
         */
        getPrices: async function () {
            return new Promise((resolve, reject) => {
                request('https://api.exchangeratesapi.io/latest?symbols=ZAR,USD ', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var price = JSON.parse(body).rates.ZAR //@dev convert to accessible json object
                        resolve(price)
                    } else {
                        reject(error)
                        console.warn(error); //@dev if there is an error
                    }
                });
            })
        },
        /**
         * @dev responsible for alert the user in the instance where there is an error in the system
         * @param message the error message to display to the user
         */
        error(message) {
            Swal.fire({
                type: 'error',
                title: 'Error',
                text: message,
                allowOutsideClick: true
            })
        },
        /**
         * @dev responsible for alerting the user fo any succesful operations in the system
         * @param the message to be displayed to the user
         */
        success(message) {
            Swal.fire(
                'Success',
                message,
                'success'
            )
        }
    }
}
</script>
