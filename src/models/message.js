import _ from 'lodash'
import {OrderedMap} from 'immutable' 
import {ObjectId} from 'mongodb'
export default class Message{

    constructor(app){
        this.app = app;
        this.messages = new OrderedMap();
    }

    create(obj){

        return new Promise( (resolve, reject) => {

            let idd = _.get(obj, '_id');
            const id = _.toString(idd);
            
            const userId = new ObjectId(_.get(obj, 'userId'));
            const channelId = new ObjectId(_.get(obj,'channelId'));
            
            
            const message = {
                _id: new ObjectId(id),
                body: _.get(obj,'body',''),
                userId: userId,
                channelId: channelId,
                created: new Date(),
             };
            console.log("iddddd--msg:",message);
            
            
            this.app.db.db("mongodbmessenger").collection('messages').insertOne(message, (err, info) => {

                if(err){
                    return reject(err);
                }
                
                    this.app.models.user.load(_.toString(userId)).then((user) =>{
                        _.unset(user, 'password');
                        _.unset(user, 'email');

                        message.user = user;

                        return resolve(message);
                    }).catch((err) => {
                        return reject(err);
                    });
                
            // console.log("I am hereeeeeeeeeeeeeeeeeee");
            // return err ? reject(err) : resolve(message);
        });    

        });

    }

}