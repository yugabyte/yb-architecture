import React, { Component } from 'react';
import anime from 'animejs/lib/anime.es.js';


class Timer extends Component {
	/*
	<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
			<g id="timer" transform="translate(10,10)">
				<circle id="face" stroke="black" stroke-width="3px" cx="28" cy="30" r="30" fill="transparent"/>
				<g id="hands">
					<rect id="needle" x="26" y="4" width="2" height="29" rx="2.5" ry="2.55" stroke-width="2px" fill="#333" stroke="555" />
				</g>
			</g>
	</svg>
*/
	constructor(props) {
		super(props);
		this.startTimer = this.startTimer.bind(this);
	}
	render() {
		return (
			<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
					<g transform="translate(10,10)">
						<circle id={this.props.timerId} className="timer-face"  strokeWidth="3px" cx="28" cy="30" r="30" fill="transparent"/>
					</g>
			</svg>
		)
	}
	startTimer() {
		var timerFace = document.getElementById(this.props.timerId);
		timerFace.classList.add('timer-countdown-animation');
	}
}

export default Timer;
