'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.START_TIME = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var START_TIME = exports.START_TIME = new Date();

var Approuter = function () {
    function Approuter(app) {
        _classCallCheck(this, Approuter);

        this.app = app;

        this.setupRouter = this.setupRouter.bind(this);
        this.setupRouter();
    }

    _createClass(Approuter, [{
        key: 'setupRouter',
        value: function setupRouter() {

            var app = this.app;

            console.log("App router works");

            /**
             * @endpoint /
             * method should be GET @method: GET
             **/

            app.get('/', function (req, res, next) {
                return res.json({
                    started: (0, _moment2.default)(START_TIME).fromNow()
                });
            });

            /**
             * @endpoint /api/users
             *  @method: POST
             **/

            app.post('/api/users', function (req, res, next) {

                var body = req.body;

                app.models.user.create(body).then(function (user) {

                    return res.status(200).json(user);
                }).catch(function (err) {

                    return res.status(503).json({ error: err });
                });
            });
        }
    }]);

    return Approuter;
}();

exports.default = Approuter;
//# sourceMappingURL=app-router.js.map