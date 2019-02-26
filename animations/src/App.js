import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import anime from 'animejs/lib/anime.es.js';

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

// starting position of nodes
const nodeAXPos = 42;
const nodeAYPos = 324;
const nodeCXPos = 276;
const nodeCYPos = 324;
const nodeBXPos = 168;
const nodeBYPos = 18;
const clientNodeXPos = 186;
const clientNodeYPos = 498;

const NODE_A = "NODE_A";
const NODE_B = "NODE_B";

// default delay between animations
var DEFAULT_DELAY = 2000;

class App extends Component {
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

				var nodeCVoteText = document.getElementById('node-c-vote-text');
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
				var nodeAVoteText = document.getElementById('node-a-vote-text');
				nodeAVoteText.classList.remove('visibility-hidden');
				var nodeBVoteText = document.getElementById('node-b-vote-text');
				nodeBVoteText.classList.remove('visibility-hidden');

				var nodeCVoteText = document.getElementById('node-c-vote-text');
				nodeCVoteText.textContent = 'Elected Leader';

				var nodeCOuterCircle = document.getElementById('node-c-outer-circle');
				nodeCOuterCircle.classList.remove('leader-candidate-node');
				nodeCOuterCircle.classList.add('leader-node');

				// hide node A and B's outer circles
				var nodeAOuterCircle = document.getElementById('node-a-outer-circle');
				this.hideElement(nodeAOuterCircle);

				var nodeBOuterCircle = document.getElementById('node-b-outer-circle');
				this.hideElement(nodeBOuterCircle);

				this.animationState = AnimationState.LOG_REPLICATION_START;
				this.delayedNext();
				break;
			}
			case AnimationState.LOG_REPLICATION_START: {
				var voteTexts = document.getElementsByClassName('node-vote-text');
				for (var i = 0; i < voteTexts.length; i++){
					this.hideElement(voteTexts[i]);
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
					this.showElement(clientMessage);

					var clientMessageAnimation = anime({
						targets: '#client-message',
						translateX: 100,
						translateY: -100,
						easing: 'linear',
						duration: 500,
					});
					clientMessageAnimation.finished.then(() => {
						console.log('TODO: call next here');
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
						this.animationState = AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS;
						this.delayedNext(100);
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_LEADER_RECEIVED_ALL_LOG_ACKS: {
				this.changeMainText("Once the leader receives acks from majority of follower nodes, it commits the value and sets it state to '5'", () => {
					var nodeCMainText = document.getElementById('node-c-main-text');
					nodeCMainText.textContent = "5";
					this.showElement(nodeCMainText);

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
						this.delayedNext();
					});
				});
				break;
			}
			case AnimationState.LOG_REPLICATION_FOLLOWERS_RECEIVED_COMMIT_MESSAGE_FROM_LEADER: {
				var nodeAMainText = document.getElementById('node-a-main-text');
				nodeAMainText.textContent = "5";
				this.showElement(nodeAMainText);

				var nodeBMainText = document.getElementById('node-b-main-text');
				nodeBMainText.textContent = "5";
				this.showElement(nodeBMainText);

				this.changeMainText("The cluster has now come to consensus about the system state");
				break;
			}


			default:
				console.error('Unrecognized state: ' + this.animationState);
		}
	}
	hideElement(element){
		element.classList.remove('visibility-visible');
		element.classList.add('visibility-hidden');
	}
	showElement(element){
		element.classList.remove('visibility-hidden');
		element.classList.add('visibility-visible');
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
						this.hideElement(node);
					}
				},
				onComplete: anim => {
					if (withAck) {
						node.classList.remove('log-message-ack');
					} else {
						this.showElement(node);
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
					<svg height="460" width="360">
						{/* smaller circles */}
						<circle id="node-c-message-to-b" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
						<circle id="node-c-message-to-a" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
						<circle id="client-message" className="client-message visibility-hidden" cx={clientNodeXPos} cy={clientNodeYPos - 72}/>
						<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} />

						{/* node C */}

						{/* main and outer circles */}
						<g id="node-c-wrap">
							<circle id="node-c-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
							<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
							<text id="node-c-main-text" x={nodeCXPos + 30} y={nodeCYPos + 6} className="node-text visibility-hidden" fill="black">
								<tspan>5</tspan>
							</text>
						</g>

						{/* text */}
						<text x={nodeCXPos} y={nodeCYPos} fill="black">
							<tspan x={nodeCXPos + 6} y={nodeCYPos + 66}>Node C</tspan>
							<tspan x={nodeCXPos + 6} y={nodeCYPos + 84}>Term: 0</tspan>
							<tspan id="node-c-vote-text" className="node-vote-text visibility-hidden" x={nodeCXPos - 12} y={nodeCYPos + 104}>Vote Count: 1</tspan>
						</text>

						{/* node A */}

						{/* main and outer circles */}
						<g id="node-a-wrap">
							<circle id="node-a-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
							<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
							<text id="node-a-main-text" x={nodeAXPos} y={nodeAYPos + 6} className="node-text visibility-hidden">
								<tspan>5</tspan>
							</text>
						</g>

						{/* text */}
						<text x={nodeAXPos} y={nodeAYPos + 66} fill="black">
							<tspan x={nodeAXPos - 24} y={nodeAYPos + 66}>Node A</tspan>
							<tspan x={nodeAXPos - 24} y={nodeAYPos + 84}>Term: 0</tspan>
							<tspan id="node-a-vote-text" className="node-vote-text visibility-hidden" x={nodeAXPos - 36} y={nodeAYPos + 104}>Voted For: C</tspan>

						</text>

						{/* node B */}
						<text x={nodeBXPos} y={nodeBYPos} fill="black">
							<tspan x={nodeBXPos} y={nodeBYPos + 18}>Node B</tspan>
							<tspan x={nodeBXPos} y={nodeBYPos + 36}>Term: 0</tspan>
							<tspan id="node-b-vote-text" className="node-vote-text visibility-hidden" x={nodeBXPos - 18} y={nodeBYPos + 54}>Voted For: C</tspan>
						</text>


						{/* main and outer circles */}
						<g id="node-b-wrap">
		  				<circle id="node-b-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
							<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
							<text id="node-b-main-text" x={nodeBXPos + 24} y={nodeBYPos + 108} className="node-text visibility-hidden">
								<tspan>5</tspan>
							</text>
						</g>

						{/* client node */}
						<g id="client-node">
							<circle className="client-node" cx={clientNodeXPos} cy={clientNodeYPos} />
							<text x={clientNodeXPos} y={clientNodeYPos + 9} className="client-node-text">
								<tspan>5</tspan>
							</text>
						</g>
					</svg>
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
