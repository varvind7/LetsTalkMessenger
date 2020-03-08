import { OrderedMap } from 'immutable'
import _ from 'lodash'
import Service from './service';
import Realtime from './realtime';


// const users = OrderedMap({
//     '1': { _id: '1', email:'singh1x7@uwindsor.ca', name: "Gundeep", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@useravatar.png' },
//     '2': { _id: '2', email:'singh1vp@uwindsor.ca', name: "Harnoor", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user1avatar.png' },
//     '3': { _id: '3', email:'balasubv@uwindsor.ca>', name: "Vicky", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user2avatar.png' },
//     '4': { _id: '4', email:'srini11c@uwindsor.ca', name: "Vishal", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user3avatar.png' },
// })

export default class Store {

    constructor(appComponent) {

        this.app = appComponent;
        this.service= new Service();
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;
        this.token =  this.getTokenFromLocalStore();
        this.user = this.getUserFromLocalStorage();
        this.users = new OrderedMap();
        this.search = {
            users: new OrderedMap(),
        }
        
        this.realtime = new Realtime(this);
    }
    addUserToCache(user){
        user.avatar = this.loadUserAvatar(user);
        const id = `${user._id}`;
        this.users = this.users.set(id, user);
        this.update();
    }
    getUserTokenId() {
        return _.get(this.token, '_id', null);
    }
    loadUserAvatar(user) {

        return `https://api.adorable.io/avatars/285/${user._id}.png`;

    }
    startSearchUsers(q="") {
        //query to backend server and list of user
        const data = {search:q};
        this.search.users = this.search.users.clear();
        this.service.post('api/users/search',data).then((response) => {
            //list of user matched

            const users = _.get(response,'data',[]);
           _.each(users, (user) => {
               //cache to this.users

               //and user to this.search.users

               user.avatar=this.loadUserAvatar(user);
                const userId = `${user._id}`;
               this.users = this.users.set(userId,user);
               this.search.users =  this.search.users.set(userId,user);
           });

           //update component
           this.update();
        }).catch((err) => {
            console.log("searching error",err);
        })
    }
    setUserToken(accessToken ) {
        if(!accessToken) {
            this.localStorage.removeItem('token');
            this.token=null;
            return;
        }
        this.token = accessToken;
        localStorage.setItem('token',JSON.stringify(accessToken));
    }
    getTokenFromLocalStore() {
        if(this.token) {
            return this.token;
        }
        let token=null;

        const data = localStorage.getItem('token');
        if(data)
        {
            try {
                token = JSON.parse(data)

            }
            catch(err) {
                console.log(err);
            } 
        }
        return token;
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

        if(user) {
            // try to to connect to backend and verify if user exists
            const token = this.getTokenFromLocalStore();
            const tokenId = _.get(token,'_id');
            const options = {
                headers: {
                    authorization:tokenId,

                }
            }

            this.service.get('api/users/me',options).then((response) => {
                // user is logged in with this token

                const accessToken = response.data;
                const user=_.get(accessToken,'user');
                this.setCurrentUser(user);
                this.setUserToken(accessToken);
            }).catch(err => {
                this.signOut();
            });

        }
        return user;
    }

    setCurrentUser(user){
        // set temporary avatar image
        user.avatar=this.loadUserAvatar(user) ;
        this.user = user;
        if(user){
            localStorage.setItem('me',JSON.stringify(user));
            //save this collection to local
            const userId = `${user._id}`;
            this.users = this.users.set(userId,user);
        }
        this.update();
    }

    signOut(){
        const userId = `${_.get(this.user, '_id',null)}`;
        this.user = null;
        localStorage.removeItem('me');
        localStorage.removeItem('token');
        if(userId)
        {
            this.users = this.users.remove(userId);

        }
        
        this.update();
    }
    login(email=null, password=null){
        const userEmail = _.toLower(email);
      //  const _this = this;

        const user = {
            email: userEmail,
            password:password
        }
        console.log("Trying to login",user);
        return new Promise((resolve, reject) => {
            //call to backend
            this.service.post('api/users/login',user).then((response) => {

                //successful login
                console.log(response);
                const accessToken = _.get(response,'data');
                const user = _.get(accessToken,'user');
                this.setCurrentUser(user);
                this.setUserToken(accessToken);
                console.log("Got user login callback from server:",accessToken);
            }).catch((err) => {
                //login error
                console.log("Got an error from server",err);

                const message = _.get(err, 'response.data.error.message',"Login error");
                return reject(message);
            });
        });
        // return new Promise((resolve, reject) => {
        //     const user = users.find((user) => user.email === userEmail);
        //     if(user){
        //         _this.setCurrentUser(user);
        //     }
        //     if(user){
        //         return resolve(user);
        //     }
        //     else{
        //         return reject("User not found.")
        //     }
        // });



       
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

    getSearchUsers(){
       // const keyword = _.toLower(search);
       
        return this.search.users.valueSeq();
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
            console.log('Channel:', channel);
            channel.isNew = false;
            channel.lastMessage = _.get(message,'body','');

            const obj = {
                action: 'create_channel',
                payload: channel
            }
            this.realtime.send(obj);
            channel.messages = channel.messages.set(id, true);
            channel.isNew = false;
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
                
                const userId = `${key}`;
                const user = this.users.get(userId);
               
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