import _ from 'lodash'
import {isEmail} from '../helper'


export default class User{

    constructor(app){
        this.app = app;
    }

    beforeSave(user, callback = () => {}){

        //first validate the user object before save to user collection
        let errors = [];
        const fields  = ['name', 'email', 'password'];
        const validations = {
            name: {
                errorMessage: 'Name is required',
                do: () => {

                    const name = _.get(user, 'name', '');

                    return name.length; 
                }
            },
            email: {
                errorMessage: 'Email is not correct',
                do: () => {
                    const email = _.get(user, 'email', '');
                    if(!email.length || !isEmail(email)){
                        return false;
                    }
                    return true;   
                }
            },
            password: {
                errorMessage: 'Password is required and more than 3 characters',
                do: () => {
                    const password = _.get(user, 'password', '');
                    if(!password.length || password.length < 3){
                        return false; 
                    }
                    return true;
                }
            }
        }


        fields.forEach((field) => {

            const fieldValidation = _.get(validations, field);

            if(fieldValidation){
                // do check
                const isValid = fieldValidation.do();
                const msg = fieldValidation.errorMessage;
                if(!isValid){
                    errors.push(msg);
                }
            }

        });

        
        if(errors.length){

            //validation test not passed 

            const err = _.join(errors, ',');
            return callback(err, null);
        }
        
    
        // //check if email already exists in db
        // const email = _.lowerCase(_.trim(_.get(user,'email','')));
        // this.app.db.collection('users').findOne({email: email}, (err, result) => {

        //     console.log("checking email with result",err, result);

        // });

        return callback(null, user);
    }

    

    create(user){

        const db = this.app.db;
        console.log("User", user);
        return new Promise((resolve, reject) => {
            
            
            this.beforeSave(user, (err, user) => {

                console.log("After validation: ", err,user);
                console.log("Error ta nul hi hai",err);
                if(err){
                    return reject(err);
                }

                // insert new user object to user collection

                //console.log("just to check db is correct here",db);
                db.db("mongodbmessenger").collection('users').insertOne(user, (err, info) => {

                    console.log("coming in here.....")
                    // check if error return error to user 
                    if(err){

                        return reject({ message : "An error saving user"});
                    }
                    //otherwise return user object to user
                    return resolve(user);

                });


            });
           
        });
    }

}