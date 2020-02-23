import React, { Component } from 'react';
import avatar from '../images/avatar.png';
import classNames from 'classnames';
import { OrderedMap } from 'immutable'
import _ from 'lodash'
import { ObjectID } from '../helpers/objectid'
import SearchUser from './search-user'

class Messenger extends Component {
    constructor(props) {
        super(props);

        this.state = {
            height: window.innerHeight,
            newMessage: 'Hello There...',
            searchUser: ""

        }
        this._onResize = this._onResize.bind(this);
        this.addTestMessages = this.addTestMessages.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this._onCreateChannel = this._onCreateChannel.bind(this);
    }

    _onCreateChannel() {
        const {store} = this.props;
        const channelId = new ObjectID().toString();
        const channel = {
            _id: channelId,
            title: "New Message",
            lastMessage: "",
            members: new OrderedMap({
                '1': true,
                '2': true,
                '3': true,
                '4': true,
            }),
            messages: new OrderedMap(),
            isNew: true,
            created: new Date()
        };
        // console.log(channel);
        store.onCreateNewChannel(channel);
    }

    scrollToBottom() {
        if (this.messageRef) {
            this.messageRef.scrollTop = this.messageRef.scrollHeight;
        }
    }

    renderMessage(message) {
        const text = _.get(message, 'body', '');

        const html = _.split(text, '\n').map((m, key) => {
            return <p key={key} dangerouslySetInnerHTML={{ __html: m }} ></p>
        })
        return html;
    }
    handleSend() {

        const { newMessage } = this.state;
        const { store } = this.props;
        console.log(newMessage.length);
        //create new message
        if (_.trim(newMessage).length) {
            const messageId = new ObjectID().toString();
            const channel = store.getActiveChannel();
            const channelId = _.get(channel, '_id', null);
            const currentUser = store.getCurrentUser();
            const message = {

                _id: messageId,
                body: newMessage,
                channelId: channelId,
                author: _.get(currentUser, 'name', null),
                avatar: avatar,
                me: true,

            }

            store.addMessage(messageId, message);
            this.setState({
                newMessage: '',
            })
        }

    }

    _onResize() {
        this.setState({
            height: window.innerHeight
        });
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }



    componentDidMount() {
        console.log("Component Did Mount");
        window.addEventListener('resize', this._onResize);
        this.addTestMessages();
    }



    addTestMessages() {

        const { store } = this.props;

        //create test messages
        let isMe = false;
        for (let i = 0; i < 100; i++) {
            isMe = false;
            if (i % 2 === 0) {
                isMe = true;
            }
            const newMsg = {
                _id: `${i}`,
                author: `Author ${i}`,
                body: `The body of message ${i}`,
                avatar: avatar,
                me: isMe,
            }

            store.addMessage(i, newMsg);
            //update the component and re render as we have added more messages.
            //  this.setState({
            //      lastUpdated: new Date(),
            //  })
            //instead of the above code the other way to do the same is 

            //  this.forceUpdate();


        }

        //cretate test channels
        for (let c = 0; c < 10; c++) {

            const newChannel = {
                _id: `${c}`,
                title: `Channel title ${c}`,
                lastMessage: `Hey there this is my last msg..${c}`,
                members: new OrderedMap({
                    '1': true,
                    '2': true,
                    '3': true,
                    '4': true,
                }),
                messages: new OrderedMap(),
                created: new Date()
            }

            const msgId = `${c}`;
            const moreMsgId = `${c + 1}`;

            newChannel.messages = newChannel.messages.set(msgId, true);
            newChannel.messages = newChannel.messages.set(moreMsgId, true);

            store.addChannel(c, newChannel);
        }

    }
    componentWillUnmount() {
        window.removeEventListener('resize', this._onResize)


    }
    render() {

        const { store } = this.props;
        const { height } = this.state
        const style = {
            height: height,
        };

        const activeChannel = store.getActiveChannel();
        const messages = store.getMessageFromChannel(activeChannel);//store.getMessages();
        const channels = store.getChannels();
        const members = store.getMembersFromChannel(activeChannel);



        return (

            <div className="app-messenger" style={style}>

                <div className="header">
                    <div className="left">
                        <button className="left-action"><i className="icon-cog" /></button>
                        <button onClick={this._onCreateChannel} className="right-action"><i className="icon-pencil-square-o" /></button>
                        <h2>Messenger</h2>
                    </div>
                    <div className="content">
                        {_.get(activeChannel, 'isNew') ? <div className="toolbar">
                            <label>To:</label>
                            <input placeholder="Type name of person..." onChange={(event) => {
                                const searchUserText = _.get(event, 'target.value');
                                this.setState({
                                    searchUser: searchUserText
                                });
                            }
                        }
                                type="text" value={this.state.searchUser} />
                        <SearchUser search={this.state.searchUser} store={store}/>
                            
                    </div> : <h2>{_.get(activeChannel, 'title', '')}</h2> }

                    </div>
                    <div className="right">

                        <div className="user-bar">
                            <div className="profile-name">Arvind</div>
                            <div className="profile-image"><img src={avatar} alt="" /></div>
                        </div>
                    </div>

                </div>
                <div className="main">

                    <div className="sidebar-left">
                        <div className="chanels">
                            {channels.map((channel, key) => {

                                return (
                                    <div onClick={(key) => {

                                        store.setActiveChannelId(channel._id);

                                    }} key={channel._id} className={classNames('chanel', { 'active': _.get(activeChannel, '_id') === _.get(channel, '_id', null) })}>

                                        <div className="user-image">
                                            <img src={avatar} alt="" />
                                        </div>
                                        <div className="chanel-info">
                                            <h2>{channel.title}</h2>
                                            <p>{channel.lastMessage}</p>
                                        </div>
                                    </div>
                                )
                            })}

                        </div>
                    </div>
                    <div className="content">

                        <div ref={(ref) => this.messageRef = ref} className="messages">

                            {messages.map((message, index) => {
                                return (
                                    <div key={index} className={classNames('message', { 'me': message.me })}>
                                        <div className="message-user-image">
                                            <img src={avatar} alt="" />
                                        </div>
                                        <div className="message-body">
                                            <div className="message-author">{message.me ? 'You ' : message.author} says:</div>

                                            <div className="message-text">
                                                {this.renderMessage(message)}
                                            </div>

                                        </div>
                                    </div>

                                );
                            })}


                        </div>

                        <div className="messenger-input">

                            <div className="text-input">
                                <textarea onKeyUp={(event) => {

                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        this.handleSend();
                                    }


                                }} onChange={(event) => {
                                    this.setState({ newMessage: _.get(event, 'target.value') })

                                }} value={this.state.newMessage} placeholder="Write your message" />
                            </div>
                            <div className="actions">

                                <button onClick={this.handleSend} className="send">Send</button>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-right">
                        <h2 className="title">Members</h2>

                        <div className="members">
                            {members.map((member, key) => {

                                return (
                                    <div key={key} className="member">
                                        <div className="user-image">
                                            <img src={avatar} alt="" />
                                        </div>
                                        <div className="member-info">
                                            <h2>{member.name}</h2>
                                            <p>Joined: 3 days ago.</p>
                                        </div>
                                    </div>
                                )
                            })}



                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default Messenger;