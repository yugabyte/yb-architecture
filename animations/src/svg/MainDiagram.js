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
		x: nodeCBaseXPos - 80,
		y: nodeCBaseYPos - 70
	},
	partitionText2: {
		x: nodeCBaseXPos - 80,
		y: nodeCBaseYPos - 55
	}
}

export const nodeBPositions = {
	base: {
		x: nodeBBaseXPos,
		y: nodeBBaseYPos
  },
  messageToA: {
		x: nodeBBaseXPos - 10,
		y: nodeBBaseYPos
	},
	messageToC: {
		x: nodeBBaseXPos + 32,
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

				{/* Center text area */}
				<foreignObject x={30} y={160} width="400" height="300">
					<div id="center-message-text" style={{fontFamily: 'Verdana', fontSize: '1em', padding: '30px'}}></div>
				</foreignObject>
				<g>
					<text id="center-message-rect" className="visibility-hidden"
						x={clientX} y={170} fontFamily="Verdana" fontSize="1em">
						<tspan id="center-message-text1" x={50} dy="1.2em"></tspan>
						<tspan id="center-message-text2" x={50} dy="1.2em"></tspan>
					</text>
				</g>
				{/* smaller circles */}
				<circle id="node-c-message-to-b" className="node-small-circle" cx={nodeCPositions.messageToB.x} cy={nodeCPositions.messageToB.y} />
				<circle id="node-c-message-to-a" className="node-small-circle" cx={nodeCPositions.messageToA.x} cy={nodeCPositions.messageToB.y} />
				<circle id="node-c-message-to-client" className="node-small-circle visibility-hidden" cx={nodeCPositions.messageToClient.x} cy={nodeCPositions.messageToClient.y} />

				{/* partition around C */}
				<g id="node-c-partition-wrap" className="visibility-hidden">
					<path d="M250,360a83,75,0,1,1,190,-15" id="node-c-partition" className="node-partition"/>
					<text fill="black">
						<tspan x={nodeCPositions.partitionText1.x} y={nodeCPositions.partitionText1.y}>Partitioned</tspan>
						<tspan x={nodeCPositions.partitionText2.x} y={nodeCPositions.partitionText2.y}>from A & B</tspan>
					</text>
				</g>
				<g>
					{/* Node A text with white background */}
					<rect id="client-message-status-bg" className="visibility-hidden" x={clientX - 92} y={clientY - 152} fill="white" width="210" height="76"></rect>
					<text id="client-query-message" x={clientX - 90} y={clientY - 148} className="visibility-hidden">
						<tspan id="client-query-message-anchor" x={clientX - 80} dy="1.2em">Query: </tspan>
						<tspan id="client-query-message-text1" dx={5} className="code-block"></tspan>
						<tspan id="client-query-message-text2" x={clientX - 83} dy="1.2em" className="code-block"></tspan>
						<tspan id="client-query-message-text3" x={clientX - 83} dy="1.2em" className="code-block"></tspan>
					</text>
					<foreignObject x={clientX - 85} y={clientY - 148} width="200" height="70">
						<div id="client-message-status"></div>
					</foreignObject>

					<path id="client-message-bubble" className="visibility-hidden"
						d={`M${clientX + 3},${clientY - 50} l0,-26 l-90,0 c0,0 -5,0 -5,-5 l0,-65 c0,0 0,-5 5,-5 l200,0 c0,0 5,0 5,5 l0,65 c0,0 0,5 -5,5 l-90,0 z`}
						style={{fillOpacity: 0, stroke:'black', strokeWidth:1}}></path>
				</g>
				<g id="client-message" className="visibility-hidden">
					<circle id="client-message-circle" className="client-message" cx={clientX} cy={clientY}/>
					<text id="client-message-text" x={clientX - 18} y={clientY + 24}>
					</text>
				</g>
				
				<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBX + 24} cy={nodeBY + 12} />

				<circle id="node-a-message-to-b" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToB.x} cy={nodeAPositions.messageToB.y} />
        <circle id="node-a-message-to-c" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToB.x} cy={nodeAPositions.messageToB.y} />
				<circle id="node-a-message-to-client" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToClient.x} cy={nodeAPositions.messageToClient.y} />

				{/* node C */}

				{/* main and outer circles */}
				<g id="node-c-wrap">
					<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCX + 32} cy={nodeCY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-c-circle" cx={nodeCX + 32} cy={nodeCY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-c-main-text" x={nodeCX + 30} y={nodeCY + 6} className="node-text" fill="black">
						Node C
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_C)} x={nodeCX - 48} y={nodeCY + 118}
					label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_C)} x={nodeCX - 48} y={nodeCY + 118}
					label={"Leader Lease"}/>
				</g>

			<g>
				<rect id="node-c-text-highlight" className="visibility-hidden"
					x={nodeCX + 5} y={nodeCY + 62} width="55" height="24" fill="yellow"></rect>
				<text id="node-c-term-text-rect" x={nodeCX + 10} y={nodeCY + 40} fill="black" className="visibility-hidden">
					<tspan id="node-c-term-text" x={nodeCX + 10} dy="1.2em"></tspan>
					<tspan id="node-c-extra-text" className="node-extra-text" x={nodeCX + 10} dy="1.2em"></tspan>
					<tspan id="node-c-extra-text2" className="node-extra-text2" dx="0.5em" ></tspan>
				</text>
			</g>

        {/* Node C bubble text area */}
				<foreignObject x={nodeCX - 15} y={nodeCY - 174} width="235" height="80">
					<div id="node-c-message-text-alt"></div>
				</foreignObject>
				<text id="node-c-message-status" x={nodeCX - 10} y={nodeCY - 130} className="visibility-hidden">
					<tspan id="node-c-message-status-text1" x={nodeCX - 10} dy="1.2em"></tspan>
					<tspan id="node-c-message-status-text2" x={nodeCX - 10} dy="1.2em"></tspan>
				</text>
				<path id="node-c-message-bubble" className="visibility-hidden"
					d={`M${nodeCX + 40},${nodeCX - 40} l0,-26 l-55,0 c0,0 -5,0 -5,-5 l0,-65 c0,0 0,-5 5,-5 l215,0 c0,0 5,0 5,5 l0,65 c0,0 0,5 -5,5 l-140,0 z`}
					style={{fillOpacity: 0, stroke:'black', strokeWidth:1}}></path>
        		<path id="node-c-message-bubble-alt" className="visibility-hidden"
					d={`M${nodeCX + 45},${nodeCX - 50} l15,-40 l-80,0 c0,0 -5,0 -5,-5 l0,-80 c0,0 0,-5 5,-5 l235,0 c0,0 5,0 5,5 l0,80 c0,0 0,5 -5,5 l-135,0 z`}
					style={{fillOpacity: 0, stroke:'black', strokeWidth:1}}></path>

				{/* node A */}

				{/* main and outer circles */}
				<g id="node-a-wrap">
					<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAX} cy={nodeAY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
					<circle id="node-a-circle" cx={nodeAX} cy={nodeAY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-a-main-text" x={nodeAX} y={nodeAY + 6} className="node-text">
						Node A
					</text>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 12} label={"My Lease"}/>
					<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)} x={nodeAPositions.leaseTimer.x - 24} y={nodeAPositions.leaseTimer.y + 12} label={"Leader Lease"}/>
				</g>

        {/* text */}
        <g>
          <rect id="node-a-term-highlight" className="visibility-hidden"
            x={nodeAX - 30} y={nodeAY + 41} width="63" height="24" fill="yellow"></rect>
          <rect id="node-a-text-highlight" className="visibility-hidden"
						x={nodeAX - 30} y={nodeAY + 62} width="55" height="24" fill="yellow"></rect>
          <text id="node-a-term-text-rect" x={nodeAX} y={nodeAY + 40} fill="black" className="visibility-hidden">
            <tspan id="node-a-term-text" x={nodeAX - 24} dy="1.2em"></tspan>
            <tspan id="node-a-extra-text" className="node-extra-text" x={nodeAX - 24} dy="1.2em"></tspan>
            <tspan id="node-a-extra-text2" className="node-extra-text2" dx="0.5em"></tspan>
          </text>
        </g>

		{/* node B */}
        <circle id="node-b-message-to-a" className="node-small-circle visibility-hidden" cx={nodeBPositions.messageToA.x} cy={nodeBPositions.messageToA.y} />
        <circle id="node-b-message-to-c" className="node-small-circle visibility-visible log-message" cx={nodeBPositions.messageToC.x} cy={nodeBPositions.messageToC.y} />

		{/* main and outer circles */}
		<g id="node-b-wrap">
			<circle id="node-b-circle" cx={nodeBX + 24} cy={nodeBY} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
			<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBX + 24} cy={nodeBY} r="38" stroke="rgb(158, 196, 226)" strokeWidth="6" fill="transparent" />
			<text id="node-b-main-text" x={nodeBX + 24} y={nodeBY + 6} className="node-text">
				Node B
			</text>
			<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.myLeaseTimerId(Constants.NODE_B)} x={nodeBX - 54} y={nodeBY + 115} label={"My Lease"}/>
			<HorizontalTimer className="visibility-hidden" uid={HelperFunctions.leaderLeaseTimerId(Constants.NODE_B)} x={nodeBX - 54} y={nodeBY + 115} label="Leader Lease"/>
		</g>

        {/* text */}
        <g>
          <rect id="node-b-term-highlight" className="visibility-hidden"
              x={nodeBX - 6} y={nodeBY + 45} width="63" height="24" fill="yellow"></rect>
          <rect id="node-b-text-highlight" className="visibility-hidden"
						x={nodeBX - 6} y={nodeBY + 65} width="55" height="24" fill="yellow"></rect>
          <text id="node-b-term-text-rect" x={nodeBX} y={nodeBY + 43} fill="black" className="visibility-hidden">
            <tspan id="node-b-term-text" x={nodeBX} dy="1.2em"></tspan>
            <tspan id="node-b-extra-text" className="node-extra-text" x={nodeBX} dy="1.2em"></tspan>
            <tspan id="node-b-extra-text2" className="node-extra-text2" dx={"0.5em"}></tspan>
          </text>
        </g>

		{/* Node A text with white background */}
		<rect id="node-a-message-status-bg" className="visibility-hidden" x={nodeAX - 40} y={nodeAY - 167} fill="white" width="207" height="100"></rect>
        <foreignObject x={nodeAX - 32} y={nodeAY - 155} width="200" height="80">	
			<div id="node-a-message-status"></div>
		</foreignObject>
		{/* speech bubble */}
		<path id="node-a-message-bubble" className="visibility-hidden"
			// d={`M${nodeAX + 20},${nodeAY - 40} l0,-26 l-55,0 c0,0 -5,0 -5,-5 l0,-80 c0,0 0,-5 5,-5 l170,0 c0,0 5,0 5,5 l0,80 c0,0 0,5 -5,5 l-90,0 z`}
			d="M62,284 l0,-26 l-55,0 c0,0 -5,0 -5,-5 l0,-90 c0,0 0,-5 5,-5 l196,0 c0,0 5,0 5,5 l0,90 c0,0 0,5 -5,5 l-126,0 z"
			style={{fillOpacity: 0, stroke:'black', strokeWidth:1}}></path>

		{/* client node */}
		<g id="client-node" className="visibility-visible">
			<circle className="client-node" cx={clientNodeXPos} cy={clientNodeYPos} />
			<text id="client-node-main-text" x={clientNodeXPos} y={clientNodeYPos + 9} className="client-node-text">
				Client
			</text>
			<text id="client-node-value" x={clientNodeXPos + 40} y={clientNodeYPos + 9}></text>
			<text id="client-node-value-alt" x={clientNodeXPos + 40} y={clientNodeYPos + 9} className="visibility-hidden">
				<tspan fill="red" x={clientNodeXPos + 40} fontSize="1.5em">×</tspan>
				<tspan dx="4px">Value: V1</tspan>
				<tspan fill="red" x={clientNodeXPos + 40} dy="1.2em">Expected value = V2</tspan>
			</text>
		</g>

		{/* lease messages */}
		<g id="node-c-lease-to-node-a" className="visibility-hidden">
			<use href="#analog-clock" x={nodeCX + 6} y={nodeCY - 36}/>
		</g>
		<g id="node-c-lease-to-node-b" className="visibility-hidden">
			<use href="#analog-clock" x={nodeCX + 24} y={nodeCY - 36}/>
		</g>

		<g id="node-a-lease-to-node-b" className="visibility-hidden">
			<use href="#analog-clock" x={nodeAX} y={nodeAY - 36}/>
		</g>

	</svg>

		);
	}
}
export default MainDiagram;
