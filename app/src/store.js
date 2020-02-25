import { OrderedMap } from 'immutable'
import _ from 'lodash'

const users = OrderedMap({
    '1': { _id: '1', name: "Gundeep", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@useravatar.png' },
    '2': { _id: '2', name: "Harnoor", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user1avatar.png' },
    '3': { _id: '3', name: "Vicky", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user2avatar.png' },
    '4': { _id: '4', name: "Vishal", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@user3avatar.png' },
})

export default class Store {

    constructor(appComponent) {

        this.app = appComponent;
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;

        this.user = {
            _id: '1',
            name: 'Gundeep',
            created: new Date(),
        }
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
        let searchItems = new OrderedMap();
        if(_.trim(search).length) {
            users.filter((user) => {
                const name = _.get(user, 'name');
                const userId = _.get(user, '_id');
                if(_.includes(name, search)) {
                    searchItems = searchItems.set(userId, user);
                }
            })
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
        this.messages = this.messages.set(`${id}`, message);

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
        let messages = [];
        if (channel) {
            // eslint-disable-next-line array-callback-return
            channel.messages.map((value, key) => {

                const message = this.messages.get(key);
                messages.push(message);
            });
        }
        return messages;
    }

    getMembersFromChannel(channel) {
        let members = new OrderedMap();

        if (channel) {
            // eslint-disable-next-line array-callback-return
            channel.members.map((value, key) => {
                const user = users.get(key);
                const loggedUser = this.getCurrentUser();
                if(_.get(loggedUser,'_id')!== _.get(user,'_id'))
                {
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