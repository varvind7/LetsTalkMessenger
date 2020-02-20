import React,{Component} from 'react';
import avatar from '../images/avatar.png';
import classNames from 'classnames';

 class Messenger extends Component {
     constructor(props)
     {
         super(props);

         this.state = {
             height: window.innerHeight,
             messages:[]
         }
         this._onResize = this._onResize.bind(this);
         this.addTestMessages=this.addTestMessages.bind(this);
     }

     _onResize() {
         this.setState({
             height:window.innerHeight
         });
     }


     componentDidMount(){
        console.log("Component Did Mount");
        window.addEventListener('resize',this._onResize);
        this.addTestMessages();
     }
     addTestMessages() {
         let {messages} = this.state;
         let isMe=false;
         for(let i=0;i<100;i++) {
            isMe=false;
             if(i%2==0) {
                 isMe=true;
             }
             const newMsg = {
                 author:`Author ${i}`,
                 body:`The body of message ${i}`,
                 avatar:avatar,
                 me: isMe,
             }
             messages.push(newMsg);
         }
         this.setState({messages:messages})
     }
     componentWillUnmount(){
        window.removeEventListener('resize',this._onResize)


     }
    render() {

        const {height,messages} = this.state
        const style = {
            height: height,
        }
        return(

            <div className="app-messenger" style={style}>

                <div className="header">
                    <div className="left">
                        <div className="actions"> 
                        <button>New Message</button>
                        </div>
                    </div>
                    <div className="content"><h2>Title</h2></div>
                    <div className="right">

                        <div className="user-bar">
                            <div className="profile-name">Arvind</div>
                            <div className="profile-image"><img src={avatar} /></div>
                        </div>
                    </div>

                </div>
                <div className="main">

                    <div className="sidebar-left">
                        <div className="chanels">
                            <div className="chanel">

                                <div className="user-image">
                                    <img src={avatar} alt=""/>
                                </div>
                                <div className="chanel-info">
                                    <h2>Narayan, Arvind</h2>
                                    <p>Hello,there..</p>
                                </div>
                            </div>

                            <div className="chanel">

                                <div className="user-image">
                                    <img src={avatar} alt=""/>
                                </div>
                                <div className="chanel-info">
                                    <h2>Vicky</h2>
                                    <p>Hello,there..</p>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="content">

                        <div className="messages">

                            {messages.map((message,index) => {
                                return (
                                    <div key={index} className={classNames('message',{'me':message.me})}>
                                    <div className="message-user-image">
                                        <img src={avatar} alt=""/>
                                    </div>
                                    <div className="message-body">
                                        <div className="message-author">{message.me? 'You ': message.author} says:</div>
    
                                        <div className="message-text">
                                        <p>{message.body} </p>
                                        </div>
                                       
                                    </div>
                                </div>

                                );
                            })}
                           

                        </div>

                        <div className="messenger-input">

                            <div className="text-input">
                                <textarea  placeholder="Write your message"/>
                            </div>
                            <div className="actions">

                                <button className="send">Send</button>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-right">
                        <h2 className="title">Members</h2>
                        
                        <div className="members">
                            <div className="member">
                            <div className="user-image">
                                    <img src={avatar} alt=""/>
                                </div>
                                <div className="member-info">
                                    <h2>Arvind Narayan</h2>
                                    <p>Joined: 3 days ago</p>
                                </div>
                            </div>

                            <div className="member">
                            <div className="user-image">
                                    <img src={avatar} alt=""/>
                                </div>
                                <div className="member-info">
                                    <h2>Vicky</h2>
                                    <p>Joined: 2 days ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default Messenger;