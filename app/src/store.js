import { OrderedMap } from 'immutable'
import _ from 'lodash'

const users = OrderedMap({
    '1': { _id: '1', email:'singh1x7@uwindsor.ca', name: "Gundeep", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@useravatar.png' },
    '2': { _id: '2', email:'singh1vp@uwindsor.ca', name: "Harnoor", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user1avatar.png' },
    '3': { _id: '3', email:'balasubv@uwindsor.ca>', name: "Vicky", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user2avatar.png' },
    '4': { _id: '4', email:'srini11c@uwindsor.ca', name: "Vishal", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user3avatar.png' },
})

export default class Store {

    constructor(appComponent) {

        this.app = appComponent;
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;
        this.user = this.getUserFromLocalStorage();
        // this.user = {
        //     _id: '1',
        //     name: 'Gundeep',
        //     created: new Date(),
        //     avatar: 'https://api.adorable.io/avatars/100/abott@useravatar.png',
        // }
        
    }

    getUserFromLocalStorage(){
        let user = null;
        const data = localStorage.getItem('me');
        try{
            user = JSON.parse(data);
        }
        catch(err){
            console.log(err);
        }
        return user;
    }

    setCurrentUser(user){
        this.user = user;
        if(user){
            localStorage.setItem('me',JSON.stringify(user));
        }
        this.update();
    }

    signOut(){
        this.user = null;
        localStorage.removeItem('me');
        this.update();
    }
    login(email, password){
        const userEmail = _.toLower(email);
        const _this = this;
        return new Promise((resolve, reject) => {
            const user = users.find((user) => user.email === userEmail);
            if(user){
                _this.setCurrentUser(user);
            }
            if(user){
                return resolve(user);
            }
            else{
                return reject("User not found.")
            }
        });

       
    }

    removeMemberFromChannel(channel = null, user = null){
        if(!channel || ! user){
            return;
        }
        const userId = _.get(user, '_id');
        const channelId = _.get(channel, '_id');
        channel.members = channel.members.remove(userId);
        this.channels = this.channels.set(channelId, channel);
        this.update();
    }

    addUserToChannel(channelId,userId) {
        
        const channel = this.channels.get(channelId);
        if(channel) {
            channel.members=channel.members.set(userId,true);
            this.channels = this.channels.set(channelId,channel);
            this.update();
        }
    }

    searchUsers(search = ""){
        const keyword = _.toLower(search);
        let searchItems = new OrderedMap();
        const currentUser = this.getCurrentUser();
        const currentUserId = _.get(currentUser, '_id');

        if(_.trim(search).length) {
            searchItems = users.filter((user) => _.get(user, '_id') !== currentUserId &&  _.includes(_.toLower(_.get(user,'name')),keyword));
        }
        return searchItems.valueSeq();
    }

    onCreateNewChannel(channel = {}) {
        const channelId = _.get(channel, '_id');
        this.addChannel(channelId, channel);
        this.setActiveChannelId(channelId);
    }

    getCurrentUser() {
        return this.user;
    }

    setActiveChannelId(id) {

        this.activeChannelId = id;
        this.update();

    }

    getActiveChannel() {
        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
        return channel;
    }

    addMessage(id, message = {}) {
        //we need to add user object who is author of this message
        const user = this.getCurrentUser();
        message.user = user;

        this.messages = this.messages.set(id, message);

        //lets add new messageId to the current channel

        const channelId = _.get(message, 'channelId')
        if (channelId) {
            let channel = this.channels.get(channelId);
            channel.isNew = false;
            channel.lastMessage = _.get(message,'body','')
            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel);
        }

        this.update();
        
    }
    getMessages() {
        return this.messages.valueSeq();
    }
    addChannel(index, channel = {}) {
        this.channels = this.channels.set(`${index}`, channel);

        this.update();
    }
    getChannels() {
        this.channels = this.channels.sort((a, b) =>new Date(b.created) - new Date(a.created));
        return this.channels.valueSeq();
    }

    getMessageFromChannel(channel) {
        let messages = new OrderedMap();
        if (channel) {
            channel.messages.forEach((value, key) => {
                const message = this.messages.get(key);
                messages = messages.set(key, message);
            });
        }
        return messages.valueSeq();
    }

    getMembersFromChannel(channel) {
        let members = new OrderedMap();
        if (channel) {
            channel.members.forEach((value, key) => {
                const user = users.get(key);
                const loggedUser = this.getCurrentUser();
                if(_.get(loggedUser,'_id')!== _.get(user,'_id')){
                    members=members.set(key,user);
                }     
            });
        }
        return members.valueSeq();
    }

    update() {
        this.app.forceUpdate();
    }




}