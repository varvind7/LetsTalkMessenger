import _ from 'lodash';
import { OrderedMap } from 'immutable';
export default class Realtime{
    constructor(store) {
        this.store = store;
        this.ws = null;
        this.isConnected = false;
        this.connect();
    }

    decodeMessage(msg) {
        let message = {};
        try{
            message = JSON.parse(msg);
        } catch(err) {
            console.log(err);
        }
        return message;
    }

    readMessage(msg) {
        const store = this.store;
        const message = this.decodeMessage(msg);
        const action = _.get(message, 'action', '');
        const payload= _.get(message, 'payload');

        switch(action) {
            case 'channel_added':
                const channelId = `${payload._id}`;
                const userId = `${payload.userId}`;

                const users = _.get(payload, 'users', []);

                let channel = {
                    _id: channelId,
                    title: _.get(payload, 'title', ''),
                    lastMessage: _.get(payload, 'lastMessage'),
                    members: new OrderedMap(),
                    messages: new OrderedMap(),
                    isNew: false,
                    userid: userId,
                    created: new Date()
                };

                _.each(users, (user) => {
                    // add this user to store users collection
                    const memberId = `${user._id}`;
                    this.store.addUserToCache(user);
                    channel.members = channel.members.set(memberId, true);
                })
                store.addChannel(channelId, channel);
                break;
            default:
                break;
        }

    }

    send(msg = {}) {
        const isConnected = this.isConnected;
        if(isConnected){
            const messageString = JSON.stringify(msg);
            this.ws.send(messageString);
        }
    }

    authentication(){
        const tokenId = this.store.getUserTokenId();
        if(tokenId) {
            const message = {
                action: 'auth',
                payload: `${tokenId}`
            }
            this.send(message);
        }

    }

    connect(){
        const ws = new WebSocket('ws://localhost:3001');
        this.ws = ws;
        ws.onopen = () => {
            // console.log("You are connected");
            this.isConnected = true;
            this.authentication();

            ws.onmessage = (event) => {
                this.readMessage(_.get(event, 'data'));
                console.log("Message from server", event.data);
            }

        }

        ws.onclose = () => {
            console.log("You are disconnected");
            this.isConnected = false;
        }
    }
}