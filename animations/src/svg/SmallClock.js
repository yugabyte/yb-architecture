import React, { Component } from 'react';

class SmallClock extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
					<g id="analog-clock" transform="translate(10,10)">
						<circle id="face" stroke="black" strokeWidth="3px" cx="10" cy="20" r="10" fill="transparent"/>
						<g id="hands">
							<rect id="hour" x="9" y="12" width="2" height="10" rx="2.5" ry="2.55" strokeWidth="1px" fill="#333" stroke="555" />
							<rect id="min" x="9" y="20" width="9" height="2" rx="2.5" ry="2.55" strokeWidth="1px" fill="#333" stroke="555" />
						</g>
					</g>
			</svg>
		)
	}
}

export default SmallClock;
