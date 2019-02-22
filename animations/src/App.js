import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import anime from 'animejs/lib/anime.es.js';

var AnimationState = {
	INITIAL: "INITIAL",
	LEADER_ELECTION_NODE_TIMED_OUT: "LEADER_ELECTION_NODE_TIMED_OUT",
	LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF: "LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF",
	LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES: "LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES",
}

// default delay between animations
var DEFAULT_DELAY = 4000;

class App extends Component {
	constructor(props) {
		super(props);
		this.animationState = AnimationState.INITIAL;
		this.onButtonClick = this.onButtonClick.bind(this);
		this.changeMainText = this.changeMainText.bind(this);
	}

	// main animation loop
	next() {
		switch(this.animationState) {
			case AnimationState.INITIAL: {
				this.changeMainText('Leader election starts ...');

				// initiate a timeout
				setTimeout(() => {
					this.changeMainText('If there is no leader, a election timeout is triggered');

					////////////////// animate Node A and B ////////////////////////
					var nodeAOuterCircle = document.getElementById('node-a-outer-circle');
					nodeAOuterCircle.classList.add('animation-delay-3s');
					nodeAOuterCircle.classList.add('animate-circle-stroke');

					var nodeBOuterCircle = document.getElementById('node-b-outer-circle');
					nodeBOuterCircle.classList.add('animation-delay-2s');
					nodeBOuterCircle.classList.add('animate-circle-stroke');

					////////////////// animate Node C ////////////////////////
					// get the specific node (i.e Node C) which would time out faster and eventually
					// become the leader
					var nodeCOuterCircle = document.getElementById('node-c-outer-circle');
					nodeCOuterCircle.classList.add('animate-circle-stroke');

					// need to wait for the animation on the faster node to end and then
					// execute the next step
					var onNodeCAnimationEnd = () => {
						nodeAOuterCircle.classList.add('pause-animation');
						nodeBOuterCircle.classList.add('pause-animation');

						this.animationState = AnimationState.LEADER_ELECTION_NODE_TIMED_OUT;
						this.next();
					}
					nodeCOuterCircle.addEventListener("webkitAnimationEnd", onNodeCAnimationEnd,false);
					nodeCOuterCircle.addEventListener("animationend", onNodeCAnimationEnd,false);

				}, DEFAULT_DELAY);
				break;
			}
			case AnimationState.LEADER_ELECTION_NODE_TIMED_OUT: {
				var fasterTimeoutCircle = document.getElementById('node-c-outer-circle');
				fasterTimeoutCircle.classList.add('leader-candidate-node');

				var nodeCVoteText = document.getElementById('node-c-vote-text');
				nodeCVoteText.classList.remove('visibility-hidden');

				this.changeMainText('After election timeout the follower becomes a candidate. '
				+ 'It starts a new election term and votes for itself', () => {
					this.animationState = AnimationState.LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF;
					setTimeout(() => this.next(), DEFAULT_DELAY);
				});
				break;
			}
			case AnimationState.LEADER_ELECTION_LEADER_HAS_VOTED_FOR_ITSELF: {
				// send "request vote" to node B
				var nodeCSmallCircle1 = document.getElementById('node-c-small-circle1');
				var animation1 = anime({
  				targets: '#node-c-small-circle1',
  				translateX: -132,
					translateY: -220,
					easing: 'linear',
					duration: 1000,
					direction: 'alternate',
					changeComplete: function(anim) {
						nodeCSmallCircle1.classList.remove('vote-request-circle');
						nodeCSmallCircle1.classList.add('vote-ack-circle');
  				}
				});

				// send "request vote" to node A
				var nodeCSmallCircle2 = document.getElementById('node-c-small-circle2');
				var animation2 = anime({
					targets: '#node-c-small-circle2',
					translateX: -300,
					easing: 'linear',
					duration: 1000,
					direction: 'alternate',
					changeComplete: function(anim) {
						nodeCSmallCircle2.classList.remove('vote-request-circle');
						nodeCSmallCircle2.classList.add('vote-ack-circle');
					}
				});

				// wait for both animations to finish before proceeding
				Promise.all([animation1.finished, animation2.finished]).then(() => {
					this.animationState = AnimationState.LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES;
					this.next();
				})
				break;
			}
			case AnimationState.LEADER_ELECTION_LEADER_RECEIVED_VOTES_FROM_OTHER_NODES: {
				this.changeMainText('Once a candidate has majority of votes it becomes the leader');

				// show that follower nodes have voted for the leader (Node C)
				var nodeAVoteText = document.getElementById('node-a-vote-text');
				nodeAVoteText.classList.remove('visibility-hidden');
				var nodeBVoteText = document.getElementById('node-b-vote-text');
				nodeBVoteText.classList.remove('visibility-hidden');

				var nodeCVoteText = document.getElementById('node-c-vote-text');
				nodeCVoteText.textContent = 'Elected Leader';

				var nodeCOuterCircle = document.getElementById('node-c-outer-circle');
				nodeCOuterCircle.classList.remove('leader-candidate-node');
				nodeCOuterCircle.classList.add('leader-node');

				// hide node A and B's outer circles
				var nodeAOuterCircle = document.getElementById('node-a-outer-circle');
				nodeAOuterCircle.classList.remove('visibility-visible');
				nodeAOuterCircle.classList.add('visibility-hidden');

				var nodeBOuterCircle = document.getElementById('node-b-outer-circle');
				nodeBOuterCircle.classList.remove('visibility-visible');
				nodeBOuterCircle.classList.add('visibility-hidden');

				break;
			}
			default:
				console.error('Unrecognized state: ' + this.animationState);
		}
	}
	componentDidMount() {
		this.mainTextSect = document.getElementById('main-text-sect');
		this.next();
	}

  render() {
		var nodeAXPos = 52;
		var nodeAYPos = 324;

		var nodeCXPos = 302;
		var nodeCYPos = 324;

		var nodeBXPos = 174;
		var nodeBYPos = 18;
    return (
      <div className="App">
				<div id="main-diagram">
					<svg height="460" width="800">
						{/* node C */}

						{/* smaller circles */}
						<circle id="node-c-small-circle1" className="node-small-circle vote-request-circle" cx={nodeCXPos+32} cy={nodeCYPos} />
						<circle id="node-c-small-circle2" className="node-small-circle vote-request-circle" cx={nodeCXPos+32} cy={nodeCYPos} />

						{/* main and outer circles */}
						<circle id="node-c-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
						<circle id="node-c-outer-circle" className="node-outer-circle" cx={nodeCXPos+32} cy={nodeCYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />

						{/* text */}
						<text x={nodeCXPos} y={nodeCYPos} fill="black">
							<tspan x={nodeCXPos + 6} y={nodeCYPos + 66}>Node C</tspan>
							<tspan x={nodeCXPos + 6} y={nodeCYPos + 84}>Term: 0</tspan>
							<tspan id="node-c-vote-text" className="node-vote-text visibility-hidden" x={nodeCXPos - 12} y={nodeCYPos + 104}>Vote Count: 1</tspan>
						</text>

						{/* node A */}

						{/* main and outer circles */}
						<circle id="node-a-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
						<circle id="node-a-outer-circle" className="node-outer-circle" cx={nodeAXPos} cy={nodeAYPos} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />

						{/* text */}
						<text x={nodeAXPos} y={nodeAYPos + 66} fill="black">
							<tspan x={nodeAXPos - 24} y={nodeAYPos + 66}>Node A</tspan>
							<tspan x={nodeAXPos - 24} y={nodeAYPos + 84}>Term: 0</tspan>
							<tspan id="node-a-vote-text" className="node-vote-text visibility-hidden" x={nodeAXPos - 36} y={nodeAYPos + 104}>Voted For: C</tspan>

						</text>

						{/* node B */}
						<text x={nodeBXPos} y={nodeBYPos} fill="black">
							<tspan x={nodeBXPos} y={nodeBYPos + 18}>Node B</tspan>
							<tspan x={nodeBXPos} y={nodeBYPos + 36}>Term: 0</tspan>
							<tspan id="node-b-vote-text" className="node-vote-text visibility-hidden" x={nodeBXPos - 18} y={nodeBYPos + 54}>Voted For: C</tspan>
						</text>


						{/* main and outer circles */}
	  				<circle id="node-b-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="0" fill="rgb(70, 130, 180)" />
						<circle id="node-b-outer-circle" className="node-outer-circle" cx={nodeBXPos + 24} cy={nodeBYPos + 102} r="35" stroke="rgb(70, 130, 180)" strokeWidth="14" fill="transparent" />
					</svg>
				</div>
				<div id="main-text-sect">
				</div>
      </div>
    );
  }

	onButtonClick() {
	}

	changeMainText(text, onComplete) {
		this.mainTextSect.innerHTML=text;

		var ml4 = {};
		ml4.opacityIn = [0,1];
		ml4.scaleIn = [0.2, 1];
		ml4.scaleOut = 3;
		ml4.durationIn = 2000;
		ml4.durationOut = 2000;
		ml4.delay = 500;

		anime({
			targets: '#main-text-sect',
			opacity: ml4.opacityIn,
			scale: ml4.scaleIn,
			duration: ml4.durationIn,
			complete: onComplete,
		});
	}
}

export default App;
