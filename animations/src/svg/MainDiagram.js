import React, { Component } from 'react';

// starting position of nodes
const nodeAXPos = 42;
const nodeAYPos = 324;
const nodeCXPos = 276;
const nodeCYPos = 324;
const nodeBXPos = 168;
const nodeBYPos = 18;
const clientNodeXPos = 186;
const clientNodeYPos = 498;

class MainDiagram extends Component {

	render() {
		return (
			<svg height="464" width="380">
				{/* smaller circles */}
				<circle id="node-c-message-to-b" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
				<circle id="node-c-message-to-a" className="node-small-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
				<circle id="client-message" className="client-message visibility-hidden" cx={clientNodeXPos} cy={clientNodeYPos - 72}/>
				<circle id="node-b-small-circle" className="node-small-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} />

				{/* node C */}

				{/* main and outer circles */}
				<g id="node-c-wrap">
					<circle id="node-c-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					<text id="node-c-main-text" x={nodeCXPos + 30} y={nodeCYPos + 6} className="node-text visibility-hidden" fill="black">
						<tspan>5</tspan>
					</text>
				</g>

				{/* text */}
				<text x={nodeCXPos} y={nodeCYPos} fill="black">
					<tspan x={nodeCXPos + 6} y={nodeCYPos + 66}>Node C</tspan>
					<tspan x={nodeCXPos + 6} y={nodeCYPos + 84}>Term: 0</tspan>
					<tspan id="node-c-extra-text" className="node-extra-text visibility-hidden" x={nodeCXPos + 6} y={nodeCYPos + 104}>Vote Count: 1</tspan>
				</text>

				{/* node A */}

				{/* main and outer circles */}
				<g id="node-a-wrap">
					<circle id="node-a-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
					<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					<text id="node-a-main-text" x={nodeAXPos} y={nodeAYPos + 6} className="node-text visibility-hidden">
						<tspan>5</tspan>
					</text>
				</g>

				{/* text */}
				<text x={nodeAXPos} y={nodeAYPos + 66} fill="black">
					<tspan x={nodeAXPos - 24} y={nodeAYPos + 66}>Node A</tspan>
					<tspan x={nodeAXPos - 24} y={nodeAYPos + 84}>Term: 0</tspan>
					<tspan id="node-a-extra-text" className="node-extra-text visibility-hidden" x={nodeAXPos - 24} y={nodeAYPos + 104}>Voted For: C</tspan>

				</text>

				{/* node B */}
				<text x={nodeBXPos} y={nodeBYPos} fill="black">
					<tspan x={nodeBXPos} y={nodeBYPos + 18}>Node B</tspan>
					<tspan x={nodeBXPos} y={nodeBYPos + 36}>Term: 0</tspan>
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
					<text x={clientNodeXPos} y={clientNodeYPos + 9} className="client-node-text">
						<tspan>5</tspan>
					</text>
				</g>
			</svg>
		);
	}
}
export default MainDiagram;
