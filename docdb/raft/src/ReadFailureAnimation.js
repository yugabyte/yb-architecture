
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';
import * as HelperFunctions from './HelperFunctions';

const ANIMATION_STATE_UNSAFE_READ = "ANIMATION_STATE_UNSAFE_READ";
const ANIMATION_STATE_NODE_C_PARTITIONED = "ANIMATION_STATE_NODE_C_PARTITIONED";
const ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER = "ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER";
const ANIMATION_STATE_CLIENT_SET_OPERATION = 'ANIMATION_STATE_CLIENT_SET_OPERATION';
const ANIMATION_STATE_CLIENT_READ_FROM_NODE_C = 'ANIMATION_STATE_CLIENT_READ_FROM_NODE_C';
const ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER = "ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER";
const ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE = 'ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE';

const SET_VALUE2="V2";

export class ReadOperationAnimation extends Component {
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

	pause() {
	}
	resume() {
	}

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
    // Highlight for Text Term (Line 1) -> Only 2 needed
    const nodeATermHighlight = document.getElementById('node-a-term-highlight');
    const nodeBTermHighlight = document.getElementById('node-b-term-highlight');
    // Text Extra (Line 2)
    const nodeAExtraText = document.getElementById('node-a-extra-text');
    const nodeBExtraText = document.getElementById('node-b-extra-text');
    const nodeCExtraText = document.getElementById('node-c-extra-text');
    // Highlight for Text Extra (Line 2)
    const nodeAExtraHighlight = document.getElementById('node-a-text-highlight');
    // Text Extra (Line 3)
    const nodeAExtraText2 = document.getElementById('node-a-extra-text2');

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++) {
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				//////////////////////////////////////////////////////
				this.changeMainText('Let\'s say we have a 3-node Raft group.<br />C is the Raft leader, all nodes have data <br />k = V1', () => {
					// make Node C the Leader
					var nodeC = document.getElementById('node-c-circle');
					nodeC.classList.add('leader-node');
          HelperFunctions.showElement(nodeATextContainer);
          HelperFunctions.showElement(nodeBTextContainer);
          HelperFunctions.showElement(nodeCTextContainer);

          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';

          nodeAExtraText.innerHTML = '(k, V1)';
          nodeBExtraText.innerHTML = '(k, V1)';
          nodeCExtraText.innerHTML = '(k, V1)';
          this.animationState = ANIMATION_STATE_UNSAFE_READ;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
				});
				break;
			}
			case ANIMATION_STATE_UNSAFE_READ: {
        this.changeMainText('');
        const status = document.getElementById('node-c-message-text');

        anime({
					targets: status,
					easing: 'linear',
          duration: 1200,
          opacity: [0, 1],
          begin: function() {
            HelperFunctions.createNodeCMessage('It\'s unsafe to read from Raft leader without majority heartbeats. This sequence explains why.');
          },
					complete: () => {
            this.animationState = ANIMATION_STATE_NODE_C_PARTITIONED;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
				break;
			}
			case ANIMATION_STATE_NODE_C_PARTITIONED: {
				this.changeMainText('');
        HelperFunctions.destroyNodeCMessage();
        const status = document.getElementById('node-c-message-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Now imagine Raft leader C gets\n partitioned from followers\n(but not from client)');
          },
          complete: () => {
            HelperFunctions.partitionNodeC()
            this.animationState = ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
				});
				break;
			}
			case ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER: {
        HelperFunctions.destroyNodeCMessage();
        const status = document.getElementById('node-a-message-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('This results in A and B electing a new Raft leader, say A.');
          },
          complete: () => {
            var nodeA = document.getElementById('node-a-circle');
            nodeA.classList.add('leader-node');
            HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 2"});
            HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 2"});
            HelperFunctions.showElement(nodeATermHighlight);
            HelperFunctions.showElement(nodeBTermHighlight);
            this.animationState = ANIMATION_STATE_CLIENT_SET_OPERATION;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
				});
				break;
			}
			case ANIMATION_STATE_CLIENT_SET_OPERATION: {
        /**
         *  Update: (monospaced) UPDATE T SET value = V2 WHERE key = k 
         *  (Get rid of committed but leave uncommitted and change node
         *  subtext to k: V1, and highlight the value. 
         *  After Node A sends msg to client, show Client: “Update successful!”
         */
        HelperFunctions.destroyNodeAMessage();
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.introduceClient();
        
        const status = document.getElementById('client-status-text');
        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('UPDATE T SET value = V2 WHERE key = k', true);
          },
          complete: () => {
            var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');
            animation.finished.then(() => {
              var nodeAToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)');
              nodeAToBAnimation.finished.then(() => {
                HelperFunctions.destroyClientMessage();
                
                // send commit confirmation back to B
                var aToBAnim = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, false, '', true, 600);
                nodeAExtraText.innerHTML = '(k, V2)';
                HelperFunctions.showElement(nodeAExtraHighlight);
                HelperFunctions.hideElement(nodeAExtraText2);

                aToBAnim.finished.then(() => {
                  HelperFunctions.showElement(document.getElementById('node-b-text-highlight'));
                  document.getElementById('node-b-extra-text').innerHTML = '(k, V2)';
                  HelperFunctions.hideElement(document.getElementById('node-b-extra-text2'));
                });

                // notify client as well
                var messageToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE);

                messageToClientAnimation.finished.then(() => {
                  HelperFunctions.createClientMessage('Update successful!');
                  this.animationState = ANIMATION_STATE_CLIENT_READ_FROM_NODE_C;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                });
              });
            });
          }
        });
				break;
			}
			case ANIMATION_STATE_CLIENT_READ_FROM_NODE_C: {
        HelperFunctions.hideElement(document.getElementById('node-a-text-highlight'));
        HelperFunctions.hideElement(document.getElementById('node-b-text-highlight'));
        HelperFunctions.destroyClientMessage();
        
        this.changeMainText('Now the client queries C. This should return value = ' + SET_VALUE2, () => {
          this.animationState = ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER: {
        this.changeMainText('');
        const status = document.getElementById('client-status-text');
        HelperFunctions.hideElement(document.getElementById('node-c-extra-text2'));

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('SELECT value FROM T WHERE <br>key = k', true);
          },
          complete: () => {
            HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
            this.animationState = ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
				break;
      }
      case ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE: {
        HelperFunctions.destroyClientMessage();
        const nodeCStatus = document.getElementById('node-c-message-text');

        anime({
          targets: nodeCStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('C thinks it is the Raft leader. Without majority heartbeats, C will respond with <br><span class="code-block">value = V1</span>');
          },
          complete: () => {
            var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE, false);
            animation.finished.then(() => {
              HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
              document.getElementById('client-node-value-error-header').innerHTML = 'Value: V1';
              document.getElementById('client-node-value-error-subtitle').innerHTML = 'Expected value = V2';
            });
            this.animationState = Constants.ANIMATION_STATE_FINISHED;
            this.setState({ animationFinished: true });
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
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
			default:
				console.error('Unrecognized state: ' + this.animationState);
		}
	}

  onPrevious() {
		return new Promise((resolve,reject) => {
			this.onPreviousInternal(resolve,reject);
		});
	}
  
  onPreviousInternal(resolve, reject) {
    // Text Containers underneath each Node
    const nodeATextContainer = document.getElementById('node-a-term-text-rect');
    const nodeBTextContainer = document.getElementById('node-b-term-text-rect');
    const nodeCTextContainer = document.getElementById('node-c-term-text-rect');
    // Text Term (Line 1)
    const nodeATermText = document.getElementById('node-a-term-text');
    const nodeBTermText = document.getElementById('node-b-term-text');
    const nodeCTermText = document.getElementById('node-c-term-text');
    // Highlight for Text Term (Line 1) -> Only 2 needed
    const nodeATermHighlight = document.getElementById('node-a-term-highlight');
    const nodeBTermHighlight = document.getElementById('node-b-term-highlight');
    // Text Extra (Line 2)
    const nodeAExtraText = document.getElementById('node-a-extra-text');
    const nodeBExtraText = document.getElementById('node-b-extra-text');
    const nodeCExtraText = document.getElementById('node-c-extra-text');
    // Highlight for Text Extra (Line 2)
    const nodeAExtraHighlight = document.getElementById('node-a-text-highlight');
    const nodeBExtraHighlight = document.getElementById('node-b-text-highlight');
    // Text Extra (Line 3)
    const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    // MISC
    const partitionWrap = document.getElementById('node-c-partition-wrap');

    switch(this.animationState) {
      case ANIMATION_STATE_UNSAFE_READ: {
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.remove('leader-node');
        HelperFunctions.hideElement(nodeATextContainer);
        HelperFunctions.hideElement(nodeBTextContainer);
        HelperFunctions.hideElement(nodeCTextContainer);
        nodeATermText.innerHTML = '';
        nodeBTermText.innerHTML = '';
        nodeCTermText.innerHTML = '';
        nodeAExtraText.innerHTML = '';
        nodeBExtraText.innerHTML = '';
        nodeCExtraText.innerHTML = '';
        this.changeMainText('');
        this.animationState = Constants.ANIMATION_STATE_INITIAL;
        resolve({
          animationState: this.animationState,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_NODE_C_PARTITIONED: {
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.remove('leader-node');
        HelperFunctions.destroyNodeCMessage();
        nodeATermText.innerHTML = '';
        nodeBTermText.innerHTML = '';
        nodeCTermText.innerHTML = '';
        nodeAExtraText.innerHTML = '';
        nodeBExtraText.innerHTML = '';
        nodeCExtraText.innerHTML = '';
        this.changeMainText('Let\'s say we have a 3-node Raft group.<br />C is the Raft leader, all nodes have data <br />k = V1', () => {
          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';

          nodeAExtraText.innerHTML = '(k, V1)';
          nodeBExtraText.innerHTML = '(k, V1)';
          nodeCExtraText.innerHTML = '(k, V1)';
          nodeC.classList.add('leader-node');
          this.animationState = ANIMATION_STATE_UNSAFE_READ;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
        });
        break;
      }
      case ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER: {
        HelperFunctions.hideElement(partitionWrap);
        HelperFunctions.destroyNodeCMessage();
        const status = document.getElementById('node-c-message-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Unsafe to read from Raft leader without majority heartbeats. This sequence explains why.');
          },
          complete: () => {
            this.animationState = ANIMATION_STATE_NODE_C_PARTITIONED;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_SET_OPERATION: {
        var nodeA = document.getElementById('node-a-circle');
        nodeA.classList.remove('leader-node');
        HelperFunctions.hideElement(partitionWrap);
        nodeATermText.innerHTML = 'Term: 1';
        nodeBTermText.innerHTML = 'Term: 1';
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.destroyNodeAMessage();
        const status = document.getElementById('node-c-message-text');
        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Now imagine Raft leader C gets partitioned from followers (but not from client)');
          },
          complete: () => {
            HelperFunctions.showElement(partitionWrap);
            this.animationState = ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_READ_FROM_NODE_C: {
        HelperFunctions.destroyClientMessage();
        HelperFunctions.hideElement(document.getElementById('client-message-circle'));
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        nodeAExtraText.innerText = '(k, V1)';
        nodeBExtraText.innerText = '(k, V1)';
        HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 1"});
        HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 1"});
        
        const nodeAContent = document.getElementById('node-a-message-text');

        anime({
          targets: nodeAContent,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('This results in A and B electing a new Raft leader, say A.');
          },
          complete: () => {
            var nodeA = document.getElementById('node-a-circle');
            nodeA.classList.add('leader-node');
            HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 2"});
            HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 2"});
            HelperFunctions.showElement(nodeATermHighlight);
            HelperFunctions.showElement(nodeBTermHighlight);
            this.animationState = ANIMATION_STATE_CLIENT_SET_OPERATION;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
				});
        break;
      }
      case ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER: {
        this.changeMainText('');
        HelperFunctions.destroyNodeAMessage();
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.introduceClient();

        const status = document.getElementById('client-status-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('UPDATE T SET value = V2 WHERE <br>key = k', true);
          },
          complete: () => {
            var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');
            animation.finished.then(() => {
              var nodeAToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)');
              nodeAToBAnimation.finished.then(() => {
                HelperFunctions.destroyClientMessage();
                
                // send commit confirmation back to B
                var aToBAnim = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, false, '', true, 600);
                nodeAExtraText.innerHTML = '(k, V2)';
                HelperFunctions.showElement(nodeAExtraHighlight);
                HelperFunctions.hideElement(nodeAExtraText2);

                aToBAnim.finished.then(() => {
                  HelperFunctions.showElement(document.getElementById('node-b-text-highlight'));
                  document.getElementById('node-b-extra-text').innerHTML = '(k, V2)';
                  HelperFunctions.hideElement(document.getElementById('node-b-extra-text2'));
                });

                // notify client as well
                var messageToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE);

                messageToClientAnimation.finished.then(() => {
                  HelperFunctions.createClientMessage('Update successful!');
                  this.animationState = ANIMATION_STATE_CLIENT_READ_FROM_NODE_C;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                });
              });
            })
          }
        });
        break;
      }


      case ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE: {
        HelperFunctions.destroyClientMessage();
        this.changeMainText('Now the client queries C. This should return value = ' + SET_VALUE2, () => {
          this.animationState = ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
        });
        break;
      }
      case Constants.ANIMATION_STATE_FINISHED: {
        this.setState({ animationFinished: false });
        HelperFunctions.destroyNodeCMessage();
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
        const status = document.getElementById('client-status-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('SELECT value FROM T WHERE <br>key = k', true);
          },
          complete: () => {
            HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
            this.animationState = ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
        break;
      }
      default:
        console.error('Unrecognized state: ' + this.animationState);
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
				<div id="main-text-sect">
				</div>
			</div>
		)
	}
}

export default ReadOperationAnimation;
