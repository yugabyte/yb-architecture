
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import {Constants} from './constants';

var HelperFunctions = require('./HelperFunctions');


const ANIMATION_STATE_INITIAL = "LEADER_LEASE_INITIAL";
const ANIMATION_STATE_INTRODUCTION_MADE = "ANIMATION_STATE_INTRODUCTION_MADE";
const ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS = "ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS";
const ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER = "ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER";
const ANIMATION_STATE_VALUE1_COMMITED = "ANIMATION_STATE_VALUE1_COMMITED";
const ANIMATION_STATE_NEW_LEADER_ELECTED = "ANIMATION_STATE_NEW_LEADER_ELECTED";
const ANIMATION_STATE_TIMER_STARTED_ON_ORIGINAL_LEADER = "ANIMATION_STATE_TIMER_STARTED_ON_ORIGINAL_LEADER";
const ANIMATION_STATE_TIMER_STARTED_ON_NEW_LEADER = "ANIMATION_STATE_TIMER_STARTED_ON_NEW_LEADER";
const ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED = "ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED";
const ANIMATION_STATE_POST_NEW_LEADER_CLIENT_SENT_VALUE2_TO_LEADER = "ANIMATION_STATE_POST_NEW_LEADER_CLIENT_SENT_VALUE2_TO_LEADER";
const ANIMATION_STATE_POST_NEW_LEADER_VALUE2_COMMITTED = "ANIMATION_STATE_POST_NEW_LEADER_VALUE2_COMMITTED";
const ANIMATION_STATE_POST_NEW_LEADER_LOG_ACK_RECEIVED_FROM_FOLLOWER = "ANIMATION_STATE_POST_NEW_LEADER_LOG_ACK_RECEIVED_FROM_FOLLOWER";

const SET_VALUE1="V1";
const SET_VALUE2="V2";
const ORIGINAL_LEADER_TIMER_DURATION = 10000;
const NODE_A_TIMER_DURATION = 22000;
const NODE_B_TIMER_DURATION = 30000;

export class LeaderLeaseAnimation extends Component {
	constructor(props) {
		super(props);
		this.state = {
		}
		this.init();
	}
	init() {
		this.animationState = ANIMATION_STATE_INITIAL;
		this.nodeATimerAnimation = null;
		this.nodeBTimerAnimation = null;
		this.nodeCTimerAnimation = null;

	}
	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
		this.timersAreActive = false;
	}

	pause() {
		if (this.timersAreActive) {
			this.pauseTimers();
		}
	}
	resume() {
		if (this.timersAreActive) {
			this.resumeTimers();
		}
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

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				//////////////////////////////////////////////////////
				this.changeMainText('Read problem solution in YugaByte DB ...', () => {
					this.changeMainText('Lets suppose Node C was initially elected as the leader', () => {
						// make Node C the Leader
						var nodeC = document.getElementById('node-c-circle');
						nodeC.classList.add('leader-node');

						this.animationState = ANIMATION_STATE_INTRODUCTION_MADE;
						resolve({
							animationState: this.animationState,
							delay: 1000,
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_INTRODUCTION_MADE: {
				this.changeMainText('Leader replicates a lease interval to followers', () => {
					var leaseToA = document.getElementById('node-c-lease-to-node-a');
					var nodeALeaseAnimation = anime({
						targets: leaseToA,
						translateX: -280,
						translateY: 0,
						easing: 'linear',
						duration: 1500,
						begin: () => {
							HelperFunctions.showElement(leaseToA);
						},
						complete: () =>{
							HelperFunctions.hideElement(leaseToA);
							leaseToA.style.transform = 'none';
						},
					});

					var leaseToB = document.getElementById('node-c-lease-to-node-b');
					var nodeBLeaseAnimation = anime({
						targets: leaseToB,
						translateX: -150,
						translateY: -210,
						easing: 'linear',
						duration: 1500,
						begin: () => {
							HelperFunctions.showElement(leaseToB);
						},
						complete: () =>{
							HelperFunctions.hideElement(leaseToB);
							leaseToB.style.transform = 'none';
						},
					});
					Promise.all([nodeALeaseAnimation.finished,nodeBLeaseAnimation.finished]).then(() => {
						// start lease timers on all nodes
						// this.nodeCTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_C, ORIGINAL_LEADER_TIMER_DURATION);
						// this.nodeATimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_A, NODE_A_TIMER_DURATION);
						// this.nodeBTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_B, NODE_B_TIMER_DURATION);
						this.startTimers();

						this.animationState = ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS;
						resolve({
							animationState: this.animationState,
							delay: 500,
						});
					});

				});
				break;
			}
			case ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS: {
				this.changeMainText('Client arrives and performs a write', () => {
					var introduceClientAnimation = HelperFunctions.introduceClient(SET_VALUE1);
					introduceClientAnimation.finished.then(() => {
						var writeAnimation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false, HelperFunctions.getSetValueText(SET_VALUE1), false, 0, this.nodeCTimerAnimation);
						writeAnimation.finished.then(() => {
							this.animationState = ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER;
							resolve({
								animationState: this.animationState,
								delay: 1000,
							});
						})
					});
				});
				break;
			}
			case ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER: {
				this.changeMainText('This starts a raft round to commit value to all nodes', () => {
					var messageToFollowerAnimations = HelperFunctions.logMessageFromLeaderToFollowers(true,"SET " + SET_VALUE1, false, 0, this.nodeATimerAnimation, this.nodeBTimerAnimation, this.nodeCTimerAnimation);
					var finishedPromises = HelperFunctions.getFinishPromises(messageToFollowerAnimations);

					Promise.all(finishedPromises).then(() => {
						HelperFunctions.setSVGText({
							targetId: "node-c-main-text",
							text:SET_VALUE1,
							showElement: true});

						// send confirmation of write to followers
						var confWriteToFollowersAnimation = HelperFunctions.logMessageFromLeaderToFollowers(false, HelperFunctions.getSetValueText(SET_VALUE1), true,600, this.nodeATimerAnimation, this.nodeBTimerAnimation);
						finishedPromises = HelperFunctions.getFinishPromises(confWriteToFollowersAnimation);

						// and notify client as well
						HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);

						// wait for confirmation to reach followers
						Promise.all(finishedPromises).then(() => {
							// commit value on followers
							HelperFunctions.setSVGText({
								targetId: "node-a-main-text",
								text:SET_VALUE1,
								showElement: true});
							HelperFunctions.setSVGText({
									targetId: "node-b-main-text",
									text:SET_VALUE1,
									showElement: true});

							this.animationState = ANIMATION_STATE_VALUE1_COMMITED;
							resolve({
								animationState: this.animationState,
								delay: 1000,
							});
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_VALUE1_COMMITED: {
				this.changeMainText('Now suppose the original leader gets network partitioned and Node A gets elected as the new leader', () => {
					// partition original leader
					HelperFunctions.partitionNodeC();

					// elect Node A as new leader candidate
					var nodeA = document.getElementById('node-a-circle');
					nodeA.classList.add('leader-candidate-node');
					HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 1"});
					HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 1"});

					this.pauseTimers();
					this.animationState = ANIMATION_STATE_NEW_LEADER_ELECTED;
					resolve({
						animationState: this.animationState,
						delay: 2000,
					});
				});
				break;
			}
			case ANIMATION_STATE_NEW_LEADER_ELECTED: {
				this.resumeTimers();
				this.changeMainText('Client tries to write to new leader but update fails, as old leader can still serve reads', () => {
						HelperFunctions.setSVGText({targetId: 'client-node-main-text', text: SET_VALUE2 });

						var messageElement = document.getElementById('client-message');
						HelperFunctions.messageFromClient(Constants.NODE_A,	{
							destinationTimerAnimation: this.nodeATimerAnimation,
							onBegin: () => {
								HelperFunctions.showElement(messageElement);
								messageElement.classList.add('log-message');
							},
							onChangeComplete: () => {
								messageElement.classList.remove('log-message');
								messageElement.classList.add('error-message');
								if (this.nodeATimerAnimation) {
									this.nodeATimerAnimation.restart();
								}
							},
							onComplete: () => {
								messageElement.classList.remove('error-message');
								messageElement.style.transform = 'none';
							},
							alternate: true,
						});

						this.nodeCTimerAnimation.finished.then(() => {
							var nodeC = document.getElementById('node-c-circle');
							nodeC.classList.remove('leader-node');

							var nodeA = document.getElementById('node-a-circle');
							nodeA.classList.remove('leader-candidate-node');
							nodeA.classList.add('leader-node');

							this.changeMainText("Original leader lease time has expired. It has stepped downed and Node A has become the leader now", () => {
								this.animationState = ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED;

								// Make sure we perform next before the new leader's timer expires
								resolve({
									animationState: this.animationState,
									delay: 1000,
								});
							}, 0);
						});
				});
				break;
			}
			case ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED: {
				this.changeMainText("From here on, client can write messages to the new leader", () => {
					this.nodeATimerAnimation.pause();

					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, HelperFunctions.getSetValueText(SET_VALUE2), false, 0, this.nodeATimerAnimation);
					animation.finished.then(() => {
						this.animationState = ANIMATION_STATE_POST_NEW_LEADER_CLIENT_SENT_VALUE2_TO_LEADER;
						resolve({
							animationState: this.animationState,
							delay: 1000,
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_POST_NEW_LEADER_CLIENT_SENT_VALUE2_TO_LEADER: {
				var messageToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, HelperFunctions.getSetValueText(SET_VALUE2), false, 0, this.nodeBTimerAnimation);

				messageToBAnimation.finished.then(() => {
					HelperFunctions.setSVGText({targetId: 'node-a-main-text', text: SET_VALUE2 });

					this.animationState = ANIMATION_STATE_POST_NEW_LEADER_LOG_ACK_RECEIVED_FROM_FOLLOWER;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case ANIMATION_STATE_POST_NEW_LEADER_LOG_ACK_RECEIVED_FROM_FOLLOWER: {
				var confirmToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE, false, HelperFunctions.getSetValueText(SET_VALUE2), 0);
				var confirmToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, HelperFunctions.getSetValueText(SET_VALUE2), true, 300, this.nodeBTimerAnimation);

				Promise.all([confirmToClientAnimation.finished, confirmToBAnimation.finished]).then(() => {
					HelperFunctions.setSVGText({targetId: 'node-b-main-text', text: SET_VALUE2 });

					this.animationState = ANIMATION_STATE_POST_NEW_LEADER_VALUE2_COMMITTED;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case ANIMATION_STATE_POST_NEW_LEADER_VALUE2_COMMITTED: {
				this.stopTimers();
				this.animationState = Constants.ANIMATION_STATE_FINISHED;
				resolve({
					animationState: this.animationState,
					delay: 100,
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
	changeMainText(text, onComplete, delay) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete, delay);
	}
	restartTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.restart();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.restart();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.restart();
		}
	}
	stopTimers() {
		this.timersAreActive = false;
		this.pauseTimers();
	}
	pauseTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.pause();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.pause();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.pause();
		}
	}
	resumeTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.play();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.play();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.play();
		}
	}
	startTimers() {
		this.timersAreActive = true;
		this.nodeCTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_C, ORIGINAL_LEADER_TIMER_DURATION);
		this.nodeATimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_A, NODE_A_TIMER_DURATION);
		this.nodeBTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_B, NODE_B_TIMER_DURATION);
	}

	render() {
		return(
			<div>
				<div id="main-diagram" >
					<MainDiagram/>
				</div>
				<div id="main-text-sect">
				</div>
			</div>
		)
	}
}

export default LeaderLeaseAnimation;
