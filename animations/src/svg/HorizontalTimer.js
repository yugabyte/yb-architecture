import React, { Component } from 'react';

import anime from 'animejs/lib/anime.es.js';

class HorizontalTimer extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<g transform="translate(10,10)">
				<rect className={this.props.className} id={this.props.uid} x={this.props.x} y={this.props.y} width="80" height="6" rx="2.5" ry="2.55" strokeWidth="1px" fill="#333" stroke="555" />
			</g>
		)
	}
	startTimer() {
		// var targetId = "#"+ "htimer-rect-" + this.props.uid;
		// console.log('Target Id: ' + targetId);
		// var animation = anime({
		// 	targets: targetId,
		// 	width: '0%',
		// 	easing: 'linear',
		// 	duration: 2000,
		// });
		// return animation;
	}
}

export default HorizontalTimer;
