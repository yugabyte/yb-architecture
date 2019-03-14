
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import {Constants} from './constants';

var HelperFunctions = require('./HelperFunctions');


const ANIMATION_STATE_INITIAL = "READ_OPERATION_INITIAL";
const ANIMATION_STATE_CLIENT_INTRODUCED = "ANIMATION_STATE_CLIENT_INTRODUCED";
const ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT = "ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT";
const ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS";
const ANIMATION_STATE_ENTRY_COMMITTED_BY_FOLLOWERS = "ANIMATION_STATE_ENTRY_COMMITTED_BY_FOLLOWERS";
const ANIMATION_STATE_NODE_C_PARTITIONED = "ANIMATION_STATE_NODE_C_PARTITIONED";
const ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER = "ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER";
const ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_MESSAGE_FROM_CLIENT = "ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_MESSAGE_FROM_CLIENT";
const ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_ACK_FROM_NODE_B = "ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_ACK_FROM_NODE_B";
const ANIMATION_STATE_POST_PARTITION_NODE_A_HAS_SENT_ACK_TO_CLIENT = "ANIMATION_STATE_POST_PARTITION_NODE_A_HAS_SENT_ACK_TO_CLIENT";
const ANIMATION_STATE_POST_PARTITION_CLIENT_HAS_READ_FROM_NODE_C = "ANIMATION_STATE_POST_PARTITION_CLIENT_HAS_READ_FROM_NODE_C";

const SET_VALUE1="V1";
const SET_VALUE2="V2";
function setValueText(value) {
	return HelperFunctions.getSetValueText(value);
}

export class ReadOperationAnimation extends Component {
	constructor(props) {
		super(props);
		this.animationState = ANIMATION_STATE_INITIAL;
	}

	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
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
			case ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////
				// make Node C the Leader
				var nodeC = document.getElementById('node-c-circle');
				nodeC.classList.add('leader-node');

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				//////////////////////////////////////////////////////
				this.changeMainText('Read operation: Why performance suffers...', () => {
					var introduceClientAnimation = HelperFunctions.introduceClient(SET_VALUE1);
					introduceClientAnimation.finished.then(() => {
						this.animationState = ANIMATION_STATE_CLIENT_INTRODUCED;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					})
				});
				break;
			}
			case ANIMATION_STATE_CLIENT_INTRODUCED: {
				this.changeMainText('Client performs a set operation on leader, which starts a Raft round to replicate date data to its followers',() => {
					// client sends a message to the leader
					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE,Constants.NODE_C,false, setValueText(SET_VALUE1));

					animation.finished.then(() => {

						this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT: {
				// leader sends log message to followers and receive an ack from both
				var animations = HelperFunctions.logMessageFromLeaderToFollowers(true, setValueText(SET_VALUE1));
				var finishPromises = HelperFunctions.getFinishPromises(animations);

				// wait for both the animations to complete
				Promise.all(finishPromises).then(() => {
					// mark entry commited on leader
					HelperFunctions.setSVGText({
							targetId: "node-c-main-text",
							text:SET_VALUE1,
							showElement: true});

					this.animationState = ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS: {
				// next leader notifies followers that it has commited the entry
				var animations = HelperFunctions.logMessageFromLeaderToFollowers(false,"SET " + SET_VALUE1, true, 600);
				var finishPromises = HelperFunctions.getFinishPromises(animations);

				// and notify client as well
				HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);

				Promise.all(finishPromises).then(() => {
					// mark entry commited on both followers
					HelperFunctions.setSVGText({targetId: "node-a-main-text",text:SET_VALUE1,showElement: true});
					HelperFunctions.setSVGText({targetId: "node-b-main-text",text:SET_VALUE1,showElement: true});

					this.animationState = ANIMATION_STATE_ENTRY_COMMITTED_BY_FOLLOWERS;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});

				break;
			}
			case ANIMATION_STATE_ENTRY_COMMITTED_BY_FOLLOWERS: {
				this.changeMainText('Now imagine the Leader C gets network partitioned from its followers A and B',() => {
					// Partition Node C from followers
					HelperFunctions.partitionNodeC();

					this.animationState = ANIMATION_STATE_NODE_C_PARTITIONED;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case ANIMATION_STATE_NODE_C_PARTITIONED: {
				this.changeMainText('This results in A and B electing a new leader, say A', () => {
					var nodeA = document.getElementById('node-a-circle');
					nodeA.classList.add('leader-node');
					HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 1"});
					HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 1"});

					this.animationState = ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER;
					resolve({
						animationState: this.animationState,
						delay: 1000,
					});
				});
				break;
			}
			case ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER: {
				this.changeMainText('The client performs another operation: SET k=' + SET_VALUE2, () => {
					HelperFunctions.setSVGText({targetId: 'client-node-main-text', text: SET_VALUE2 });

					// var animation = HelperFunctions.clientMessageToNodeA();
					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE,Constants.NODE_A,false, setValueText(SET_VALUE2));

					animation.finished.then(() => {
						this.animationState = ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_MESSAGE_FROM_CLIENT;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					})
				});
				break;
			}
			case ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_MESSAGE_FROM_CLIENT: {
				this.changeMainText('This reaches A, which will replicate it to B, following the log replication process', () => {
					var animation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, setValueText(SET_VALUE2));
					animation.finished.then(() => {
						// mark A's SET operation as commited
						HelperFunctions.setSVGText({
								targetId: 'node-a-main-text',
								text: SET_VALUE2
						});

						this.animationState = ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_ACK_FROM_NODE_B;
						resolve({
							animationState: this.animationState,
							delay: 100,
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_POST_PARTITION_NODE_A_RECEIVED_ACK_FROM_NODE_B: {
				// send commit confirmation back to B
				var animation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, SET_VALUE2, false, 600);
				animation.finished.then(() => {
					// mark B's SET operation as commited
					HelperFunctions.setSVGText({
							targetId: 'node-b-extra-text',
							addCSSClass: "set-text-committed",
					});
					HelperFunctions.setSVGText({
							targetId: 'node-b-main-text',
							text: SET_VALUE2
					});
				});

				// notify client as well
				var messageToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE);

				messageToClientAnimation.finished.then(() => {
					this.changeMainText('Since A has applied the change, it responds to client with success', () => {
						this.animationState = ANIMATION_STATE_POST_PARTITION_NODE_A_HAS_SENT_ACK_TO_CLIENT;
						resolve({
							animationState: this.animationState,
							delay: 1000,
						});

					});
				});
				break;
			}
			case ANIMATION_STATE_POST_PARTITION_NODE_A_HAS_SENT_ACK_TO_CLIENT: {
				this.changeMainText('Next, the client tries to read key K from C.',() => {
					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE,Constants.NODE_C,false);

					animation.finished.then(() => {
						this.animationState = ANIMATION_STATE_POST_PARTITION_CLIENT_HAS_READ_FROM_NODE_C;
						resolve({
							animationState: this.animationState,
							delay: 1000,
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_POST_PARTITION_CLIENT_HAS_READ_FROM_NODE_C: {
				this.changeMainText('C thinks it is still the leader and responds with value: ' + SET_VALUE1 + ', which is stale', () => {

					var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE, false);
					animation.finished.then(() => {
						HelperFunctions.setSVGText({
							targetId:'client-node-main-text',
							text: SET_VALUE1,
							addCSSClass: 'stale-data-text',
						});
					})
					this.animationState = Constants.ANIMATION_STATE_FINISHED;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case Constants.ANIMATION_STATE_FINISHED: {
				console.log('Animation finished. Nothing to do');
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

	changeMainText(text, onComplete) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete);
	}

	render() {
		return(
			<div>
				<div id="main-diagram">
					<MainDiagram/>
				</div>
				<div id="main-text-sect">
				</div>
			</div>
		)
	}
}

export default ReadOperationAnimation;
