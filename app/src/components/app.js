import React,{Component} from 'react';
import Messenger from './messenger';
 class App extends Component {
    render() {
        return <div className="app-wrapper">
            <Messenger />
        </div>
    }
}

export default App;