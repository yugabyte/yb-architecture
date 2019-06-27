
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';

var HelperFunctions = require('./HelperFunctions');


const ANIMATION_STATE_INITIAL = "RAFT_READ_OPERATION_INITIAL";
const ANIMATION_STATE_CLIENT_INTRODUCED = "ANIMATION_STATE_CLIENT_INTRODUCED";
const ANIMATION_STATE_PERFORMED_READ_ON_LEADER = "ANIMATION_STATE_PERFORMED_READ_ON_LEADER";
const ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS";

const SET_VALUE1="V1";
const SET_VALUE2="V2";

export class RaftReadOperationAnimation extends Component {
	constructor(props) {
		super(props);
		this.animationState = ANIMATION_STATE_INITIAL;
		this.state = {
			animationFinished: false,
		}
	}

	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
	}

	pause(){

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
				var introduceClientAnimation = HelperFunctions.introduceClient('');

				introduceClientAnimation.finished.then(() => {					
					HelperFunctions.showElement(document.getElementById('client-message'));
					this.animationState = ANIMATION_STATE_CLIENT_INTRODUCED;
					resolve({
						animationState: ANIMATION_STATE_CLIENT_INTRODUCED,
						delay: 100,
					});
				})
				break;
			}
			case ANIMATION_STATE_CLIENT_INTRODUCED: {				
				this.animationState = ANIMATION_STATE_PERFORMED_READ_ON_LEADER;
				const statusElem = document.getElementById('client-message-status');
				const content = {
					index: 0,
					str: 'Performing read..'
				}
				const statusTextLine2 = document.getElementById('client-message-status-text2');
				
				document.getElementById('client-message-status-text1').textContent = 'Client: ';
				HelperFunctions.showElement(document.getElementById('client-message-bubble'));
				HelperFunctions.showElement(statusElem);
				anime({
					targets: content,
					index: content.str.length,
					easing: 'linear',
					duration: 800,
					update: function() {
						statusTextLine2.textContent = content.str.substr(0, content.index);
					},
					complete: () => HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false)
				});
				resolve({
					animationState: this.animationState,
					delay: 1000
				});
				break;
			}
			case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
				// 'Leader contacts followers to obtain a consensus on current value'
				HelperFunctions.hideElement(document.getElementById('client-message-status'));
				HelperFunctions.hideElement(document.getElementById('client-message-bubble'));
				HelperFunctions.logMessageFromLeaderToFollowers(true);
				const statusElem = document.getElementById('node-c-message-status');
				HelperFunctions.showElement(document.getElementById('node-c-message-bubble'));
				HelperFunctions.showElement(statusElem);
				const contentLine1 = {
					index: 7,
					str: 'Leader: Contacting followers'
				}
				const contentLine2 = {
					index: 0,
					str: 'to obtain consensus value.'
				}
				const leaderTextLine1 = document.getElementById('node-c-message-status-text1');
				const leaderTextLine2 = document.getElementById('node-c-message-status-text2')
				anime({
					targets: contentLine1,
					index: contentLine1.str.length,
					easing: 'linear',
					duration: 1000,
					update: function() {
						leaderTextLine1.textContent = contentLine1.str.substr(0, contentLine1.index);
					},
					complete: () => {
						anime({
							targets: contentLine2,
							index: contentLine2.str.length,
							easing: 'linear',
							duration: 1300,
							update: function() {
								leaderTextLine2.textContent = contentLine2.str.substr(0, contentLine2.index);
							}
						});
					}
				});
				
				this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS;
				resolve({
					animationState: this.animationState,
					delay: 1000
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS: {
				// 'Once majority is obtained. The leader returns value back to the client'
				document.getElementById('node-c-message-status-text1').textContent = 'Leader:';
				document.getElementById('node-c-message-status-text2').textContent = '';
				const leaderText1 = {
					index: 7,
					str: 'Leader: Majority obtained.'
				}
				const leaderText2 = {
					index: 0,
					str: 'Returning value to client..'
				}
				const ltxt1 = document.getElementById('node-c-message-status-text1');
				const ltxt2 = document.getElementById('node-c-message-status-text2')
				anime({
					targets: leaderText1,
					index: leaderText1.str.length,
					easing: 'linear',
					duration: 900,
					update: function() {
						ltxt1.textContent = leaderText1.str.substr(0, leaderText1.index);
					},
					complete: () => {
						anime({
							targets: leaderText2,
							index: leaderText2.str.length,
							easing: 'linear',
							duration: 1350,
							update: function() {
								ltxt2.textContent = leaderText2.str.substr(0, leaderText2.index);
							},
							complete: () => {
								var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);
								animation.finished.then(() => {
									HelperFunctions.setSVGText({targetId: 'client-node-value', text: `Value: ${SET_VALUE1}`, showElement: true });

									this.animationState = Constants.ANIMATION_STATE_FINISHED;
									this.setState({ animationFinished: true });
									resolve({
										animationState: this.animationState,
										delay: 100
									});
								});
							}
						});
					}
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
			default: {
				console.error('Unrecognized state: ' + this.animationState);
				reject('Unrecognized state: ' + this.animationState);
			}
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
			</div>
		)
	}
}

export default RaftReadOperationAnimation;
