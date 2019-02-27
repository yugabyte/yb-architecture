import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

import ReadOperationAnimation from './ReadOperationAnimation';

var HelperFunctions = require('./HelperFunctions');

var AnimationState = {
	INITIAL: "INITIAL",
	LEADER_ELECTION_NODE_TIMED_OUT: "LEADER_ELECTION_NODE_TIMED_OUT",
	LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF: "LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF",
	LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES: "LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES",
	LOG_REPLICATION_START: "LOG_REPLICATION_START",
	LOG_REPLICATION_INTRODUCE_CLIENT: "LOG_REPLICATION_INTRODUCE_CLIENT",
	LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER: "LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER",
	LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS: "LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS",
	LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY: "LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY",
	LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER: "LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER",
}

const NODE_A = "NODE_A";
const NODE_B = "NODE_B";

// default delay between animations
var DEFAULT_DELAY = 2000;

class App extends Component {
	render() {
    return (
			<Router>
		    <div className="App">
					<Route exact path='/' component={LeaderElection}></Route>
          <Route exact path='/read-operation' render={(props) => <ReadOperationAnimation {...props} type={ReadOperationAnimation.FAILURE}></Route>

		    </div>
			</Router>
    );
  }
}

class LeaderElection extends Component {
	constructor(props) {
		super(props);
		this.animationState = AnimationState.INITIAL;
		this.onButtonClick = this.onButtonClick.bind(this);
		this.changeMainText = this.changeMainText.bind(this);
	}

	// main animation loop
	next() {
		switch(this.animationState) {
			case AnimationState.INITIAL: {
				this.changeMainText('Leader election starts ...');

				// initiate a timeout
				setTimeout(() => {
					this.changeMainText('If there is no leader, a election timeout is triggered');

					////////////////// animate Node A and B ////////////////////////
					var nodeAOuterCircle = document.getElementById('node-a-outer-circle');
					nodeAOuterCircle.classList.add('animation-delay-3s');
					nodeAOuterCircle.classList.add('animate-circle-stroke');

					var nodeBOuterCircle = document.getElementById('node-b-outer-circle');
					nodeBOuterCircle.classList.add('animation-delay-2s');
					nodeBOuterCircle.classList.add('animate-circle-stroke');

					////////////////// animate Node C ////////////////////////
					// get the specific node (i.e Node C) which would time out faster and eventually
					// become the leader
					var nodeCOuterCircle = document.getElementById('node-c-outer-circle');
					nodeCOuterCircle.classList.add('animate-circle-stroke');

					// need to wait for the animation on the faster node to end and then
					// execute the next step
					var onNodeCAnimationEnd = () => {
						nodeAOuterCircle.classList.add('pause-animation');
						nodeBOuterCircle.classList.add('pause-animation');

						this.animationState = AnimationState.LEADER_ELECTION_NODE_TIMED_OUT;
						// this.next();
						this.delayedNext(100);
					}
					nodeCOuterCircle.addEventListener("webkitAnimationEnd", onNodeCAnimationEnd,false);
					nodeCOuterCircle.addEventListener("animationend", onNodeCAnimationEnd,false);

				}, DEFAULT_DELAY);
				break;
			}
			case AnimationState.LEADER_ELECTION_NODE_TIMED_OUT: {
				var fasterTimeoutCircle = document.getElementById('node-c-outer-circle');
				fasterTimeoutCircle.classList.add('leader-candidate-node');

				var nodeCVoteText = document.getElementById('node-c-extra-text');
				nodeCVoteText.classList.remove('visibility-hidden');

				this.changeMainText('After election timeout the follower becomes a candidate. '
				+ 'It starts a new election term and votes for itself', () => {
					this.animationState = AnimationState.LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF;
					this.delayedNext();
				});
				break;
			}
			case AnimationState.LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF: {
				// send "request vote" to node B
				var messageToB = document.getElementById('node-c-message-to-b');
				var animation1 = this.messageFromC(NODE_B, {
					onBegin: (anim) => {
						messageToB.classList.add('vote-request-circle')
					},
					onChangeComplete: (anim) => {
						messageToB.classList.remove('vote-request-circle');
						messageToB.classList.add('vote-ack-circle');
					},
					onComplete: (anim) => {
						messageToB.classList.remove('vote-ack-circle');
					}
				});

				// send "request vote" to node A
				var messageToA = document.getElementById('node-c-message-to-a');
				var animation2 = this.messageFromC(NODE_A, {
					onBegin: (anim) => {
						messageToA.classList.add('vote-request-circle')
					},
					onChangeComplete: (anim) => {
						messageToA.classList.remove('vote-request-circle');
						messageToA.classList.add('vote-ack-circle');
					},
					onComplete: (anim) => {
						messageToA.classList.remove('vote-ack-circle');
					}
				})

				// wait for both animations to finish before proceeding
				Promise.all([animation1.finished, animation2.finished]).then(() => {
					this.animationState = AnimationState.LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES;
					this.delayedNext(100);
				});
				break;
			}
			case AnimationState.LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES: {
				this.changeMainText('Once a candidate has majority of votes it becomes the leader');

				// show that follower nodes have voted for the leader (Node C)
				var nodeAVoteText = document.getElementById('node-a-extra-text');
				nodeAVoteText.classList.remove('visibility-hidden');
				var nodeBVoteText = document.getElementById('node-b-extra-text');
				nodeBVoteText.classList.remove('visibility-hidden');

				var nodeCVoteText = document.getElementById('node-c-extra-text');
				nodeCVoteText.textContent = 'Leader Node';

				var nodeCOuterCircle = document.getElementById('node-c-outer-circle');
				nodeCOuterCircle.classList.remove('leader-candidate-node');
				nodeCOuterCircle.classList.add('leader-node');

				// hide node A and B's outer circles
				var nodeAOuterCircle = document.getElementById('node-a-outer-circle');
				HelperFunctions.hideElement(nodeAOuterCircle);

				var nodeBOuterCircle = document.getElementById('node-b-outer-circle');
				HelperFunctions.hideElement(nodeBOuterCircle);

				this.animationState = AnimationState.LOG_REPLICATION_START;
				this.delayedNext();
				break;
			}
			case AnimationState.LOG_REPLICATION_START: {
				var voteTexts = document.getElementsByClassName('node-extra-text');
				for (var i = 0; i < voteTexts.length; i++){
					HelperFunctions.hideElement(voteTexts[i]);
				}
				this.changeMainText('Log replication ...');

				this.animationState = AnimationState.LOG_REPLICATION_INTRODUCE_CLIENT;
				this.delayedNext();
				break;
			}
			case AnimationState.LOG_REPLICATION_INTRODUCE_CLIENT: {
				this.changeMainText('Clients always communicate with the leader.');

				var introClientAnimation = anime({
					targets: '#client-node',
					translateY: -72
				});

				introClientAnimation.finished.then(() => {
					var clientMessage = document.getElementById('client-message');
					HelperFunctions.showElement(clientMessage);

					var clientMessageAnimation = anime({
						targets: '#client-message',
						translateX: 100,
						translateY: -100,
						easing: 'linear',
						duration: 800,
					});
					clientMessageAnimation.finished.then(() => {
						HelperFunctions.setSVGText(
							{
								targetId: 'node-c-extra-text',
								text: "SET 5",
								addCSSClass: "set-text-uncommitted",
								showElement: true,
							}
						);
						this.animationState = AnimationState.LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER;
						this.delayedNext();
					})
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER: {
				this.changeMainText("The log entry is currently uncommitted, so it won't update the node's value. To commit the entry the node first replicates it to the follower nodes", () => {
					// send log messages to follower nodes
					var animations = this.logMessageFromLeaderToFollowers(true);
					var animationPromises = [];
					animations.forEach(currentAnimation => {
						animationPromises.push(currentAnimation.finished);
					});
					// wait for both animations to finish before proceeding
					Promise.all(animationPromises).then(() => {
						// show uncommitted log entries for follower nodes
						HelperFunctions.setSVGText(
							{
								targetId: 'node-a-extra-text',
								text: "SET 5",
								addCSSClass: "set-text-uncommitted",
								showElement: true,
							}
						);
						HelperFunctions.setSVGText(
							{
								targetId: 'node-b-extra-text',
								text: "SET 5",
								addCSSClass: "set-text-uncommitted",
								showElement: true,
							}
						);

						this.animationState = AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS;
						this.delayedNext(100);
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS: {
				this.changeMainText("Once the leader receives acks from majority of follower nodes, it commits the value and sets it state to '5'", () => {
					// since leader has received acks from both followers, mark entry as committed
					HelperFunctions.setSVGText(
						{
							targetId: 'node-c-extra-text',
							addCSSClass: "set-text-committed"
						}
					);
					HelperFunctions.setSVGText(
						{
							targetId: 'node-c-main-text',
							text: "5",
							showElement: true,
						}
					);

					this.animationState = AnimationState.LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY;
					this.delayedNext();
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY: {
				this.changeMainText("The leader then notifies followers that entry is committed", () => {
					// now we notify followers that leader has committed the entries
					var animations = this.logMessageFromLeaderToFollowers(false);
					var animationPromises = [];
					animations.forEach(currentAnimation => {
						animationPromises.push(currentAnimation.finished);
					});

					Promise.all(animationPromises).then(() => {
						this.animationState = AnimationState.LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER;
						this.delayedNext(100);
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER: {
				// commit entries for follower nodes
				HelperFunctions.setSVGText({
						targetId: 'node-a-extra-text',
						addCSSClass: "set-text-committed"
					});
				HelperFunctions.setSVGText({
						targetId: 'node-a-main-text',
						text: "5",
						showElement: true,
				});

				HelperFunctions.setSVGText({
						targetId: 'node-b-extra-text',
						addCSSClass: "set-text-committed"
				});
				HelperFunctions.setSVGText({
					targetId: 'node-b-main-text',
					text: "5",
					showElement: true,
				});

				// var nodeAMainText = document.getElementById('node-a-main-text');
				// nodeAMainText.textContent = "5";
				// HelperFunctions.showElement(nodeAMainText);
				//
				// var nodeBMainText = document.getElementById('node-b-main-text');
				// nodeBMainText.textContent = "5";
				// HelperFunctions.showElement(nodeBMainText);

				this.changeMainText("The cluster has now come to consensus about the system state");
				break;
			}


			default:
				console.error('Unrecognized state: ' + this.animationState);
		}
	}

	delayedNext(delay) {
		if (!delay) {
			delay = DEFAULT_DELAY;
		}
		setTimeout(() => this.next(), delay);
	}
	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
		this.delayedNext(100);
	}
	messageFromC(destination, params) {
		var translateX = 0;
		var translateY = 0;
		var targets = "";
		if (destination == NODE_B) {
			translateX = -132;
			translateY = -220;
			targets = '#node-c-message-to-b';
		} else {
			targets = '#node-c-message-to-a';
			translateX = -270;
		}

		var animation = anime({
			targets: targets,
			translateX: translateX,
			translateY: translateY,
			easing: 'linear',
			duration: 1000,
			direction: 'alternate',
			begin: params.onBegin,
			changeComplete: params.onChangeComplete,
			complete: params.onComplete,
		});
		return animation;
	}

	logMessageFromLeaderToFollowers(withAck) {
		var sendMessage = (nodeID, node) => {
			var animation = this.messageFromC(nodeID, {
				onBegin: anim => {
					node.classList.add('log-message')
				},
				onChangeComplete: anim => {
					if (withAck) {
						node.classList.remove('log-message');
						node.classList.add('log-message-ack');
					} else {
						// hide the return trip
						HelperFunctions.hideElement(node);
					}
				},
				onComplete: anim => {
					if (withAck) {
						node.classList.remove('log-message-ack');
					} else {
						HelperFunctions.showElement(node);
					}
				}
			});
			return animation;
		}

		// message to Node A
		var messageToA = document.getElementById('node-c-message-to-a');
		var nodeAAnimation = sendMessage(NODE_A, messageToA);

		// message to Node B
		var messageToB = document.getElementById('node-c-message-to-b');
		var nodeBAnimation = sendMessage(NODE_B, messageToB);

		return [nodeAAnimation,nodeBAnimation];
	}

  render() {
    return (
	    <div className="App">
				<div id="main-diagram">
					<MainDiagram/>
				</div>
				<div id="main-text-sect">
				</div>
	    </div>
	  );
  }

	onButtonClick() {
	}

	changeMainText(text, onComplete) {
		this.mainTextSect.innerHTML=text;

		var ml4 = {};
		ml4.opacityIn = [0,1];
		ml4.scaleIn = [0.2, 1];
		ml4.scaleOut = 3;
		ml4.durationIn = 2000;
		ml4.durationOut = 2000;
		ml4.delay = 500;

		anime({
			targets: '#main-text-sect',
			opacity: ml4.opacityIn,
			scale: ml4.scaleIn,
			duration: ml4.durationIn,
			complete: onComplete,
		});
	}
}

export default App;
