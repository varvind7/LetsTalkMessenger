import { OrderedMap } from "immutable";
import { ObjectID } from "mongodb";
import _ from 'lodash';

export default class Connection {
    constructor(app) {
        this.app = app;
        this.connections = OrderedMap();

        this.modelDidLoad();
    }
    decodeMessage(msg){
        let messageObject = null;
        try{
            messageObject = JSON.parse(msg);
        }catch(err){
            console.log("Ann error", msg);
        }
        return messageObject;
    }

    send(ws, obj) {
        const message = JSON.stringify(obj);
        ws.send(message);
    }

    doTheJob(socketId, msg){
        const action = _.get(msg, 'action');
        const payload = _.get(msg, 'payload');
        const connection = this.connections.get(socketId);

        switch(action) {



            case 'create_message':

                    if(connection.isAuthenticated){

                        let messageObject = payload;
                        messageObject.userId = _.get(connection,'userId');
                        console.log("Got message from client about creating new message", messageObject);

                        this.app.models.message.create(messageObject).then((message) =>{

                            console.log("Message final bhai:",message);

                            const channelId = _.toString(_.get(message,'channelId'));
                            this.app.models.channel.load(channelId).then((channel) => {
                                console.log("Channel of the message vla channel is",channel);

                                const memberIds = _.get(channel, 'members', []);

                                _.each(memberIds, (memberId) => {

                                    memberId = _.toString(memberId);
                                    const memberConnections = this.connections.filter((c) => _.toString(c.userId) === memberId)
                                    memberConnections.forEach((connection) => {
                                        const ws = connection.ws;
                                        this.send(ws, {

                                            action: 'message_added',
                                            payload: message,
                                        })
                                    })

                                });
                            });


                        }).catch(err => {

                            //send back to the socket client who sent this message with error
                            const ws = connection.ws;
                            this.send(ws, {
                                action: 'create_message_error',
                                payload: payload,
                            });
                        })

                    }

                    
                break

            case 'create_channel':
                {
                    const channel = payload;
                    
                    const userId = connection.userId;
                    channel.userId = userId;
                    this.app.models.channel.create(channel).then((channelObject) => {
                        // Sucessfuly created channel
                        console.log("Created mew cchannel");
                        let memberConnections = [];
                        const memberIds = _.get(channelObject, 'members', []);
                        const query = {
                            _id: {$in: memberIds}
                        };
                        const queryOptions = {
                            _id: 1,
                            name: 1,
                            created: 1
                        }
                        this.app.models.user.find(query, queryOptions).then((users) => {
                            channelObject.users = users;

                            _.each(memberIds, (id) => {
                                const userId = id.toString();
                                const memberConnection = this.connections.filter((con) => `${con.userId}` === userId);
                                if(memberConnection.size) {
                                    memberConnection.forEach((con) => {
                                        const ws = con.ws;
                                        const obj = {
                                            action: 'channel_added',
                                            payload: channelObject
                                        }
    
                                        //send to socket matching user id in channel member
                                        this.send(ws, obj);
                                    });
                                }
                            });
                        });
                    });
                    console.log('Got new channel to be created',typeof userId, channel);
                }

                break;
            case 'auth':
                {
                    console.log("Authentication");
                    const userTokenId = payload;
                    const connection = this.connections.get(socketId);
                    if(connection) {
                        //find user with token and verify
                        this.app.models.token.loadTokenAndUser(userTokenId).then((token) => {
                            const userId = token.userId;
                            connection.isAuthenticated = true;
                            connection.userId = `${userId}`;
                            this.connections = this.connections.set(socketId, connection);
                            const obj = {
                                action: 'auth-success',
                                payload: 'You are aunthenticated'
                            }
                            this.send(connection.ws, obj);
                        }).catch((err) => {
                            // Send login error
                            const obj = {
                                action: 'auth_error',
                                payload: "Authentication error:" +userTokenId
                            };
                            this.send(connection.ws, obj);
                        })

                    }
     
                    console.log('USer with token id', userTokenId, typeof userTokenId);
                }
                break;
            default:
                break;
        }
    }
   
    modelDidLoad() {
        this.app.ws.on('connection', (ws) => {
            const socketId = new ObjectID().toString();
            const clientConnection = {
                _id: `${socketId}`,
                ws: ws,
                userId: null,
                isAuthenticated: false
            }

            // save this connection in Cache
            this.connections = this.connections.set(socketId, clientConnection);

            // listen any message from websocket client
            ws.on('message', (msg) => {
                console.log("Within message");
                const message = this.decodeMessage(msg);
                this.doTheJob(socketId, message);
            })
            ws.on('close', () => {
                // remove socket from cache
                this.connections = this.connections.remove(socketId);
            });
        })
    }
}