import React, { Component } from 'react';

import Timer from './svg/Timer';
import HorizontalTimer from './svg/HorizontalTimer';


class Test extends Component {

	constructor(props) {
		super(props);
		// this.timer = React.createRef();
	}
	render() {
		return (
			<div>
				{/*<Timer timerId={"timer-1"} ref={ t => this.timer = t}/>*/}
				<HorizontalTimer uid="1" ref={ t => this.timer = t}/>

			</div>
		)
	}
	componentDidMount() {

		// anime({
  	// 	targets: '#horizontal-timer-rect',
  	// 	width: '0%', // -> from '28px' to '100%',
  	// 	easing: 'easeInOutQuad',
		// });
		// debugger;
		this.timer.startTimer();
	}
}
export default Test;
