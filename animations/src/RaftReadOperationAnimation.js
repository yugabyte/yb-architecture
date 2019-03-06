
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import {Constants} from './constants';

var HelperFunctions = require('./HelperFunctions');


const ANIMATION_STATE_INITIAL = "RAFT_READ_OPERATION_INITIAL";
const ANIMATION_STATE_CLIENT_INTRODUCED = "ANIMATION_STATE_CLIENT_INTRODUCED";
const ANIMATION_STATE_PERFORMED_READ_ON_LEADER = "ANIMATION_STATE_PERFORMED_READ_ON_LEADER";
const ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS";

const SET_VALUE1="V1";
const SET_VALUE2="V2";
function setValueText(value) {
	return "SET " + value;
}

export class RaftReadOperationAnimation extends Component {
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
				// make Node C the Leader
				var nodeC = document.getElementById('node-c-circle');
				nodeC.classList.add('leader-node');

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				//////////////////////////////////////////////////////
				this.changeMainText('Read problem solution in Raft ...', () => {
					var introduceClientAnimation = HelperFunctions.introduceClient(SET_VALUE1);
					introduceClientAnimation.finished.then(() => {
						this.animationState = ANIMATION_STATE_CLIENT_INTRODUCED;
						HelperFunctions.delayedNext(this, 100);
					})
				});
				break;
			}
			case ANIMATION_STATE_CLIENT_INTRODUCED: {
				this.changeMainText('Client performs a read operation', () => {
					var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
					this.animationState = ANIMATION_STATE_PERFORMED_READ_ON_LEADER;
					HelperFunctions.delayedNext(this, 1000);
				});
				break;
			}
			case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
				this.changeMainText('Leader contacts followers to obtain a consensus on current value', () => {
					var animation = HelperFunctions.logMessageFromLeaderToFollowers(true);
					this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS;
					HelperFunctions.delayedNext(this, 1000);
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS: {
				this.changeMainText('Once majority is obtained. The leader returns value back to the client', () => {
					var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);
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

export default RaftReadOperationAnimation;
