import React, { Component } from 'react';

// The animation super class. All animations should derive from this class

export var AnimationConstants = {
	DEFAULT_DELAY: 2000,
};

export class Animation extends Component {
	constructor(props) {
		super(props);
	}
	next() {
		throw new Error("Abstract method called");
	}
	delayedNext(delay) {
		if (!delay) {
			delay = AnimationConstants.DEFAULT_DELAY;
		}
		setTimeout(() => this.next(), delay);
	}
}

export default Animation;
