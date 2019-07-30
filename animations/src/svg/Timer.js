import React, { Component } from 'react';

class Timer extends Component {
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
