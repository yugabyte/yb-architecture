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
		const clientX = clientNodePositions.clientMessage.x;
		const clientY = clientNodePositions.clientMessage.y;

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
					<circle id="client-message-circle" className="client-message" cx={clientNodePositions.clientMessage.x} cy={clientNodePositions.clientMessage.y}/>
					<text id="client-message-text" x={clientNodePositions.clientMessage.x - 18} y={clientNodePositions.clientMessage.y + 24}>
					</text>
				</g>
				
				<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBPositions.base.x + 24} cy={nodeBPositions.base.y + 12} />

				<circle id="node-a-message-to-b" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToB.x} cy={nodeAPositions.messageToB.y} />
				<circle id="node-a-message-to-client" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToClient.x} cy={nodeAPositions.messageToClient.y} />

				{/* lease messages */}
				<g id="node-c-lease-to-node-a" className="visibility-hidden">
					<use href="#analog-clock" x={nodeCPositions.base.x + 6} y={nodeCPositions.base.y - 36}/>
				</g>
				<g id="node-c-lease-to-node-b" className="visibility-hidden">
					<use href="#analog-clock" x={nodeCPositions.base.x + 24} y={nodeCPositions.base.y - 36}/>
				</g>

				<g id="node-a-lease-to-node-b" className="">
					<use href="#analog-clock" x={nodeAPositions.base.x} y={nodeAPositions.base.y - 36}/>
				</g>

				{/* node C */}

				{/* partition around C */}

				<g id="node-c-partition-wrap" className="visibility-hidden">
					<path d="M210,340a83.832377,83.832377,0,1,1,211,30" id="node-c-partition" className="node-partition"/>
					<text fill="black">
						<tspan x={nodeCPositions.partitionText1.x} y={nodeCPositions.partitionText1.y}>Partitioned</tspan>
						<tspan x={nodeCPositions.partitionText2.x} y={nodeCPositions.partitionText2.y}>from A & B</tspan>
					</text>
				</g>

				{/* main and outer circles */}
				<g id="node-c-wrap">
					<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCPositions.base.x+32} cy={nodeCPositions.base.y} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-c-circle" cx={nodeCPositions.base.x+32} cy={nodeCPositions.base.y} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-c-main-text" x={nodeCPositions.base.x + 30} y={nodeCPositions.base.y + 6} className="node-text" fill="black">
						Node C
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_C)} x={nodeCPositions.base.x - 48} y={nodeCPositions.base.y + 118}
					label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_C)} x={nodeCPositions.base.x - 48} y={nodeCPositions.base.y + 148}
					label={"Leader Lease"}/>
				</g>

				<text x={nodeCPositions.base.x} y={nodeCPositions.base.y} fill="black">
					<tspan id="node-c-term-text" x={nodeCPositions.base.x + 6} y={nodeCPositions.base.y + 72}>Term: 1</tspan>
					<tspan id="node-c-extra-text" className="node-extra-text visibility-hidden" x={nodeCPositions.base.x + 6} y={nodeCPositions.base.y + 90}>Vote Count: 1</tspan>
					<tspan id="node-c-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeCPositions.base.x - 6} y={nodeCPositions.base.y + 108} >FOO</tspan>
				</text>

				{/* speech bubble */}
				<text id="node-c-message-status" x={nodeCPositions.base.x - 10} y={nodeCPositions.base.y - 130} className="visibility-hidden">
					<tspan id="node-c-message-status-text1" x={nodeCPositions.base.x - 10} dy="1.2em"></tspan>
					<tspan id="node-c-message-status-text2" x={nodeCPositions.base.x - 10} dy="1.2em"></tspan>
				</text>
				<polygon id="node-c-message-bubble" className="visibility-hidden" points={`${nodeCPositions.base.x + 40},${nodeCPositions.base.x - 40} ${nodeCPositions.base.x + 40},${nodeCPositions.base.y - 70} ${nodeCPositions.base.x - 20},${nodeCPositions.base.y - 70} ${nodeCPositions.base.x - 20},${nodeCPositions.base.y - 140} ${nodeCPositions.base.x + 200},${nodeCPositions.base.y - 140} ${nodeCPositions.base.x + 200},${nodeCPositions.base.y - 70} ${nodeCPositions.base.x + 60},${nodeCPositions.base.y - 70}`} style={{fillOpacity: 0, stroke:'black',strokeWidth:1}} />

				{/* node A */}

				{/* main and outer circles */}
				<g id="node-a-wrap">
					<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAPositions.base.x} cy={nodeAPositions.base.y} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-a-circle" cx={nodeAPositions.base.x} cy={nodeAPositions.base.y} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-a-main-text" x={nodeAPositions.base.x} y={nodeAPositions.base.y + 6} className="node-text">
						Node A
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 12} label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 42} label={"Leader Lease"}/>
				</g>

				{/* text */}
				<text x={nodeAPositions.base.x} y={nodeAPositions.base.y + 66} fill="black">
					<tspan id="node-a-term-text" className="highlighted" x={nodeAPositions.base.x - 24} y={nodeAPositions.base.y + 72}>Term: 1</tspan>
					<tspan id="node-a-extra-text" className="node-extra-text visibility-hidden" x={nodeAPositions.base.x - 24} y={nodeAPositions.base.y + 90}>Voted For: C</tspan>
					<tspan id="node-a-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeAPositions.base.x - 36} y={nodeAPositions.base.y + 108} ></tspan>

				</text>

				{/* speech bubble */}
				<text id="node-a-message-status" x={nodeAPositions.base.x - 10} y={nodeAPositions.base.y - 130} className="visibility-hidden">
					<tspan id="node-a-message-status-text1" x={nodeAPositions.base.x - 30} dy="1.2em"></tspan>
					<tspan id="node-a-message-status-text2" x={nodeAPositions.base.x - 30} dy="1.2em"></tspan>
				</text>
				<polygon id="node-a-message-bubble" className="visibility-hidden" points={`${nodeAPositions.base.x + 20},${nodeAPositions.base.y - 40} ${nodeAPositions.base.x + 20},${nodeAPositions.base.y - 70} ${nodeAPositions.base.x - 40},${nodeAPositions.base.y - 70} ${nodeAPositions.base.x - 40},${nodeAPositions.base.y - 140} ${nodeAPositions.base.x + 100},${nodeAPositions.base.y - 140} ${nodeAPositions.base.x + 100},${nodeAPositions.base.y - 70} ${nodeAPositions.base.x + 40},${nodeAPositions.base.y - 70}`} style={{fillOpacity: 0, stroke:'black',strokeWidth:1}} />

				{/* node B */}

				{/* main and outer circles */}
				<g id="node-b-wrap">
					<circle id="node-b-circle" cx={nodeBPositions.base.x + 24} cy={nodeBPositions.base.y} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBPositions.base.x + 24} cy={nodeBPositions.base.y} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<text id="node-b-main-text" x={nodeBPositions.base.x + 24} y={nodeBPositions.base.y + 6} className="node-text">
						Node B
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_B)} x={nodeBPositions.base.x - 54} y={nodeBPositions.base.y + 120} label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_B)} x={nodeBPositions.base.x - 54} y={nodeBPositions.base.y + 148} label="Leader Lease"/>
				</g>

				{/* text */}
				<text x={nodeBPositions.base.x} y={nodeBPositions.base.y} fill="black">
					<tspan id="node-b-term-text" x={nodeBPositions.base.x} y={nodeBPositions.base.y + 72}>Term: 1</tspan>
					<tspan id="node-b-extra-text" className="node-extra-text visibility-hidden" x={nodeBPositions.base.x} y={nodeBPositions.base.y + 90}>Voted For: C</tspan>
					<tspan id="node-b-extra-text2" className="node-extra-text2 visibility-hidden" x={nodeBPositions.base.x - 12} y={nodeBPositions.base.y + 108} ></tspan>
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
