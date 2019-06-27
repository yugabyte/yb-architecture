import React, { Component } from 'react';

import SmallClock from './SmallClock';
import HorizontalTimer from './HorizontalTimer';
import {Constants} from '../constants';

var HelperFunctions = require('../HelperFunctions');


// starting position of nodes
const nodeABaseXPos = 42;
const nodeABaseYPos = 324;

const nodeCBaseXPos = 320;
const nodeCBaseYPos = 324;

const nodeBBaseXPos = 168;
const nodeBBaseYPos = 42;

const clientNodeXPos = 186;
const clientNodeYPos = 550;

export const clientNodePositions = {
	mainText: {
		x: clientNodeXPos,
		y: clientNodeYPos + 9
	},
	clientMessage: {
		x: clientNodeXPos,
		y: clientNodeYPos - 72
	},
}

export const nodeAPositions = {
	base: {
		x: nodeABaseXPos,
		y: nodeABaseYPos
	},
	messageToB: {
		x: nodeABaseXPos + 6,
		y: nodeABaseYPos
	},
	messageToClient: {
		x: nodeABaseXPos + 6,
		y: nodeABaseYPos
	},
	leaseTimer: {
		x: nodeABaseXPos - 48,
		y: nodeABaseYPos + 108
	}
}

export const nodeCPositions = {
	base: {
		x: nodeCBaseXPos,
		y: nodeCBaseYPos
	},
	messageToB: {
		x:nodeCBaseXPos+32 ,
		y:nodeCBaseYPos
	},
	messageToA: {
		x:nodeCBaseXPos+32 ,
		y:nodeCBaseYPos
	},
	messageToClient: {
		x:nodeCBaseXPos+32 ,
		y:nodeCBaseYPos
	},
	partitionText1: {
		x: nodeCBaseXPos - 50,
		y: nodeCBaseYPos - 100
	},
	partitionText2: {
		x: nodeCBaseXPos - 50,
		y: nodeCBaseYPos - 85
	}
}

export const nodeBPositions = {
	base: {
		x: nodeBBaseXPos,
		y: nodeBBaseYPos
	},
}

class MainDiagram extends Component {

	render() {
		// Initialize variables for each node location
		// These are numbers so we can't destructure..
		const clientX = clientNodePositions.clientMessage.x;
		const clientY = clientNodePositions.clientMessage.y;
		const nodeAX = nodeAPositions.base.x;
		const nodeAY = nodeAPositions.base.y;
		const nodeBX = nodeBPositions.base.x;
		const nodeBY = nodeBPositions.base.y;
		const nodeCX = nodeCPositions.base.x;
		const nodeCY = nodeCPositions.base.y;

		return (
			<svg height="500" width="720">
				{/* reusable analog clock */}
				<defs>
					<SmallClock/>
				</defs>

				{/* smaller circles */}
				<circle id="node-c-message-to-b" className="node-small-circle" cx={nodeCPositions.messageToB.x} cy={nodeCPositions.messageToB.y} />
				<circle id="node-c-message-to-a" className="node-small-circle" cx={nodeCPositions.messageToA.x} cy={nodeCPositions.messageToB.y} />
				<circle id="node-c-message-to-client" className="node-small-circle visibility-hidden" cx={nodeCPositions.messageToClient.x} cy={nodeCPositions.messageToClient.y} />

				<text id="client-message-status" x={clientX - 30} y={clientY - 130} className="visibility-hidden">
					<tspan id="client-message-status-text1" x={clientX - 30} dy="1.2em"></tspan>
					<tspan id="client-message-status-text2" x={clientX - 30} dy="1.2em"></tspan>
				</text>
				<polygon id="client-message-bubble" className="visibility-hidden" points={`${clientX + 20},${clientY - 40} ${clientX + 20},${clientY - 70} ${clientX - 40},${clientY - 70} ${clientX - 40},${clientY - 140} ${clientX + 100},${clientY - 140} ${clientX + 100},${clientY - 70} ${clientX + 40},${clientY - 70}`} style={{fillOpacity: 0, stroke:'black',strokeWidth:1}} />
				
				<g id="client-message" className="visibility-hidden">
					<circle id="client-message-circle" className="client-message" cx={clientX} cy={clientY}/>
					<text id="client-message-text" x={clientX - 18} y={clientY + 24}>
					</text>
				</g>
				
				<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBX + 24} cy={nodeBY + 12} />

				<circle id="node-a-message-to-b" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToB.x} cy={nodeAPositions.messageToB.y} />
				<circle id="node-a-message-to-client" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToClient.x} cy={nodeAPositions.messageToClient.y} />

				{/* lease messages */}
				<g id="node-c-lease-to-node-a" className="visibility-hidden">
					<use href="#analog-clock" x={nodeCX + 6} y={nodeCY - 36}/>
				</g>
				<g id="node-c-lease-to-node-b" className="visibility-hidden">
					<use href="#analog-clock" x={nodeCX + 24} y={nodeCY - 36}/>
				</g>

				<g id="node-a-lease-to-node-b" className="">
					<use href="#analog-clock" x={nodeAX} y={nodeAY - 36}/>
				</g>

				{/* node C */}

				{/* partition around C */}

				<g id="node-c-partition-wrap" className="visibility-hidden">
					<path d="M250,330a83.832377,83.832377,0,1,1,200,30" id="node-c-partition" className="node-partition"/>
					<text fill="black">
						<tspan x={nodeCPositions.partitionText1.x} y={nodeCPositions.partitionText1.y}>Partitioned</tspan>
						<tspan x={nodeCPositions.partitionText2.x} y={nodeCPositions.partitionText2.y}>from A & B</tspan>
					</text>
				</g>

				{/* main and outer circles */}
				<g id="node-c-wrap">
					<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCX + 32} cy={nodeCY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-c-circle" cx={nodeCX + 32} cy={nodeCY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-c-main-text" x={nodeCX + 30} y={nodeCY + 6} className="node-text" fill="black">
						Node C
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_C)} x={nodeCX - 48} y={nodeCY + 118}
					label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_C)} x={nodeCX - 48} y={nodeCY + 148}
					label={"Leader Lease"}/>
				</g>

				<text x={nodeCX} y={nodeCY} fill="black">
					<tspan id="node-c-term-text" x={nodeCX + 6} y={nodeCY + 72}>Term: 1</tspan>
					<tspan id="node-c-extra-text" className="node-extra-text visibility-hidden" x={nodeCX + 6} y={nodeCY + 90}>Vote Count: 1</tspan>
					<tspan id="node-c-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeCX - 6} y={nodeCY + 108} >FOO</tspan>
				</text>

				{/* speech bubble */}
				<text id="node-c-message-status" x={nodeCX - 10} y={nodeCY - 130} className="visibility-hidden">
					<tspan id="node-c-message-status-text1" x={nodeCX - 10} dy="1.2em"></tspan>
					<tspan id="node-c-message-status-text2" x={nodeCX - 10} dy="1.2em"></tspan>
				</text>
				<polygon id="node-c-message-bubble" className="visibility-hidden" points={`${nodeCX + 40},${nodeCX - 40} ${nodeCX + 40},${nodeCY - 70} ${nodeCX - 20},${nodeCY - 70} ${nodeCX - 20},${nodeCY - 140} ${nodeCX + 200},${nodeCY - 140} ${nodeCX + 200},${nodeCY - 70} ${nodeCX + 60},${nodeCY - 70}`} style={{fillOpacity: 0, stroke:'black',strokeWidth:1}} />

				{/* node A */}

				{/* main and outer circles */}
				<g id="node-a-wrap">
					<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAX} cy={nodeAY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-a-circle" cx={nodeAX} cy={nodeAY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-a-main-text" x={nodeAX} y={nodeAY + 6} className="node-text">
						Node A
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 12} label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 42} label={"Leader Lease"}/>
				</g>

				{/* text */}
				<text x={nodeAX} y={nodeAY + 66} fill="black">
					<tspan id="node-a-term-text" className="highlighted" x={nodeAX - 24} y={nodeAY + 72}>Term: 1</tspan>
					<tspan id="node-a-extra-text" className="node-extra-text visibility-hidden" x={nodeAX - 24} y={nodeAY + 90}>Voted For: C</tspan>
					<tspan id="node-a-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeAX - 36} y={nodeAY + 108} ></tspan>

				</text>

				{/* speech bubble */}
				<text id="node-a-message-status" x={nodeAX - 10} y={nodeAY - 130} className="visibility-hidden">
					<tspan id="node-a-message-status-text1" x={nodeAX - 30} dy="1.2em"></tspan>
					<tspan id="node-a-message-status-text2" x={nodeAX - 30} dy="1.2em"></tspan>
				</text>
				<polygon id="node-a-message-bubble" className="visibility-hidden" points={`${nodeAX + 20},${nodeAY - 40} ${nodeAX + 20},${nodeAY - 70} ${nodeAX - 40},${nodeAY - 70} ${nodeAX - 40},${nodeAY - 140} ${nodeAX + 100},${nodeAY - 140} ${nodeAX + 100},${nodeAY - 70} ${nodeAX + 40},${nodeAY - 70}`} style={{fillOpacity: 0, stroke:'black',strokeWidth:1}} />

				{/* node B */}

				{/* main and outer circles */}
				<g id="node-b-wrap">
					<circle id="node-b-circle" cx={nodeBX + 24} cy={nodeBY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBX + 24} cy={nodeBY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<text id="node-b-main-text" x={nodeBX + 24} y={nodeBY + 6} className="node-text">
						Node B
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_B)} x={nodeBX - 54} y={nodeBY + 120} label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_B)} x={nodeBX - 54} y={nodeBY + 148} label="Leader Lease"/>
				</g>

				{/* text */}
				<text x={nodeBX} y={nodeBY} fill="black">
					<tspan id="node-b-term-text" x={nodeBX} y={nodeBY + 72}>Term: 1</tspan>
					<tspan id="node-b-extra-text" className="node-extra-text visibility-hidden" x={nodeBX} y={nodeBY + 90}>Voted For: C</tspan>
					<tspan id="node-b-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeBX - 12} y={nodeBY + 108} ></tspan>
				</text>

				{/* client node */}
				<g id="client-node">
					<circle className="client-node" cx={clientNodeXPos} cy={clientNodeYPos} />
					<text id="client-node-main-text" x={clientNodeXPos} y={clientNodeYPos + 9} className="client-node-text">
						Client
					</text>
					<text id="client-node-value" x={clientNodeXPos + 40} y={clientNodeYPos + 9}></text>
				</g>

			</svg>

		);
	}
}
export default MainDiagram;
