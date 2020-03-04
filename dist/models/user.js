'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helper = require('../helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = function () {
    function User(app) {
        _classCallCheck(this, User);

        this.app = app;
    }

    _createClass(User, [{
        key: 'beforeSave',
        value: function beforeSave(user) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};


            //first validate the user object before save to user collection

            var errors = [];
            var fields = ['name', 'email', 'password'];
            var validations = {
                name: {
                    errorMessage: 'Name is required',
                    do: function _do() {

                        var name = _lodash2.default.get(user, 'name', '');

                        return name.length;
                    }
                },
                email: {
                    errorMessage: 'Email is not correct',
                    do: function _do() {
                        var email = _lodash2.default.get(user, 'email', '');
                        if (!email.length || !(0, _helper.isEmail)(email)) {
                            return false;
                        }
                        return true;
                    }
                },
                password: {
                    errorMessage: 'Password is required and more than 3 characters',
                    do: function _do() {
                        var password = _lodash2.default.get(user, 'password', '');
                        if (!password.length || password.length < 3) {
                            return false;
                        }
                        return true;
                    }
                }
            };

            fields.forEach(function (field) {

                var fieldValidation = _lodash2.default.get(validations, field);

                if (fieldValidation) {
                    // do check
                    var isValid = fieldValidation.do();
                    var msg = fieldValidation.errorMessage;
                    if (!isValid) {
                        errors.push(msg);
                    }
                }
            });

            if (errors.length) {

                //validation test not passed 

                var err = _lodash2.default.join(errors, ',');
                return callback(err, null);
            }

            //check if email already exists in db
            var email = _lodash2.default.lowerCase(_lodash2.default.trim(_lodash2.default.get(user, 'email', '')));
            this.app.db.collection('user').findOne({ email: email }, function (err, result) {

                console.log("checking email with result", err, result);
            });

            return callback(null, user);
        }
    }, {
        key: 'create',
        value: function create(user) {
            var _this = this;

            var db = this.app.db;
            console.log("User", user);
            return new Promise(function (resolve, reject) {

                _this.beforeSave(user, function (err, user) {

                    if (err) {
                        return reject(err);
                    }

                    //insert new user object to user collection

                    db.collection('user').insertOne(user, function (err, info) {

                        // check if error return error to user 
                        if (err) {

                            return reject({ message: "An error saving user" });
                        }
                        //otherwise return user object to user
                        return resolve(user);
                    });
                });
            });
        }
    }]);

    return User;
}();

exports.default = User;
//# sourceMappingURL=user.js.map