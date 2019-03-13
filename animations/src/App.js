import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
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

import {Constants} from './constants';
import Test from './Test';

class App extends Component {
	render() {
    return (
			<Router>
		    <div className="App">
					<Route exact path='/raft-write-operation' render={(props) => <AnimationRunner {...props} animationToRun={RaftWriteAnimation}/> }></Route>
          <Route exact path='/why-raft-read-fails-without-quorum' render={(props) => <AnimationRunner {...props} animationToRun={ReadFailureAnimation}/> }></Route>

					<Route exact path='/raft-read-with-leader-leases' render={(props) => <AnimationRunner {...props} animationToRun={LeaderLeasesAnimation}/> }></Route>

					<Route exact path='/read-operation-in-raft' render={(props) => <AnimationRunner {...props} animationToRun={RaftReadOperationAnimation}/> }></Route>

		    </div>
			</Router>
    );
  }
}


export default App;
