import React, { Component } from 'react';
import './App.css';
import {Constants} from './constants';

var HelperFunctions = require('./HelperFunctions');

const RUN_MODE_CONTINUOUS = "CONTINOUS";

class AnimationRunner extends Component {
	constructor(props) {
		super(props);
		this.onPlayClicked = this.onPlayClicked.bind(this);
		this.onRestartClicked = this.onRestartClicked.bind(this);

		this.state = {
			animationPlaying: false,
		}
	}
	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
		// HelperFunctions.delayedNext(this,100);
		setTimeout(() => this.next(), 100);
	}
	changeMainText(text, onComplete) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete);
	}

	next(){
		this.setState({ animationPlaying: true });

		var promise = this.currentAnimation.onNext();
		promise.then( result => {
			console.log('Result: ' + JSON.stringify(result));
			this.setState({ animationPlaying: false });
			setTimeout(() => {
				if (this.runMode == RUN_MODE_CONTINUOUS ) {
					this.currentAnimation.resume();
					this.next();
				} else {
					this.currentAnimation.pause();
				}
			},
			(result.delay?result.delay:Constants.DEFAULT_DELAY));
		});
	}

	onPlayClicked() {
		this.next();
	}
	onRestartClicked() {
		this.restart();
	}

	restart() {
		window.location.reload();
	}

	render() {
		// In React, names starting with a capital letter will compile to the createComponent method
		// (credit: https://medium.com/@Carmichaelize/dynamic-tag-names-in-react-and-jsx-17e366a684e9)
		// This is done so that we can use animationToRun as a tag in the JSX below
		const Animation = this.props.animationToRun;
		const disableNext = this.state.animationPlaying || 
			(this.currentAnimation && this.currentAnimation.state.animationFinished);
		return(
			<div className="animation-runner">
				<div id="main-text-sect"></div>
				<Animation ref={n => this.currentAnimation = n}></Animation>
				<div className="control-btns">
					<button id="animation-ctrl-next" className="yb-btn" disabled={disableNext} onClick={this.onPlayClicked}>
						<i className="fas fa-play" aria-hidden="true"></i>
						<span className="yb-button-text">Next</span>
					</button>
					<button id="animation-ctrl-restart" className="yb-btn" onClick={this.onRestartClicked}>
						<i className="fas fa-fast-backward" aria-hidden="true"></i>
						<span className="yb-button-text">Restart</span>
					</button>
				</div>
			</div>
		)
	}
}

export default AnimationRunner;
