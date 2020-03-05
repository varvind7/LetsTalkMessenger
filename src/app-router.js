import moment from 'moment';
import _ from 'lodash';

export const START_TIME = new Date();
export default class Approuter{

    constructor(app){
        this.app = app;

        this.setupRouter = this.setupRouter.bind(this);
        this.setupRouter();
    }

    setupRouter(){
        
        const app = this.app;

        console.log("App router works")

        
        /**
         * @endpoint /
         * method should be GET @method: GET
         **/

         app.get('/', (req, res, next) => {
            return res.json({
                started: moment(START_TIME).fromNow(),
            })

         });

        /**
         * @endpoint /api/users
         *  @method: POST
         **/

         app.post('/api/users', (req, res, next) => {

            const body = req.body;          
 
            app.models.user.create(body).then((user) => {
                _.unset(user, 'password');
                return res.status(200).json(user);

            }).catch(err => {

               return res.status(503).json({error: err});

            })
            
         });

                /**
         * @endpoint /api/users:id
         *  @method: GET
         **/

         app.get('/api/users/:id', (req, res, next) => {
                const userId = _.get(req, 'params.id');

                app.models.user.load(userId).then((user) => {
                    _.unset(user, 'password');
                    return res.status(200).json(user);
                }).catch(err => {
                    return res.status(404).json({
                        error: err,
                    })
                });

         });

          /**
         * @endpoint /api/users/login
         *  @method: POST
         **/

         app.post('/api/users/login', (req, res, next) => {
            const body = _.get(req, 'body');
            app.models.user.login(body).then((token) => {
                _.unset(token, 'user.password');
                return res.status(200).json(token);
            }).catch(err => {
                return res.status(401).json({
                    error: err
                })
            })
        })


    }
}