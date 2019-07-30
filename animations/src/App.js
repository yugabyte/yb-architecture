import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

import ReadFailureAnimation from './ReadFailureAnimation';
import RaftReadOperationAnimation from './RaftReadOperationAnimation';
import LeaderLeasesAnimation from './LeaderLeasesAnimation';
import AnimationRunner from './AnimationRunner';
import RaftWriteAnimation from './RaftWriteAnimation';

class App extends Component {
	render() {
    return (
			<Router>
		    <div className="App">
				<Route exact path='/' component={Home}></Route>
				<Route path='/raft-write-operation' render={(props) => <AnimationRunner {...props} animationToRun={RaftWriteAnimation}/> }></Route>
				<Route path='/why-raft-read-fails-without-quorum' render={(props) => <AnimationRunner {...props} animationToRun={ReadFailureAnimation}/> }></Route>
				<Route path='/raft-read-with-leader-leases' render={(props) => <AnimationRunner {...props} animationToRun={LeaderLeasesAnimation}/> }></Route>
				<Route path='/read-operation-in-raft' render={(props) => <AnimationRunner {...props} animationToRun={RaftReadOperationAnimation}/> }></Route>
		    </div>
			</Router>
    );
  }
}

class Home extends Component {
	render() {
		return (
			<div id="home-link-container">
					<h3>Read:</h3>
				<ul>
					<li>
						<Link to="/read-operation-in-raft">Read operation in raft</Link>
					</li>
					<li>
						<Link to="/why-raft-read-fails-without-quorum">Why raft read failes without quorum</Link>
					</li>
					<li>
						<Link to="/raft-read-with-leader-leases">Raft read with leader leases</Link>
					</li>
				</ul>

				<h3>Write:</h3>
					<div class="write-link-container">
						<Link to="/raft-write-operation">Raft write operation</Link>
					</div>
			</div>
		);
	}
}


export default App;
