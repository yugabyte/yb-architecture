import React, { Component } from 'react';

// starting position of nodes
const nodeABaseXPos = 42;
const nodeABaseYPos = 324;

const nodeCXPos = 276;
const nodeCYPos = 324;
const nodeBXPos = 168;
const nodeBYPos = 18;
const clientNodeXPos = 186;
const clientNodeYPos = 498;

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
	}
}

class MainDiagram extends Component {

	render() {
		return (
			<svg height="464" width="380">
				{/* smaller circles */}
				<circle id="node-c-message-to-b" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
				<circle id="node-c-message-to-a" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
				<circle id="node-c-message-to-client" className="node-small-circle visibility-hidden" cx={nodeCXPos+32} cy={nodeCYPos} />

				<circle id="client-message" className="client-message visibility-hidden" cx={clientNodePositions.clientMessage.x} cy={clientNodePositions.clientMessage.y}/>

				<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} />

				<circle id="node-a-message-to-b" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToB.x} cy={nodeAPositions.messageToB.y} />
				<circle id="node-a-message-to-client" className="node-small-circle visibility-hidden" cx={nodeAPositions.messageToClient.x} cy={nodeAPositions.messageToClient.y} />

				{/* node C */}

				{/* partition around C */}

				<g id="node-c-partition-wrap" className="visibility-hidden">
					<path d="M210,340a83.832377,83.832377,0,1,1,111,30" id="node-c-partition" className="node-partition"/>
					<text fill="black">
						<tspan x="240" y="240">Partitioned</tspan>
						<tspan x="240" y="260">from A & B</tspan>
					</text>
				</g>

				{/* main and outer circles */}
				<g id="node-c-wrap">
					<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					<circle id="node-c-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-c-main-text" x={nodeCXPos + 30} y={nodeCYPos + 6} className="node-text visibility-hidden" fill="black">
						<tspan>5</tspan>
					</text>
				</g>

				{/* text */}
				<text x={nodeCXPos} y={nodeCYPos} fill="black">
					<tspan x={nodeCXPos + 6} y={nodeCYPos + 84}>Node C</tspan>
					<tspan id="node-c-term-text" x={nodeCXPos + 6} y={nodeCYPos + 102}>Term: 0</tspan>
					<tspan id="node-c-extra-text" className="node-extra-text visibility-hidden" x={nodeCXPos + 6} y={nodeCYPos + 120}>Vote Count: 1</tspan>
				</text>

				{/* node A */}

				{/* main and outer circles */}
				<g id="node-a-wrap">
					<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAPositions.base.x} cy={nodeAPositions.base.y} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					<circle id="node-a-circle" cx={nodeAPositions.base.x} cy={nodeAPositions.base.y} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<text id="node-a-main-text" x={nodeAPositions.base.x} y={nodeAPositions.base.y + 6} className="node-text visibility-hidden">
						<tspan>5</tspan>
					</text>
				</g>

				{/* text */}
				<text x={nodeAPositions.base.x} y={nodeAPositions.base.y + 66} fill="black">
					<tspan x={nodeAPositions.base.x - 24} y={nodeAPositions.base.y + 84}>Node A</tspan>
					<tspan id="node-a-term-text" x={nodeAPositions.base.x - 24} y={nodeAPositions.base.y + 102}>Term: 0</tspan>
					<tspan id="node-a-extra-text" className="node-extra-text visibility-hidden" x={nodeAPositions.base.x - 24} y={nodeAPositions.base.y + 120}>Voted For: C</tspan>

				</text>

				{/* node B */}
				<text x={nodeBXPos} y={nodeBYPos} fill="black">
					<tspan x={nodeBXPos} y={nodeBYPos + 18}>Node B</tspan>
					<tspan id="node-b-term-text" x={nodeBXPos} y={nodeBYPos + 36}>Term: 0</tspan>
					<tspan id="node-b-extra-text" className="node-extra-text visibility-hidden" x={nodeBXPos} y={nodeBYPos + 54}>Voted For: C</tspan>
				</text>


				{/* main and outer circles */}
				<g id="node-b-wrap">
					<circle id="node-b-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					<text id="node-b-main-text" x={nodeBXPos + 24} y={nodeBYPos + 108} className="node-text visibility-hidden">
						<tspan>5</tspan>
					</text>
				</g>

				{/* client node */}
				<g id="client-node">
					<circle className="client-node" cx={clientNodeXPos} cy={clientNodeYPos} />
					<text id="client-node-main-text" x={clientNodeXPos} y={clientNodeYPos + 9} className="client-node-text">
						<tspan>5</tspan>
					</text>
				</g>
			</svg>
		);
	}
}
export default MainDiagram;
