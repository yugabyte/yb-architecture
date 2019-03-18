import React, { Component } from 'react';

import anime from 'animejs/lib/anime.es.js';

class HorizontalTimer extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<g transform="translate(10,10)" className={this.props.className} id={this.props.uid}>
				<text x={this.props.x + 36} y={this.props.y - 4} fill="black">
					{this.props.label}
				</text>
				<rect id={this.props.uid + '-inner'} x={this.props.x + 32} y={this.props.y} width="80" height="6" rx="2.5" ry="2.55" strokeWidth="1px" fill="#333" stroke="#555" />
				<rect id={this.props.uid + '-outer'} x={this.props.x + 32} y={this.props.y} width="80" height="7" rx="2.5" ry="2.55" strokeWidth="2px" fill="transparent" stroke="black" />}
			</g>
		)
	}
	startTimer() {
		// TODO
	}
}

export default HorizontalTimer;
