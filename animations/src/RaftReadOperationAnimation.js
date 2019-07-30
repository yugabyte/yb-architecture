
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';

var HelperFunctions = require('./HelperFunctions');

const ANIMATION_STATE_EXPLAIN_PROTOCOL = 'ANIMATION_STATE_EXPLAIN_PROTOCOL';
const ANIMATION_STATE_LEADER_ELECTION = 'ANIMATION_STATE_LEADER_ELECTION';
const ANIMATION_STATE_NODE_DATA = 'ANIMATION_STATE_NODE_DATA';
const ANIMATION_STATE_CLIENT_INTRODUCED = 'ANIMATION_STATE_CLIENT_INTRODUCED';
const ANIMATION_STATE_PERFORMED_READ_ON_LEADER = "ANIMATION_STATE_PERFORMED_READ_ON_LEADER";
const ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS";
const ANIMATION_STATE_CLIENT_FINISH_OPERATION = 'ANIMATION_STATE_CLIENT_FINISH_OPERATION';

const SET_VALUE1="V1";
const SET_VALUE2="V2";

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
    // Text Extra (Line 3)
    // const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    // const nodeBExtraText2 = document.getElementById('node-b-extra-text2');
    // const nodeCExtraText2 = document.getElementById('node-c-extra-text2');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////
				// make Node C the Leader
				// var nodeC = document.getElementById('node-c-circle');
				// nodeC.classList.add('leader-node');

				// hide all outer circles (TODO: revisit this approach)
				let nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (let i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
        }

        this.changeMainText('Let’s say we have a 3-node raft group.');
        this.animationState = ANIMATION_STATE_EXPLAIN_PROTOCOL;

        resolve({
          animationState: ANIMATION_STATE_EXPLAIN_PROTOCOL,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_EXPLAIN_PROTOCOL: {
				this.changeMainText('Nodes would have performed leader election..', () => {
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
				this.changeMainText('Node C is the current raft leader,<br /> denoted by black border.', () => {
          nodeAExtraText.innerHTML = '';
          nodeBExtraText.innerHTML = '';
          nodeCExtraText.innerHTML = '';
          document.getElementById('node-c-circle').classList.add('leader-node');
          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';
        });
        this.animationState = ANIMATION_STATE_NODE_DATA;
        resolve({
          animationState: ANIMATION_STATE_NODE_DATA,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_NODE_DATA: {
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

          HelperFunctions.showElement(document.getElementById('client-message'));
          const statusElem = document.getElementById('client-query-message');
          document.getElementById('client-query-message-text1');
          const contentLine1 = {
            index: 0,
            str: 'SELECT value'
          }
          const contentLine2 = {
            index: 0,
            str: 'FROM T WHERE key = k'
          }
          const statusTextLine1 = document.getElementById('client-query-message-text1');
          const statusTextLine2 = document.getElementById('client-query-message-text2');
          HelperFunctions.showElement(clientMessageBubble);
          HelperFunctions.showElement(statusElem);
          anime({
            targets: contentLine1,
            index: contentLine1.str.length,
            easing: 'linear',
            duration: 600,
            update: function() {
              statusTextLine1.textContent = contentLine1.str.substr(0, contentLine1.index);
            },
            complete: () => {
              anime({
                targets: contentLine2,
                index: contentLine2.str.length,
                easing: 'linear',
                duration: 900,
                update: function() {
                  statusTextLine2.innerHTML = contentLine2.str.substr(0, contentLine2.index);
                },
                complete: () => HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false)
              });
            }
          });

					this.animationState = ANIMATION_STATE_PERFORMED_READ_ON_LEADER;
					resolve({
						animationState: ANIMATION_STATE_PERFORMED_READ_ON_LEADER,
						delay: 100,
					});
				})
				break;
			}
			case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
				// Leader contacts followers to obtain a consensus on current value
				HelperFunctions.hideElement(document.getElementById('client-query-message'));
        HelperFunctions.hideElement(clientMessageBubble);
        document.getElementById('client-query-message-text1').innerHTML = '';
        document.getElementById('client-query-message-text2').innerHTML = ''
				const statusElem = document.getElementById('node-c-message-status');
				HelperFunctions.showElement(document.getElementById('node-c-message-bubble'));
				HelperFunctions.showElement(statusElem);
				const contentLine1 = {
					index: 0,
					str: 'Per raft protocol, leader should'
				}
				const contentLine2 = {
					index: 0,
					str: 'obtain majority heartbeat.'
				}
				const leaderTextLine1 = document.getElementById('node-c-message-status-text1');
				const leaderTextLine2 = document.getElementById('node-c-message-status-text2')
				anime({
					targets: contentLine1,
					index: contentLine1.str.length,
					easing: 'linear',
					duration: 800,
					update: function() {
						leaderTextLine1.textContent = contentLine1.str.substr(0, contentLine1.index);
					},
					complete: () => {
						anime({
							targets: contentLine2,
							index: contentLine2.str.length,
							easing: 'linear',
							duration: 1040,
							update: function() {
								leaderTextLine2.textContent = contentLine2.str.substr(0, contentLine2.index);
              },
              complete: () => HelperFunctions.logMessageFromLeaderToFollowers(false)
            });
            
            this.animationState = ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS;
					}
				});

				resolve({
					animationState: this.animationState,
					delay: 1000
				});
				break;
			}
			case ANIMATION_STATE_LEADER_RECEIVED_MAJORITY_ON_VALUE_FROM_FOLLOWERS: {
        const receivedAckAnimation = HelperFunctions.logMessageAckFromFollowersToLeader();

        receivedAckAnimation[0].finished.then(() => {
          // Once majority is obtained. The leader returns value back to the client
          document.getElementById('node-c-message-status-text1').textContent = 'Leader:';
          document.getElementById('node-c-message-status-text2').textContent = '';
          const leaderText1 = {
            index: 7,
            str: 'Majority heartbeat obtained,'
          }
          const leaderText2 = {
            index: 0,
            str: 'raft leader can serve read.'
          }
          const ltxt1 = document.getElementById('node-c-message-status-text1');
          const ltxt2 = document.getElementById('node-c-message-status-text2')
          anime({
            targets: leaderText1,
            index: leaderText1.str.length,
            easing: 'linear',
            duration: 800,
            update: function() {
              ltxt1.textContent = leaderText1.str.substr(0, leaderText1.index);
            },
            complete: () => {
              anime({
                targets: leaderText2,
                index: leaderText2.str.length,
                easing: 'linear',
                duration: 1080,
                update: function() {
                  ltxt2.textContent = leaderText2.str.substr(0, leaderText2.index);
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
            }
          });
        })
				break;
      }
      case ANIMATION_STATE_CLIENT_FINISH_OPERATION: {
				HelperFunctions.hideElement(document.getElementById('node-c-message-bubble'));
        HelperFunctions.hideElement(document.getElementById('node-c-message-status'));
        this.changeMainText('<img src="./svg/warning-sign.svg" width="40"/> If nodes are in different regions, obtaining majority heartbeat is expensive. Query has high latency.');
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
    // Text Extra (Line 3)
    // const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    // const nodeBExtraText2 = document.getElementById('node-b-extra-text2');
    // const nodeCExtraText2 = document.getElementById('node-c-extra-text2');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');

    
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
        this.changeMainText('Let’s say we have a 3-node raft group.', () => { this.animationState = ANIMATION_STATE_EXPLAIN_PROTOCOL });

        resolve({
          animationState: ANIMATION_STATE_EXPLAIN_PROTOCOL,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_NODE_DATA: {
        // Undo phase
        document.getElementById('node-c-circle').classList.remove('leader-node');
        nodeATermText.innerHTML = '';
        nodeBTermText.innerHTML = '';
        nodeCTermText.innerHTML = '';

        // Redo previous phase
        this.changeMainText('Nodes would have performed leader election..', () => {
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
        document.getElementById('node-c-circle').classList.remove('leader-node');
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        HelperFunctions.hideElement(nodeCExtraHighlight);

        // Redo previous phase
        nodeAExtraText.innerHTML = '';
        nodeBExtraText.innerHTML = '';
        nodeCExtraText.innerHTML = '';
				this.changeMainText('Node C is the current raft leader,<br /> denoted by black border.', () => {
          document.getElementById('node-c-circle').classList.add('leader-node');
          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';
        });
        this.animationState = ANIMATION_STATE_NODE_DATA;
        resolve({
          animationState: ANIMATION_STATE_NODE_DATA,
          delay: 100,
        });
        break;
      }
      case ANIMATION_STATE_PERFORMED_READ_ON_LEADER: {
        HelperFunctions.hideElement(document.getElementById('client-query-message'));
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideClient();
        document.getElementById('client-query-message-text1').innerHTML = '';
        document.getElementById('client-query-message-text2').innerHTML = '';
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
        const statusElem = document.getElementById('node-c-message-status');
				HelperFunctions.hideElement(document.getElementById('node-c-message-bubble'));
				HelperFunctions.hideElement(statusElem);
				document.getElementById('node-c-message-status-text1').innerHTML = '';
        document.getElementById('node-c-message-status-text2').innerHTML = '';
        var introduceClientAnimation = HelperFunctions.introduceClient('');
        this.changeMainText('');

				introduceClientAnimation.finished.then(() => {
          HelperFunctions.hideElement(nodeAExtraHighlight);
          HelperFunctions.hideElement(nodeBExtraHighlight);
          HelperFunctions.hideElement(nodeCExtraHighlight);

          HelperFunctions.showElement(document.getElementById('client-message'));
          const statusElem = document.getElementById('client-query-message');
          document.getElementById('client-query-message-text1');
          const contentLine1 = {
            index: 0,
            str: 'SELECT value'
          }
          const contentLine2 = {
            index: 0,
            str: 'FROM T WHERE key = k'
          }
          const statusTextLine1 = document.getElementById('client-query-message-text1');
          const statusTextLine2 = document.getElementById('client-query-message-text2');
          HelperFunctions.showElement(clientMessageBubble);
          HelperFunctions.showElement(statusElem);
          anime({
            targets: contentLine1,
            index: contentLine1.str.length,
            easing: 'linear',
            duration: 600,
            update: function() {
              statusTextLine1.innerHTML = contentLine1.str.substr(0, contentLine1.index);
            },
            complete: () => {
              anime({
                targets: contentLine2,
                index: contentLine2.str.length,
                easing: 'linear',
                duration: 900,
                update: function() {
                  statusTextLine2.innerHTML = contentLine2.str.substr(0, contentLine2.index);
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
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_FINISH_OPERATION: {
        const leaderTextLine1 = document.getElementById('node-c-message-status-text1');
        const leaderTextLine2 = document.getElementById('node-c-message-status-text2');
        HelperFunctions.hideElement(document.getElementById('client-node-value'));
        leaderTextLine1.innerHTML = '';
        leaderTextLine2.innerHTML = '';
        
        const contentLine1 = {
					index: 0,
					str: 'Per raft protocol, leader should'
				}
				const contentLine2 = {
					index: 0,
					str: 'obtain majority heartbeat.'
				}
				
				anime({
					targets: contentLine1,
					index: contentLine1.str.length,
					easing: 'linear',
					duration: 800,
					update: function() {
						leaderTextLine1.textContent = contentLine1.str.substr(0, contentLine1.index);
					},
					complete: () => {
						anime({
							targets: contentLine2,
							index: contentLine2.str.length,
							easing: 'linear',
							duration: 1040,
							update: function() {
								leaderTextLine2.textContent = contentLine2.str.substr(0, contentLine2.index);
              },
              complete: () => HelperFunctions.logMessageFromLeaderToFollowers(false)
            });
            
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
        HelperFunctions.hideElement(document.getElementById('client-node-value'))
        document.getElementById('node-c-message-status-text1').innerHTML = '';
        document.getElementById('node-c-message-status-text2').innerHTML = '';
        this.setState({ animationFinished: false });
        const receivedAckAnimation = HelperFunctions.logMessageAckFromFollowersToLeader();

        receivedAckAnimation[0].finished.then(() => {
          // Once majority is obtained. The leader returns value back to the client
          const statusElem = document.getElementById('node-c-message-status');
          HelperFunctions.showElement(document.getElementById('node-c-message-bubble'));
          HelperFunctions.showElement(statusElem);
          
          const leaderText1 = {
            index: 7,
            str: 'Majority heartbeat obtained,'
          }
          const leaderText2 = {
            index: 0,
            str: 'raft leader can serve read.'
          }
          const ltxt1 = document.getElementById('node-c-message-status-text1');
          const ltxt2 = document.getElementById('node-c-message-status-text2')
          anime({
            targets: leaderText1,
            index: leaderText1.str.length,
            easing: 'linear',
            duration: 800,
            update: function() {
              ltxt1.textContent = leaderText1.str.substr(0, leaderText1.index);
            },
            complete: () => {
              anime({
                targets: leaderText2,
                index: leaderText2.str.length,
                easing: 'linear',
                duration: 1080,
                update: function() {
                  ltxt2.textContent = leaderText2.str.substr(0, leaderText2.index);
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
