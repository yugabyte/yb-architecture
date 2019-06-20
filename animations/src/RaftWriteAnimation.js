import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import {Constants} from './constants';

var HelperFunctions = require('./HelperFunctions');

const SET_VALUE1 = "5";
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
};


class RaftWriteAnimation extends Component {
	constructor(props) {
		super(props);
		this.animationState = AnimationState.INITIAL;
		this.state = {
			animationFinished: false,
		}
	}

	pause() {
	}
	resume() {
	}

	onNext() {
		return new Promise((resolve,reject) => {
			this.onNextInternal(resolve,reject);
		});
	}

	onNextInternal(resolve,reject) {
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
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					}
					nodeCOuterCircle.addEventListener("webkitAnimationEnd", onNodeCAnimationEnd,false);
					nodeCOuterCircle.addEventListener("animationend", onNodeCAnimationEnd,false);

				}, Constants.DEFAULT_DELAY);
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
					resolve({
						animationState: this.animationState,
						delay: 2000,
					});
				});
				break;
			}
			case AnimationState.LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF: {
				// send "request vote" to node B
				var messageToB = document.getElementById('node-c-message-to-b');
				var animation1 = HelperFunctions.messageFromC(Constants.NODE_B, {
					onBegin: (anim) => {
						messageToB.classList.add('vote-request-circle')
					},
					onChangeComplete: (anim) => {
						messageToB.classList.remove('vote-request-circle');
						messageToB.classList.add('vote-ack-circle');
					},
					onComplete: (anim) => {
						messageToB.classList.remove('vote-ack-circle');
					},
					alternate: true,
				});

				// send "request vote" to node A
				var messageToA = document.getElementById('node-c-message-to-a');
				var animation2 = HelperFunctions.messageFromC(Constants.NODE_A, {
					onBegin: (anim) => {
						messageToA.classList.add('vote-request-circle')
					},
					onChangeComplete: (anim) => {
						messageToA.classList.remove('vote-request-circle');
						messageToA.classList.add('vote-ack-circle');
					},
					onComplete: (anim) => {
						messageToA.classList.remove('vote-ack-circle');
					},
					alternate: true,
				})

				// wait for both animations to finish before proceeding
				Promise.all([animation1.finished, animation2.finished]).then(() => {
					this.animationState = AnimationState.LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES;
					resolve({
						animationState: this.animationState,
						delay: 1000,
					});
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
				resolve({
					animationState: this.animationState,
					delay: 2000,
				});

				break;
			}
			case AnimationState.LOG_REPLICATION_START: {
				var voteTexts = document.getElementsByClassName('node-extra-text');
				for (var i = 0; i < voteTexts.length; i++){
					HelperFunctions.hideElement(voteTexts[i]);
				}
				this.changeMainText('Log replication ...');

				this.animationState = AnimationState.LOG_REPLICATION_INTRODUCE_CLIENT;
				resolve({
					animationState: this.animationState,
					delay: 2000,
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_INTRODUCE_CLIENT: {
				this.changeMainText('Clients always communicate with the leader.');

				var introClientAnimation = HelperFunctions.introduceClient();

				introClientAnimation.finished.then(() => {
					var messageToCAnimation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false, HelperFunctions.getSetValueText(SET_VALUE1));
					messageToCAnimation.finished.then(() => {
						this.animationState = AnimationState.LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER;
						resolve({
							animationState: this.animationState,
							delay: 1000,
						});
					})
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_MESSAGE_RECEIVED_BY_LEADER: {
				this.changeMainText("The log entry is currently uncommitted, so it won't update the node's value. To commit the entry the node first replicates it to the follower nodes", () => {
					// send log messages to follower nodes
					var animations = HelperFunctions.logMessageFromLeaderToFollowers(true, HelperFunctions.getSetValueText(SET_VALUE1));
					var animationPromises = HelperFunctions.getFinishPromises(animations);

					// wait for both animations to finish before proceeding
					Promise.all(animationPromises).then(() => {
						this.animationState = AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS: {
				this.changeMainText("Once the leader receives acks from majority of follower nodes, it commits the value and sets it state to '5'", () => {
					// since leader has received acks from both followers, mark entry as committed
					HelperFunctions.setSVGText({
						targetId: 'node-c-extra-text',
						addCSSClass: "set-text-committed"});
					HelperFunctions.setSVGText({
						targetId: 'node-c-main-text',
						text: "5",
						showElement: true,});

					this.animationState = AnimationState.LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY;
					resolve({
						animationState: this.animationState,
						delay: 1000,
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_LEADER_HAS_COMMITED_ENTRY: {
				this.changeMainText("The leader then notifies followers and the client that entry is committed", () => {
					// notify followers that leader has committed the entries
					var animations = HelperFunctions.logMessageFromLeaderToFollowers(false,HelperFunctions.getSetValueText(SET_VALUE1), true);
					var animationPromises = HelperFunctions.getFinishPromises(animations);

					// and notify client as well
					HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);

					//// follower message animation on finish
					Promise.all(animationPromises).then(() => {
						this.animationState = AnimationState.LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER: {
				// commit entries for follower nodes
				HelperFunctions.setSVGText({
						targetId: 'node-a-main-text',
						text: SET_VALUE1,
						showElement: true,
				});

				HelperFunctions.setSVGText({
					targetId: 'node-b-main-text',
					text: SET_VALUE1,
					showElement: true,
				});

				this.changeMainText("The cluster has now come to consensus about the system state");
				this.animationState = Constants.ANIMATION_STATE_FINISHED;
				this.setState({ animationFinished: true });
				resolve({
					animationState: this.animationState,
					delay: 100,
				});
				break;
			}
			case Constants.ANIMATION_STATE_FINISHED: {
				resolve({
					animationState: this.animationState,
					delay: 100,
				});
				break;
			}
			default:
				console.error('Unrecognized state: ' + this.animationState);
		}
	}

	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
	}

  render() {
    return (
	    <div>
				<div id="main-diagram">
					<MainDiagram/>
				</div>
				<div id="main-text-sect">
				</div>
	    </div>
	  );
  }

	changeMainText(text, onComplete) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete);
	}
}

export default RaftWriteAnimation;
