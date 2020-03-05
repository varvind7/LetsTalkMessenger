import moment from "moment";

export default class Token {
    constructor(app) {
        this.app = app;

    }

    create(userId) {
        const token = {
            userId: userId,
            created: new Date()
        }
        const db = this.app.db;
        return new Promise((resolve, reject) => {
            db.db("mongodbmessenger").collection('tokens').insertOne(token, (err, info) => {
                return err ? reject(err) : resolve(token);
            })
        });

    }
}