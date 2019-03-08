
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

const SET_VALUE1="V1";
const SET_VALUE2="V2";
const ORIGINAL_LEADER_TIMER_DURATION = 10000;
const NEW_LEADER_TIMER_DURATION = 20000;

export class LeaderLeaseAnimation extends Component {
	constructor(props) {
		super(props);
		this.animationState = ANIMATION_STATE_INITIAL;
	}

	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
		HelperFunctions.delayedNext(this,100);
	}

	next() {
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
						HelperFunctions.delayedNext(this, 1000);
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
						duration: 1000,
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
						duration: 1000,
						begin: () => {
							HelperFunctions.showElement(leaseToB);
						},
						complete: () =>{
							HelperFunctions.hideElement(leaseToB);
							leaseToB.style.transform = 'none';
						},
					});
					Promise.all([nodeALeaseAnimation,nodeBLeaseAnimation]).then(() => {
						this.animationState = ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS;
						HelperFunctions.delayedNext(this, 1000);
					})

				});
				break;
			}
			case ANIMATION_STATE_LEASES_SENT_TO_FOLLOWERS: {
				this.changeMainText('Client arrives and performs a write', () => {
					var introduceClientAnimation = HelperFunctions.introduceClient(SET_VALUE1);
					introduceClientAnimation.finished.then(() => {
						var writeAnimation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false, HelperFunctions.getSetValueText(SET_VALUE1));
						writeAnimation.finished.then(() => {
							this.animationState = ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER;
							HelperFunctions.delayedNext(this, 1000);
						})
					});
				});
				break;
			}
			case ANIMATION_STATE_CLIENT_WROTE_TO_ORIGINAL_LEADER: {
				this.changeMainText('This starts a raft round to commit value to all nodes', () => {
					var messageToFollowerAnimations = HelperFunctions.logMessageFromLeaderToFollowers(true,"SET " + SET_VALUE1, false);
					var finishedPromises = HelperFunctions.getFinishPromises(messageToFollowerAnimations);

					Promise.all(finishedPromises).then(() => {
						HelperFunctions.setSVGText({
							targetId: "node-c-main-text",
							text:SET_VALUE1,
							showElement: true});

						// send confirmation of write to followers
						var confWriteToFollowersAnimation = HelperFunctions.logMessageFromLeaderToFollowers(false, HelperFunctions.getSetValueText(SET_VALUE1), true);
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
							HelperFunctions.delayedNext(this, 1000);
						});
					});
				});
				break;
			}
			case ANIMATION_STATE_VALUE1_COMMITED: {
				this.changeMainText('Now suppose the original leader gets network partitioned and Node A gets elected as the new leader', () => {
					// partition original leader
					HelperFunctions.partitionNodeC();

					// elect Node A as new leader
					var nodeA = document.getElementById('node-a-circle');
					nodeA.classList.add('leader-node');
					HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 1"});
					HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 1"});

					this.animationState = ANIMATION_STATE_NEW_LEADER_ELECTED;
					HelperFunctions.delayedNext(this, 1000);
				});
				break;
			}
			case ANIMATION_STATE_NEW_LEADER_ELECTED: {
				this.changeMainText('Leader lease timer kicks off on original leader', () => {
					this.originalLeaderTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_C, ORIGINAL_LEADER_TIMER_DURATION);

					this.animationState = ANIMATION_STATE_TIMER_STARTED_ON_ORIGINAL_LEADER;
					HelperFunctions.delayedNext(this, 1000);
				});
				break;
			}
			case ANIMATION_STATE_TIMER_STARTED_ON_ORIGINAL_LEADER: {
				this.changeMainText('Lease timer starts on new leader as well', () => {
						this.newLeaderTimerAnimation = HelperFunctions.startLeaseTimer(Constants.NODE_A, NEW_LEADER_TIMER_DURATION);

						this.animationState = ANIMATION_STATE_TIMER_STARTED_ON_NEW_LEADER;
						HelperFunctions.delayedNext(this, 1000);
				});
				break;
			}
			case ANIMATION_STATE_TIMER_STARTED_ON_NEW_LEADER: {
				this.changeMainText('Client tries to write to new leader but update fails, as old leader can still serve reads', () => {
						HelperFunctions.setSVGText({targetId: 'client-node-main-text', text: SET_VALUE2 });

						var messageElement = document.getElementById('client-message');
						HelperFunctions.messageFromClient(Constants.NODE_A,{
							onBegin: () => {
								HelperFunctions.showElement(messageElement);
								messageElement.classList.add('log-message');
							},
							onChangeComplete: () => {
								messageElement.classList.remove('log-message');
								messageElement.classList.add('error-message');
							},
							onComplete: () => {
								messageElement.classList.remove('error-message');
								messageElement.style.transform = 'none';
							},
							alternate: true,
						});

						this.originalLeaderTimerAnimation.finished.then(() => {
							var nodeC = document.getElementById('node-c-circle');
							nodeC.classList.remove('leader-node');

							this.animationState = ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED;

							// 0 is intentional below, we want perform the next step ASAP as we don't want
							// the new leader's timer to expire as well
							HelperFunctions.delayedNext(this, 0);
						});
				});
				break;
			}
			case ANIMATION_STATE_ORIGINAL_LEADER_TIMER_EXPIRED: {
				this.changeMainText("Once the original leader's lease timer expires and it has stepped downed, client can write messages to the new leader", () => {
					this.newLeaderTimerAnimation.pause();

					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, true);
					animation.finished.then(() => {
						// simply set VALUE2 to on all nodes
						HelperFunctions.setSVGText({targetId: 'node-a-main-text', text: SET_VALUE2 });
						HelperFunctions.setSVGText({targetId: 'node-b-main-text', text: SET_VALUE2 });
					});
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

export default LeaderLeaseAnimation;
