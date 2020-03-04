import moment from 'moment';
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

                return res.status(200).json(user);

            }).catch(err => {

               return res.status(503).json({error: err});

            })
            
         })




    }
}