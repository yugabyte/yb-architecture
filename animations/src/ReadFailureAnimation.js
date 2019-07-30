
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';

var HelperFunctions = require('./HelperFunctions');

const ANIMATION_STATE_UNSAFE_READ = "ANIMATION_STATE_UNSAFE_READ";
const ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT = "ANIMATION_STATE_LEADER_RECEIVED_MESSAGE_FROM_CLIENT";
const ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS = "ANIMATION_STATE_LEADER_RECEIVED_ACKS_FROM_FOLLOWERS";
const ANIMATION_STATE_NETWORK_PARTITIONED = "ANIMATION_STATE_NETWORK_PARTITIONED";
const ANIMATION_STATE_NODE_C_PARTITIONED = "ANIMATION_STATE_NODE_C_PARTITIONED";
const ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER = "ANIMATION_STATE_NODE_A_ELECTED_AS_LEADER";
const ANIMATION_STATE_CLIENT_SET_OPERATION = 'ANIMATION_STATE_CLIENT_SET_OPERATION';
const ANIMATION_STATE_CLIENT_READ_FROM_NODE_C = 'ANIMATION_STATE_CLIENT_READ_FROM_NODE_C';
const ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER = "ANIMATION_STATE_CLIENT_SENDS_QUERY_TO_OLD_LEADER";
const ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE = 'ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE';

const SET_VALUE1="V1";
const SET_VALUE2="V2";
function setValueText(value) {
	return HelperFunctions.getSetValueText(value);
}

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
    const nodeBExtraHighlight = document.getElementById('node-b-text-highlight');
    const nodeCExtraHighlight = document.getElementById('node-c-text-highlight');
    // Text Extra (Line 3)
    const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    const nodeBExtraText2 = document.getElementById('node-b-extra-text2');
    const nodeCExtraText2 = document.getElementById('node-c-extra-text2'); 

    // MESSAGE OBJECTS
    const nodeAMessageBubble = document.getElementById('node-a-message-bubble');
    const nodeAMessageStatus = document.getElementById('node-a-message-status');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');
    const clientQueryMessage = document.getElementById('client-query-message');
    const clientMessageBackground = document.getElementById('client-message-status-bg');

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++) {
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				//////////////////////////////////////////////////////
				this.changeMainText('Let\'s say we have a 3-node raft group.<br />C is the raft leader, all nodes have data <br />k = V1', () => {
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
				this.changeMainText('Unsafe to read from raft leader without majority heartbeats. This sequence explains why.', () => {
					this.animationState = ANIMATION_STATE_NODE_C_PARTITIONED;
					resolve({
						animationState: this.animationState,
						delay: 100,
					});
				});
				break;
			}
			case ANIMATION_STATE_NODE_C_PARTITIONED: {
				this.changeMainText('');
        const altBubbleText = document.getElementById('node-c-message-text-alt');
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));

				const contentLine1 = {
					index: 0,
					str: 'Now imagine raft leader C gets\n partitioned from followers\n[but not from client]'
        };

        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 1500,
          update: function() {
            altBubbleText.innerText = contentLine1.str.substr(0, contentLine1.index);
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
        document.getElementById('node-c-message-text-alt').innerText = '';
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        HelperFunctions.showElement(nodeAMessageBubble);
        const content = {
					index: 0,
					str: 'This results in A and B\n electing a new raft\nleader, say A.'
        };

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 1300,
          update: function() {
            nodeAMessageStatus.innerHTML = content.str.substr(0, content.index);
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
        nodeAMessageStatus.innerHTML = '';
        HelperFunctions.hideElement(nodeAMessageBubble);
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.introduceClient();

        const clientContent1 = {
          index: 0,
          str: 'UPDATE T SET'
        }
        const clientContent2 = {
          index: 0,
          str: 'value = V2 WHERE'
        }
        const clientContent3 = {
          index: 0,
          str: ' key = k'
        }
        
        const statusText1 = document.getElementById('client-query-message-text1');
        const statusText2 = document.getElementById('client-query-message-text2');
        const statusText3 = document.getElementById('client-query-message-text3');
        HelperFunctions.showElement(clientMessageBubble);
        HelperFunctions.showElement(clientMessageBackground);
        HelperFunctions.showElement(clientQueryMessage);
        anime({
          targets: clientContent1,
          index: clientContent1.str.length,
          easing: 'linear',
          duration: 400,
          update: function() {
            statusText1.textContent = clientContent1.str.substr(0, clientContent1.index);
          },
          complete: () => {
            anime({
              targets: clientContent2,
              index: clientContent2.str.length,
              easing: 'linear',
              duration: 400,
              update: function () {
                statusText2.textContent = clientContent2.str.substr(0, clientContent2.index);
              },
              complete: () => {
                anime({
                  targets: clientContent3,
                  index: clientContent3.str.length,
                  easing: 'linear',
                  duration: 400,
                  update: function () {
                    statusText3.textContent = clientContent3.str.substr(0, clientContent3.index);
                  },
                  complete: () => {   
                    var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');
                    animation.finished.then(() => {
                      var nodeAToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)');
                      nodeAToBAnimation.finished.then(() => {
                        document.getElementById('client-query-message-text1').innerHTML = '';
                        document.getElementById('client-query-message-text2').innerHTML = '';
                        document.getElementById('client-query-message-text3').innerHTML = '';
                        HelperFunctions.hideElement(clientMessageBubble);
                        HelperFunctions.showElement(nodeAMessageBubble);
                        
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

                        nodeAMessageStatus.innerHTML = '';
                        HelperFunctions.hideElement(nodeAMessageBubble);

                        // notify client as well
                        var messageToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE);

                        messageToClientAnimation.finished.then(() => {
                          HelperFunctions.showElement(clientMessageBubble);
                          HelperFunctions.hideElement(clientQueryMessage);
                          document.getElementById('client-message-status').textContent = 'Update successful!';
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
              }
            });
          }
        });
				break;
			}
			case ANIMATION_STATE_CLIENT_READ_FROM_NODE_C: {
        nodeAMessageStatus.innerHTML = '';
        HelperFunctions.hideElement(nodeAMessageBubble);
        HelperFunctions.hideElement(document.getElementById('node-a-text-highlight'));
        HelperFunctions.hideElement(document.getElementById('node-b-text-highlight'));
        document.getElementById('client-query-message-text1').innerHTML = ''
        document.getElementById('client-query-message-text2').innerHTML = ''
        document.getElementById('client-query-message-text3').innerHTML = ''
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(clientQueryMessage);
        
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
        const statusText1 = document.getElementById('client-query-message-text1');
        const statusText2 = document.getElementById('client-query-message-text2');
        statusText1.innerHTML = '';
        statusText2.innerHTML = '';
        HelperFunctions.showElement(clientMessageBubble);
        HelperFunctions.showElement(clientMessageBackground);
        HelperFunctions.showElement(clientQueryMessage);

        HelperFunctions.hideElement(document.getElementById('node-c-extra-text2'));

        const clientContent1 = {
          index: 0,
          str: 'SELECT value'
        }
        const clientContent2 = {
          index: 0,
          str: 'FROM T WHERE key = k'
        }

        anime({
          targets: clientContent1,
          index: clientContent1.str.length,
          easing: 'linear',
          duration: 400,
          update: function() {
            statusText1.innerHTML = clientContent1.str.substr(0, clientContent1.index);
          },
          complete: () => {
            anime({
              targets: clientContent2,
              index: clientContent2.str.length,
              easing: 'linear',
              duration: 600,
              update: function() {
                statusText2.innerHTML = clientContent2.str.substr(0, clientContent2.index);
              },
              complete: () => {
                var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
                this.animationState = ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE;
                resolve({
                  animationState: this.animationState,
                  delay: 100,
                });
              }
            }); 
          }
        });
				break;
      }
      case ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE: {
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(clientMessageBackground);
        HelperFunctions.hideElement(clientQueryMessage);
        const altBubbleText = document.getElementById('node-c-message-text-alt');
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));

				const contentLine1 = {
					index: 0,
					str: 'C thinks it is the raft leader.\nWithout majority heartbeats,\nC will respond with value = V1'
        };

        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 1500,
          update: function() {
            altBubbleText.innerText = contentLine1.str.substr(0, contentLine1.index);
          },
          complete: () => {
            var animation = HelperFunctions.sendLogMessage(Constants.NODE_C, Constants.CLIENT_NODE, false);
            animation.finished.then(() => {
              HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
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
    const nodeCExtraHighlight = document.getElementById('node-c-text-highlight');
    // Text Extra (Line 3)
    const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    const nodeBExtraText2 = document.getElementById('node-b-extra-text2');
    const nodeCExtraText2 = document.getElementById('node-c-extra-text2'); 

    // MESSAGE OBJECTS
    const nodeAMessageBubble = document.getElementById('node-a-message-bubble');
    const nodeAMessageStatus = document.getElementById('node-a-message-status');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');
    const clientQueryMessage = document.getElementById('client-query-message');
    const clientMessageBackground = document.getElementById('client-message-status-bg');

    // MISC
    const partitionWrap = document.getElementById('node-c-partition-wrap');

    switch(this.animationState) {
      case ANIMATION_STATE_UNSAFE_READ: {
        var nodeC = document.getElementById('node-c-circle');
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
        var nodeC = document.getElementById('node-c-circle');
        nodeC.classList.remove('leader-node');
        nodeATermText.innerHTML = '';
        nodeBTermText.innerHTML = '';
        nodeCTermText.innerHTML = '';
        nodeAExtraText.innerHTML = '';
        nodeBExtraText.innerHTML = '';
        nodeCExtraText.innerHTML = '';
        this.changeMainText('Let\'s say we have a 3-node raft group.<br />C is the raft leader, all nodes have data <br />k = V1', () => {
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
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerText = '';
        this.changeMainText('Unsafe to read from raft leader without majority heartbeats. This sequence explains why.', () => {
          this.animationState = ANIMATION_STATE_NODE_C_PARTITIONED;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
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
        HelperFunctions.hideElement(document.getElementById('node-a-message-bubble'));
        nodeAMessageStatus.innerText = '';
        const altBubbleText = document.getElementById('node-c-message-text-alt');
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));

				const contentLine1 = {
					index: 0,
					str: 'Now imagine raft leader C gets\n partitioned from followers\n[but not from client]'
        };

        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 1500,
          update: function() {
            altBubbleText.innerText = contentLine1.str.substr(0, contentLine1.index);
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
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(document.getElementById('client-node'));
        HelperFunctions.hideElement(document.getElementById('client-message-circle'));
        document.getElementById('client-message-status').innerHTML = '';
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        nodeAExtraText.innerText = '(k, V1)';
        nodeBExtraText.innerText = '(k, V1)';
        HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 1"});
        HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 1"});
        HelperFunctions.showElement(nodeAMessageBubble);
        const content = {
					index: 0,
					str: 'This results in A and B\n electing a new raft\nleader, say A.'
        };

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 1300,
          update: function() {
            nodeAMessageStatus.innerHTML = content.str.substr(0, content.index);
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
        nodeAMessageStatus.innerHTML = '';
        HelperFunctions.hideElement(nodeAMessageBubble);
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.introduceClient();

        const clientContent1 = {
          index: 0,
          str: 'UPDATE T SET'
        }
        const clientContent2 = {
          index: 0,
          str: 'value = V2 WHERE'
        }
        const clientContent3 = {
          index: 0,
          str: ' key = k'
        }
        
        const statusText1 = document.getElementById('client-query-message-text1');
        const statusText2 = document.getElementById('client-query-message-text2');
        const statusText3 = document.getElementById('client-query-message-text3');
        statusText1.innerHTML = '';
        statusText2.innerHTML = '';
        statusText3.innerHTML = '';
        HelperFunctions.showElement(clientMessageBubble);
        HelperFunctions.showElement(clientMessageBackground);
        HelperFunctions.showElement(clientQueryMessage);
        anime({
          targets: clientContent1,
          index: clientContent1.str.length,
          easing: 'linear',
          duration: 400,
          update: function() {
            statusText1.textContent = clientContent1.str.substr(0, clientContent1.index);
          },
          complete: () => {
            anime({
              targets: clientContent2,
              index: clientContent2.str.length,
              easing: 'linear',
              duration: 400,
              update: function () {
                statusText2.textContent = clientContent2.str.substr(0, clientContent2.index);
              },
              complete: () => {
                anime({
                  targets: clientContent3,
                  index: clientContent3.str.length,
                  easing: 'linear',
                  duration: 400,
                  update: function () {
                    statusText3.textContent = clientContent3.str.substr(0, clientContent3.index);
                  },
                  complete: () => {   
                    var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');
                    animation.finished.then(() => {
                      var nodeAToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)');
                      nodeAToBAnimation.finished.then(() => {
                        document.getElementById('client-query-message-text1').innerHTML = '';
                        document.getElementById('client-query-message-text2').innerHTML = '';
                        document.getElementById('client-query-message-text3').innerHTML = '';
                        HelperFunctions.hideElement(clientMessageBubble);
                        HelperFunctions.showElement(nodeAMessageBubble);
                        
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

                        nodeAMessageStatus.innerHTML = '';
                        HelperFunctions.hideElement(nodeAMessageBubble);

                        // notify client as well
                        var messageToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE);

                        messageToClientAnimation.finished.then(() => {
                          HelperFunctions.showElement(clientMessageBubble);
                          document.getElementById('client-message-status').textContent = 'Update successful!';
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
              }
            });
          }
        });
        break;
      }


      case ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE: {
        HelperFunctions.hideElement(clientMessageBackground);
        HelperFunctions.hideElement(clientQueryMessage);
        HelperFunctions.hideElement(clientMessageBubble);
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
        document.getElementById('node-c-message-text-alt').innerHTML = '';

        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));

        const statusText1 = document.getElementById('client-query-message-text1');
        const statusText2 = document.getElementById('client-query-message-text2');
        statusText1.innerHTML = '';
        statusText2.innerHTML = '';
        HelperFunctions.showElement(clientMessageBubble);
        HelperFunctions.showElement(clientMessageBackground);
        HelperFunctions.showElement(clientQueryMessage);

        HelperFunctions.hideElement(document.getElementById('node-c-extra-text2'));

        const clientContent1 = {
          index: 0,
          str: 'SELECT value'
        }
        const clientContent2 = {
          index: 0,
          str: 'FROM T WHERE key = k'
        }

        anime({
          targets: clientContent1,
          index: clientContent1.str.length,
          easing: 'linear',
          duration: 400,
          update: function() {
            statusText1.innerHTML = clientContent1.str.substr(0, clientContent1.index);
          },
          complete: () => {
            anime({
              targets: clientContent2,
              index: clientContent2.str.length,
              easing: 'linear',
              duration: 600,
              update: function() {
                statusText2.innerHTML = clientContent2.str.substr(0, clientContent2.index);
              },
              complete: () => {
                var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_C, false);
                this.animationState = ANIMATION_STATE_NODE_C_RETURNS_INCORRECT_VALUE;
                resolve({
                  animationState: this.animationState,
                  delay: 100,
                });
              }
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
