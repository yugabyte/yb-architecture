
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';
import * as HelperFunctions from './HelperFunctions';

const ANIMATION_STATE_EXPLAIN_PROTOCOL = 'ANIMATION_STATE_EXPLAIN_PROTOCOL';
const ANIMATION_STATE_LEADER_ELECTION = 'ANIMATION_STATE_LEADER_ELECTION';
const ANIMATION_STATE_NODE_DATA = 'ANIMATION_STATE_NODE_DATA';
const ANIMATION_STATE_CLIENT_INTRODUCED = 'ANIMATION_STATE_CLIENT_INTRODUCED';
const ANIMATION_STATE_PERFORMED_READ_ON_LEADER = "ANIMATION_STATE_PERFORMED_READ_ON_LEADER";
const ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS";
const ANIMATION_STATE_CLIENT_FINISH_OPERATION = 'ANIMATION_STATE_CLIENT_FINISH_OPERATION';

const SET_VALUE1="V1";
const warningSVG = (height = '550.45', width = '627.77') => (
		`<svg id="Layer_3" xmlns="http://www.w3.org/2000/svg" height=${height}" width="${width}" version="1.0" viewBox="0 0 627.769 550.45">
			<path id="path2231" fill="#ea0000" d="m614.57 504.94l-279.4-483.94c-4.38-7.588-12.47-12.262-21.23-12.262s-16.85 4.674-21.23 12.258l-279.41 483.94c-4.375 7.58-4.375 16.93 0.003 24.52 4.379 7.58 12.472 12.25 21.23 12.25h558.81c8.76 0 16.86-4.67 21.23-12.25 4.38-7.59 4.38-16.94 0-24.52z"/>
			<polygon id="polygon2233" points="93.977 482.88 533.9 482.88 313.94 101.89" fill="#fff"/>
			<path id="path2235" d="m291.87 343.36c1.21 11.49 3.21 20.04 6.02 25.66 2.81 5.63 7.82 8.43 15.04 8.43h2.01c7.22 0 12.24-2.8 15.04-8.43 2.81-5.62 4.82-14.17 6.02-25.66l6.42-88.75c1.21-17.3 1.81-29.71 1.81-37.25 0-10.25-2.91-18.25-8.73-23.99-5.53-5.46-13.38-8.59-21.56-8.59s-16.04 3.13-21.57 8.59c-5.81 5.74-8.72 13.74-8.72 23.99 0 7.54 0.6 19.95 1.8 37.25l6.42 88.75z"/>
			<circle id="circle2237" cy="430.79" cx="313.94" r="30.747"/>
		</svg>`);

export class RaftReadOperationAnimation extends Component {
	constructor(props) {
		super(props);
		this.animationState = Constants.ANIMATION_STATE_INITIAL;
		this.state = {
      animationFinished: false,
      previousEnabled: true,
		}
	}

	componentDidMount() {
		this.mainTextSect = document.getElementById('center-message-text');
	}

	pause(){ }
	resume() {	}

	onNext() {
		return new Promise((resolve,reject) => {
			this.onNextInternal(resolve,reject);
		});
	}

	onNextInternal(resolve,reject) {
    // Text Containers underneath each Node
    const nodeATextContainer = document.getElementById('node-a-term-text-rect');
    const nodeBTextContainer = document.getElementById('node-b-term-text-rect');
    const nodeCTextContainer = document.getElementById('node-c-term-text-rect');
    // Text Term (Line 1)
    const nodeATermText = document.getElementById('node-a-term-text');
    const nodeBTermText = document.getElementById('node-b-term-text');
    const nodeCTermText = document.getElementById('node-c-term-text');
    // Text Extra (Line 2)
    const nodeAExtraText = document.getElementById('node-a-extra-text');
    const nodeBExtraText = document.getElementById('node-b-extra-text');
    const nodeCExtraText = document.getElementById('node-c-extra-text');
    // Highlight for Text Extra (Line 2)
    const nodeAExtraHighlight = document.getElementById('node-a-text-highlight');
    const nodeBExtraHighlight = document.getElementById('node-b-text-highlight');
    const nodeCExtraHighlight = document.getElementById('node-c-text-highlight');
    
    // const status = document.getElementById('client-message-status');
    // const groupA = document.getElementById('node-a-group');
    // status.innerText = 'Query: SELECT value from T WHERE k = key fwaef;oif;woiajf;oiwejfa';
    // HelperFunctions.generateSvgTextbox(150, 430, 200, status.offsetHeight + 20, groupA);

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////

				// hide all outer circles (TODO: revisit this approach)
				let nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (let i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
        }

        this.changeMainText('Let’s say we have a 3-node Raft group.');
        this.animationState = ANIMATION_STATE_EXPLAIN_PROTOCOL;

        resolve({
          animationState: ANIMATION_STATE_EXPLAIN_PROTOCOL,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_EXPLAIN_PROTOCOL: {
				this.changeMainText('Nodes would have performed leader election...', () => {
          // Show each text container and then edit the text within them
          HelperFunctions.showElement(nodeATextContainer);
          HelperFunctions.showElement(nodeBTextContainer);
          HelperFunctions.showElement(nodeCTextContainer);

          nodeAExtraText.innerHTML = 'Voted For C';
          nodeBExtraText.innerHTML = 'Voted For C';
          nodeCExtraText.innerHTML = 'Voted For C';
        })
        this.animationState = ANIMATION_STATE_LEADER_ELECTION;
        resolve({
          animationState: ANIMATION_STATE_LEADER_ELECTION,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_LEADER_ELECTION: {
        this.changeMainText('');
        const textNodeC = document.getElementById('node-c-message-text');
        anime({
          targets: textNodeC,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('C is the current Raft leader, as denoted by the black border.');
          },
          complete: () => {
            document.getElementById('node-c-circle').classList.add('leader-node');
            nodeATermText.innerHTML = 'Term: 1';
            nodeBTermText.innerHTML = 'Term: 1';
            nodeCTermText.innerHTML = 'Term: 1';
            this.animationState = ANIMATION_STATE_NODE_DATA;
            resolve({
              animationState: ANIMATION_STATE_NODE_DATA,
              delay: 100,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_NODE_DATA: {
        HelperFunctions.destroyNodeCMessage();
				this.changeMainText('Assume all nodes have data: <br />(key,value) = (k, V1)', () => {
          nodeAExtraText.innerHTML = '(k, V1)';
          nodeBExtraText.innerHTML = '(k, V1)';
          nodeCExtraText.innerHTML = '(k, V1)';

          HelperFunctions.showElement(nodeAExtraHighlight);
          HelperFunctions.showElement(nodeBExtraHighlight);
          HelperFunctions.showElement(nodeCExtraHighlight);
        });
        this.animationState = ANIMATION_STATE_CLIENT_INTRODUCED;
        resolve({
          animationState: ANIMATION_STATE_CLIENT_INTRODUCED,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_INTRODUCED: {
				//////////////////////////////////////////////////////
        var introduceClientAnimation = HelperFunctions.introduceClient('');
        this.changeMainText('');

				introduceClientAnimation.finished.then(() => {
          HelperFunctions.hideElement(nodeAExtraHighlight);
          HelperFunctions.hideElement(nodeBExtraHighlight);
          HelperFunctions.hideElement(nodeCExtraHighlight);
          const statusElem = document.getElementById('client-status-text')
          
          anime({
            targets: statusElem,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createClientMessage('SELECT value FROM T WHERE <br />key = k', true);
            },
            complete: () => {
              HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
              this.animationState = ANIMATION_STATE_PERFORMED_READ_ON_LEADER;
              resolve({
                animationState: ANIMATION_STATE_PERFORMED_READ_ON_LEADER,
                delay: 100,
              });
            }
          });
				})
				break;
			}
			case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
        // Leader contacts followers to obtain a consensus on current value
        HelperFunctions.destroyClientMessage();
        const statusElem = document.getElementById('node-c-message-text');
				anime({
					targets: statusElem,
					opacity: [0, 1],
					easing: 'linear',
					duration: 1200,
					begin: function() {
            HelperFunctions.createNodeCMessage('Raft Leader will exchange heartbeats with a majority.');
					},
					complete: () => {
					  HelperFunctions.logMessageFromLeaderToFollowers(false);
            
            this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS;
            resolve({
              animationState: this.animationState,
              delay: 1000
            });
					}
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS: {
        HelperFunctions.destroyNodeCMessage();
        const receivedAckAnimation = HelperFunctions.logMessageAckFromFollowersToLeader();

        receivedAckAnimation[0].finished.then(() => {
          // Once majority is obtained. The leader returns value back to the client
          const statusElement = document.getElementById('node-c-message-text');
          anime({
            targets: statusElement,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createNodeCMessage('Leader: Majority heartbeat obtained, Raft leader can serve the read request.');
            },
            complete: () => {
              var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);
              animation.finished.then(() => {
                HelperFunctions.setSVGText({targetId: 'client-node-value', text: `value: ${SET_VALUE1}`, showElement: true });

                this.animationState = ANIMATION_STATE_CLIENT_FINISH_OPERATION;
                resolve({
                  animationState: this.animationState,
                  delay: 100
                });
              });
            }
          });
        })
				break;
      }
      case ANIMATION_STATE_CLIENT_FINISH_OPERATION: {
        HelperFunctions.destroyNodeCMessage();
        this.changeMainText(warningSVG(26, 28) + ' If nodes are in different regions, obtaining majority heartbeat is expensive. Query has high latency.');
        this.animationState = Constants.ANIMATION_STATE_FINISHED;
        this.setState({ animationFinished: true });
        resolve({
          animationState: this.animationState,
          delay: 100
        });
        break;
      }
			case Constants.ANIMATION_STATE_FINISHED: {
				resolve({
					animationState: this.animationState,
					delay: 100,
				});
				break;
			}
			default: {
				console.error('Unrecognized state: ' + this.animationState);
				reject('Unrecognized state: ' + this.animationState);
			}
		}
  }
  
  onPrevious() {
		return new Promise((resolve,reject) => {
			this.onPreviousInternal(resolve,reject);
		});
  }

  onPreviousInternal(resolve,reject) {
    // Text Containers underneath each Node
    const nodeATextContainer = document.getElementById('node-a-term-text-rect');
    const nodeBTextContainer = document.getElementById('node-b-term-text-rect');
    const nodeCTextContainer = document.getElementById('node-c-term-text-rect');
    // Text Term (Line 1)
    const nodeATermText = document.getElementById('node-a-term-text');
    const nodeBTermText = document.getElementById('node-b-term-text');
    const nodeCTermText = document.getElementById('node-c-term-text');
    // Text Extra (Line 2)
    const nodeAExtraText = document.getElementById('node-a-extra-text');
    const nodeBExtraText = document.getElementById('node-b-extra-text');
    const nodeCExtraText = document.getElementById('node-c-extra-text');
    // Highlight for Text Extra (Line 2)
    const nodeAExtraHighlight = document.getElementById('node-a-text-highlight');
    const nodeBExtraHighlight = document.getElementById('node-b-text-highlight');
    const nodeCExtraHighlight = document.getElementById('node-c-text-highlight');
    
		switch(this.animationState) {

			case ANIMATION_STATE_EXPLAIN_PROTOCOL: {
        // Undo phase
        this.changeMainText('');
        this.animationState = Constants.ANIMATION_STATE_INITIAL;

        resolve({
          animationState: Constants.ANIMATION_STATE_INITIAL,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_LEADER_ELECTION: {
        // Undo phase
        HelperFunctions.hideElement(nodeATextContainer);
        HelperFunctions.hideElement(nodeBTextContainer);
        HelperFunctions.hideElement(nodeCTextContainer);
        // Redo previous phase
        HelperFunctions.showElement(this.mainTextSect);
        this.changeMainText('Let’s say we have a 3-node Raft group.', () => { this.animationState = ANIMATION_STATE_EXPLAIN_PROTOCOL });

        resolve({
          animationState: ANIMATION_STATE_EXPLAIN_PROTOCOL,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_NODE_DATA: {
        // Undo phase
        document.getElementById('node-c-circle').classList.remove('leader-node');
        HelperFunctions.destroyNodeCMessage();
        nodeATermText.innerHTML = '';
        nodeBTermText.innerHTML = '';
        nodeCTermText.innerHTML = '';
        nodeAExtraText.innerHTML = '';
        nodeBExtraText.innerHTML = '';
        nodeCExtraText.innerHTML = '';

        // Redo previous phase
        this.changeMainText('Nodes would have performed leader election...', () => {
          nodeAExtraText.innerHTML = 'Voted For C';
          nodeBExtraText.innerHTML = 'Voted For C';
          nodeCExtraText.innerHTML = 'Voted For C';
        })
        this.animationState = ANIMATION_STATE_LEADER_ELECTION
        resolve({
          animationState: ANIMATION_STATE_LEADER_ELECTION,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_INTRODUCED: {
        // Undo phase
        this.changeMainText('');
        document.getElementById('node-c-circle').classList.remove('leader-node');
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        HelperFunctions.hideElement(nodeCExtraHighlight);

        // Redo previous phase
        nodeAExtraText.innerHTML = 'Voted for C';
        nodeBExtraText.innerHTML = 'Voted for C';
        nodeCExtraText.innerHTML = 'Voted for C';

        const statusElement = document.getElementById('node-c-message-text');
        anime({
          targets: statusElement,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('C is the current Raft leader, denoted by the black border.');
          },
          complete: () => {
            document.getElementById('node-c-circle').classList.add('leader-node');
            nodeATermText.innerHTML = 'Term: 1';
            nodeBTermText.innerHTML = 'Term: 1';
            nodeCTermText.innerHTML = 'Term: 1';
            this.animationState = ANIMATION_STATE_NODE_DATA;
            resolve({
              animationState: ANIMATION_STATE_NODE_DATA,
              delay: 100,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
        HelperFunctions.destroyClientMessage();
        HelperFunctions.hideClient();
        this.changeMainText('Assume all nodes have data: <br />(key,value) = (k, V1)', () => {
          HelperFunctions.showElement(nodeAExtraHighlight);
          HelperFunctions.showElement(nodeBExtraHighlight);
          HelperFunctions.showElement(nodeCExtraHighlight);
          this.animationState = ANIMATION_STATE_CLIENT_INTRODUCED;
          resolve({
            animationState: ANIMATION_STATE_CLIENT_INTRODUCED,
            delay: 100,
          });
        })
        break;
      }
      case ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS: {
        HelperFunctions.destroyNodeCMessage();
        var introduceClientAnimation = HelperFunctions.introduceClient('');
        this.changeMainText('');

				introduceClientAnimation.finished.then(() => {
          HelperFunctions.hideElement(nodeAExtraHighlight);
          HelperFunctions.hideElement(nodeBExtraHighlight);
          HelperFunctions.hideElement(nodeCExtraHighlight);
          const statusElem = document.getElementById('client-status-text');

          anime({
            targets: statusElem,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createClientMessage('SELECT value FROM T WHERE <br />key = k', true);
            },
            complete: () => {
              const anim = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
              anim.finished.then(() => {
                this.animationState = ANIMATION_STATE_PERFORMED_READ_ON_LEADER;
                resolve({
                  animationState: ANIMATION_STATE_PERFORMED_READ_ON_LEADER,
                  delay: 100,
                });
              })
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_FINISH_OPERATION: {
        HelperFunctions.destroyNodeCMessage();
        HelperFunctions.hideElement(document.getElementById('client-node-value'));
        const status = document.getElementById('node-c-message-text');
				
				anime({
					targets: status,
					easing: 'linear',
          duration: 1200,
          opacity: [0, 1],
          begin: function() {
            HelperFunctions.createNodeCMessage('Per Raft protocol, leader should exchange heartbeats with a majority.');
          },
					complete: () => {
            HelperFunctions.logMessageFromLeaderToFollowers(false)
            
            this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
					}
        });
        break;
      }
      case Constants.ANIMATION_STATE_FINISHED: {
        this.changeMainText('');
        HelperFunctions.hideElement(document.getElementById('client-node-value'));
        HelperFunctions.destroyNodeCMessage();
        this.setState({ animationFinished: false });
        const receivedAckAnimation = HelperFunctions.logMessageAckFromFollowersToLeader();

        receivedAckAnimation[0].finished.then(() => {
          // Once majority is obtained. The leader returns value back to the client
          const statusElem = document.getElementById('node-c-message-text');

          anime({
            targets: statusElem,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createNodeCMessage('Majority heartbeat obtained, Raft leader can serve the read request.');
            },
            complete: () => {
              var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE);
              animation.finished.then(() => {
                HelperFunctions.setSVGText({targetId: 'client-node-value', text: `value: ${SET_VALUE1}`, showElement: true });

                this.animationState = ANIMATION_STATE_CLIENT_FINISH_OPERATION;
                resolve({
                  animationState: this.animationState,
                  delay: 100
                });
              });
            }
          });
        });
        break;
      }
      default: {
        console.error('Unrecognized state or unimplemented: ' + this.animationState);
        reject('Unrecognized state or unimplemented: ' + this.animationState);
      }
    }
  }
  
	changeMainText(text, onComplete) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete);
	}

	render() {
		return(
			<div>
				<div id="main-diagram">
					<MainDiagram/>
				</div>
			</div>
		)
	}
}

export default RaftReadOperationAnimation;
