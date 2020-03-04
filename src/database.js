import {MongoClient} from 'mongodb'

const URL = 'mongodb://localhost:27017/mongodbmessenger';


export default class Database{

    
    connect(){


        return new Promise((resolve, reject) => {
        
            MongoClient.connect(URL, (err,db) => {
                console.log("db connected broooooo see",db);
                //useUnifiedTopology: true;
                return err ? reject(err) : resolve(db);    
            });
            
        });

        

    }
}