
import React, { Component } from 'react';
import './App.css';
import anime from 'animejs/lib/anime.es.js';
import MainDiagram from './svg/MainDiagram';
import { Constants } from './constants';

var HelperFunctions = require('./HelperFunctions');

const ANIMATION_STATE_LEADER_REPLICATES_LEASE = "ANIMATION_STATE_LEADER_REPLICATES_LEASE";
const ANIMATION_STATE_LEADER_READS_PROTOCOL = 'ANIMATION_STATE_LEADER_READS_PROTOCOL';
const ANIMATION_STATE_START_LEADER_LEASE = 'ANIMATION_STATE_START_LEADER_LEASE';
const ANIMATION_STATE_CLIENT_UPDATE_FAILS = 'ANIMATION_STATE_CLIENT_UPDATE_FAILS';
const ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED = "ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED";
const ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED = "ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED";
const ANIMATION_STATE_NEW_LEADER_ELECTED = "ANIMATION_STATE_NEW_LEADER_ELECTED";
const ANIMATION_STATE_LEADER_LEASE_DURATION = 'ANIMATION_STATE_LEADER_LEASE_DURATION';
const ANIMATION_STATE_OLD_LEADER_STILL_READABLE = 'ANIMATION_STATE_OLD_LEADER_STILL_READABLE';
const ANIMATION_STATE_OLD_LEASE_EXPIRES = 'ANIMATION_STATE_OLD_LEASE_EXPIRES';
const ANIMATION_STATE_LEADER_LEASE_CONCLUSION = 'ANIMATION_STATE_LEADER_LEASE_CONCLUSION';
const ANIMATION_STATE_NEW_LEADER_SENT_LEASES = "ANIMATION_STATE_NEW_LEADER_SENT_LEASES";

const ORIGINAL_LEADER_INITIAL_DURATION = 3000;
const LEADER_REPLICATION_DURATION = 5000;


export class LeaderLeaseAnimation extends Component {
	constructor(props) {
    super(props);
    this.animationState = Constants.ANIMATION_STATE_INITIAL;
		this.state = {
      previousEnabled: true
		}
		this.init();
	}
	init() {
		this.nodeATimerAnimation = null;
		this.nodeBTimerAnimation = null;
		this.nodeCTimerAnimation = null;
	}
	componentDidMount() {
		this.mainTextSect = document.getElementById('center-message-text');
		this.timersAreActive = false;
	}

	pause() {
		if (this.timersAreActive) {
			this.pauseTimers();
		}
	}
	resume() {
		if (this.timersAreActive) {
			this.resumeTimers();
		}
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
    // Text Extra (Line 3)
    const nodeAExtraText2 = document.getElementById('node-a-extra-text2');
    const nodeBExtraText2 = document.getElementById('node-b-extra-text2');

    // MESSAGE OBJECTS
    const nodeAMessageBubble = document.getElementById('node-a-message-bubble');
    const nodeAMessageStatus = document.getElementById('node-a-message-status');
    const nodeCMessageBubble = document.getElementById('node-c-message-bubble');
    const nodeCMessageStatus = document.getElementById('node-c-message-status');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');
    const clientQueryMessage = document.getElementById('client-query-message');
    const clientMessageStatus = document.getElementById('client-message-status');
    const clientMessageBackground = document.getElementById('client-message-status-bg');

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				
				//////////////////////////////////////////////////////
				this.changeMainText('Let\'s say we have a 3-node raft group.<br />C is the raft leader, all nodes have data <br />k = V1', () => {
          // make Node C  the leader
          var nodeC = document.getElementById('node-c-circle');
          nodeC.classList.add('leader-node');
          HelperFunctions.showElement(nodeATextContainer);
          HelperFunctions.showElement(nodeBTextContainer);
          HelperFunctions.showElement(nodeCTextContainer);
          HelperFunctions.showElement(nodeATermText);
          HelperFunctions.showElement(nodeBTermText);
          HelperFunctions.showElement(nodeCTermText);
          HelperFunctions.showElement(nodeAExtraText);
          HelperFunctions.showElement(nodeBExtraText);
          HelperFunctions.showElement(nodeCExtraText);

          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';

          nodeAExtraText.innerHTML = '(k, V1)';
          nodeBExtraText.innerHTML = '(k, V1)';
          nodeCExtraText.innerHTML = '(k, V1)';
          this.animationState = ANIMATION_STATE_LEADER_READS_PROTOCOL;
          resolve({
            animationState: this.animationState,
            delay: 1000,
          });
				});
				break;
      }
      case ANIMATION_STATE_LEADER_READS_PROTOCOL: {
        this.changeMainText('Using leader leases to safely perform reads from the leader..', () => {
          this.animationState = ANIMATION_STATE_START_LEADER_LEASE;
          resolve({
            animationState: this.animationState,
            delay: 1000,
          });
        });
        break;
      }
      case ANIMATION_STATE_START_LEADER_LEASE: {
        this.changeMainText('');
        HelperFunctions.showElement(nodeCMessageBubble);
        HelperFunctions.showElement(nodeCMessageStatus);
        const statusText1 = document.getElementById('node-c-message-status-text1');
        const statusText2 = document.getElementById('node-c-message-status-text2');

        const contentLine1 = {
          index: 0,
          str: 'Raft leader starts a'
        }
        const contentLine2 = {
          index: 0,
          str: 'new lease timer for itself.'
        }
        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 600,
          update: function() {
            statusText1.textContent = contentLine1.str.substr(0, contentLine1.index);
          },
          complete: () => {
            anime({
              targets: contentLine2,
              index: contentLine2.str.length,
              easing: 'linear',
              duration: 600,
              update: function() {
                statusText2.textContent = contentLine2.str.substr(0, contentLine2.index);
              },
              complete: () => {
                this.timersAreActive = true;
                if (this.nodeCTimerAnimation) {
                  HelperFunctions.showElement(document.getElementById('mlease-rect-node-c'));
                  this.nodeCTimerAnimation.restart();
                } else {
                  this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, ORIGINAL_LEADER_INITIAL_DURATION, 90, true);
                  this.nodeCTimerAnimation.play();
                }
                this.animationState = ANIMATION_STATE_LEADER_REPLICATES_LEASE;
                resolve({
                  animationState: this.animationState,
                  delay: 100,
                  asyncAnimation: true,
                });
              }
            });
          }
        });
        break;
      }
			case ANIMATION_STATE_LEADER_REPLICATES_LEASE: {
        this.nodeCTimerAnimation.seek(0);
        HelperFunctions.hideElement(nodeCMessageBubble);
        HelperFunctions.hideElement(nodeCMessageStatus);
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));
        const textAlt = document.getElementById('node-c-message-text-alt');
        var leaseToA = document.getElementById('node-c-lease-to-node-a');
        const content = {
					index: 0,
					str: 'Raft leader then replicates a\nlease interval to followers. Note\nthe lease timer on C has started\nbefore replicating to A and B.'
        };

        var nodeCTextAnimation = anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2500,
          update: function() {
            textAlt.innerText = content.str.substr(0, content.index);
          }
				});
        var nodeALeaseAnimation = anime({
          targets: leaseToA,
          translateX: -280,
          translateY: 0,
          easing: 'linear',
          duration: 1500,
          begin: () => {
            HelperFunctions.showElement(leaseToA);
          },
          complete: () =>{
            HelperFunctions.hideElement(leaseToA);
            leaseToA.style.transform = 'none';
          },
        });

        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, LEADER_REPLICATION_DURATION, 60);

        var leaseToB = document.getElementById('node-c-lease-to-node-b');
        var nodeBLeaseAnimation = anime({
          targets: leaseToB,
          translateX: -150,
          translateY: -280,
          easing: 'linear',
          duration: 1500,
          begin: () => {
            HelperFunctions.showElement(leaseToB);
          },
          complete: () =>{
            HelperFunctions.hideElement(leaseToB);
            leaseToB.style.transform = 'none';
          },
        });
        Promise.all([nodeCTextAnimation.finished, nodeALeaseAnimation.finished,nodeBLeaseAnimation.finished, this.nodeCTimerAnimation]).then(() => {
          this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, ORIGINAL_LEADER_INITIAL_DURATION, 85);
          this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, ORIGINAL_LEADER_INITIAL_DURATION, 90);

          this.animationState = ANIMATION_STATE_LEADER_LEASE_DURATION;
          resolve({
            animationState: this.animationState,
            delay: 500,
            asyncAnimation: true
          });
        });
				break;
			}
			case ANIMATION_STATE_LEADER_LEASE_DURATION: {
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerHTML = '';

        this.changeMainText('Any new leader must wait out the existing Leader Lease duration before acquiring lease.', () => {
          this.animationState = ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
        });
        break;
      }
      case ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED: {
        this.changeMainText('Now suppose the original leader gets network partitioned', () => {
          // partition original leader
					HelperFunctions.partitionNodeC();
          this.animationState = ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
        });
        break;
      }
      case ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED: {
        this.changeMainText('');
        HelperFunctions.showElement(nodeAMessageBubble);
        HelperFunctions.showElement(document.getElementById('node-a-message-status-bg'));
        const nodeAContent = {
          index: 0,
          str: 'A wins new leader election\n but cannot perform any\noperations until Leader\nLease on A runs out.'
        };

        anime({
          targets: nodeAContent,
          index: nodeAContent.str.length,
          easing: 'linear',
          duration: 1500,
          update: function() {
            nodeAMessageStatus.innerText = nodeAContent.str.substr(0, nodeAContent.index);
          },
          complete: () => {
            // elect Node A as new leader candidate
            var nodeA = document.getElementById('node-a-circle');
            nodeA.classList.add('leader-candidate-node');
            HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 2"});
            HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 2"});
            HelperFunctions.showElement(nodeATermHighlight);
            HelperFunctions.showElement(nodeBTermHighlight);
            this.animationState = ANIMATION_STATE_CLIENT_UPDATE_FAILS;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
				});
        
        break;
      }
			case ANIMATION_STATE_CLIENT_UPDATE_FAILS: {
        HelperFunctions.hideElement(nodeAMessageBubble);
        HelperFunctions.hideElement(document.getElementById('node-a-message-status-bg'));
        nodeAMessageStatus.innerHTML = '';
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
				this.changeMainText('If client tries to write to A, operation is rejected..', () => {
          HelperFunctions.introduceClient();
          HelperFunctions.showElement(clientMessageBubble);
          HelperFunctions.showElement(clientMessageBackground);
          HelperFunctions.showElement(clientQueryMessage);
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
                      var messageContrainerElement = document.getElementById('client-message');
                      var messageElement = document.getElementById('client-message-circle');
                      HelperFunctions.messageFromClient(Constants.NODE_A,	{
                        onBegin: () => {
                          HelperFunctions.showElement(messageContrainerElement);
                          messageElement.classList.add('log-message');
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                        },
                        onChangeComplete: () => {
                          messageElement.classList.remove('log-message');
                          messageElement.classList.add('error-message');
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: 'Rejected'});
                          // messageTextElement
                        },
                        onComplete: () => {
                          messageElement.classList.remove('error-message');
                          HelperFunctions.hideElement(messageContrainerElement);
                          messageContrainerElement.style.transform = 'none';
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                          HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
                          document.getElementById('client-node-value-error-header').innerHTML = 'Query Rejected:';
                          document.getElementById('client-node-value-error-subtitle').innerHTML = 'Cannot find raft leader';
                        },
                        alternate: true,
                      });
                      this.animationState = ANIMATION_STATE_OLD_LEADER_STILL_READABLE;
                      resolve({
                        animationState: this.animationState,
                        delay: 100,
                      });
                    }
                  });
                }
              });
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_OLD_LEADER_STILL_READABLE: {
        this.changeMainText('');
        HelperFunctions.hideElement(document.getElementById('client-query-message'));
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));

        const contentLine1 = {
          index: 0,
          str: 'Client can still read from C and get a valid response. Writes, however, are unavailable at this moment.'
        };

        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            clientMessageStatus.textContent = contentLine1.str.substr(0, contentLine1.index);
          },
          complete: () => {
            HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
            this.animationState = ANIMATION_STATE_OLD_LEASE_EXPIRES;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
       break;
      }
      case ANIMATION_STATE_OLD_LEASE_EXPIRES: {
        HelperFunctions.hideElement(clientMessageBubble);
        document.getElementById('client-message-status').innerHTML = '';
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));
        const nodeCTextAlt = document.getElementById('node-c-message-text-alt');
        const content = {
          index: 0,
          str: 'Leader Lease of C will run out\nfirst [since it started first]. \nC now steps down as leader.'
        };
        this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, 6000, 25);
        this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, 6000, 30);
        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, 6000);

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            nodeCTextAlt.textContent = content.str.substr(0, content.index);
          },
        });
        this.nodeCTimerAnimation.finished.then(() => {
          var nodeC = document.getElementById('node-c-circle');
          nodeC.classList.remove('leader-node');
          this.animationState = ANIMATION_STATE_NEW_LEADER_ELECTED;
          resolve({
            animationState: this.animationState,
            delay: 100,
            asyncAnimation: true
          });
        });
				break;
			}
			case ANIMATION_STATE_NEW_LEADER_ELECTED: {
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerHTML = '';

        HelperFunctions.showElement(document.getElementById('node-a-message-bubble'));
        HelperFunctions.showElement(document.getElementById('node-a-message-status-bg'));
        const nodeAMessage = document.getElementById('node-a-message-status');
        const content = {
          index: 0,
          str: 'Once Leader Lease on A expires, it becomes raft leader.'
        };

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 800,
          update: function() {
            nodeAMessage.textContent = content.str.substr(0, content.index);
          },
          complete: () => {
            this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, 2000);
            this.nodeATimerAnimation.finished.then(() => {
              var nodeA = document.getElementById('node-a-circle');
              HelperFunctions.showElement(document.getElementById('node-a-timer-highlight'));
              nodeA.classList.remove('leader-candidate-node');
              nodeA.classList.add('leader-node');
    
              // hide Node A's leader lease timer
              HelperFunctions.hideElement(document.getElementById(HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)));
    
              // and start its my lease timer
              this.nodeATimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_A, 5000, 50);
    
              // then send leader lease message to B
              var leaseToB = document.getElementById('node-a-lease-to-node-b');
              anime({
                targets: leaseToB,
                translateX: 150,
                translateY: -280,
                easing: 'linear',
                duration: 1500,
                begin: () => {
                  HelperFunctions.showElement(leaseToB);
                },
                complete: () => {
                  HelperFunctions.hideElement(leaseToB);
                  leaseToB.style.transform = 'none';
    
                  this.nodeBTimerAnimation.restart();
                  this.animationState = ANIMATION_STATE_NEW_LEADER_SENT_LEASES;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                },
              });
            });
          }
        });        
				break;
			}
			case ANIMATION_STATE_NEW_LEADER_SENT_LEASES: {
        HelperFunctions.hideElement(document.getElementById('node-a-message-bubble'));
        HelperFunctions.hideElement(document.getElementById('node-a-message-status-bg'));
        HelperFunctions.hideElement(document.getElementById('node-a-timer-highlight'));
        document.getElementById('node-a-message-status').innerHTML = '';
        HelperFunctions.showElement(clientMessageBubble);
        const messageStatus = document.getElementById('client-message-status');

        const content = {
          index: 0,
          str: 'From here on, client can issue reads/writes to the new leader.'
        }

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            messageStatus.textContent = content.str.substr(0, content.index);
          },
          complete: () => {
            // initiate a raft round
            
            // client message to A
            var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');

            animation.finished.then(() => {
              // message with ack from A to B
              nodeAExtraText.innerHTML = '(k, V2)';
              var messageToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)', false, 0, this.nodeBTimerAnimation, this.nodeATimerAnimation);

              messageToBAnimation.finished.then(() => {
                nodeBExtraText.innerHTML = '(k, V2)';
                HelperFunctions.hideElement(nodeAExtraText2);
                HelperFunctions.showElement(nodeAExtraHighlight);
                // confirmation message back to B and the client
                var confirmToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE, false, false, '', true);
                var confirmToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, false, '', true, 300, this.nodeBTimerAnimation);

                Promise.all([confirmToClientAnimation.finished, confirmToBAnimation.finished]).then(() => {
                  HelperFunctions.hideElement(nodeBExtraText2);
                  nodeBExtraText.innerHTML = '(k, V2)';
                  HelperFunctions.showElement(nodeBExtraHighlight);
                  this.animationState = ANIMATION_STATE_LEADER_LEASE_CONCLUSION;
                  this.stopTimers();
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
      case ANIMATION_STATE_LEADER_LEASE_CONCLUSION: {
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(clientMessageBackground);
        document.getElementById('client-message-status').innerHTML = '';
        this.changeMainText('Leader Leases ensure low latency reads even when nodes are across regions.', () => {
          this.animationState = Constants.ANIMATION_STATE_FINISHED;
          this.stopTimers();
          this.setState({ animationFinished: true });
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
        })
        break;
      }
			case Constants.ANIMATION_STATE_FINISHED: {
				console.log('Animation finished. Nothing to do');
				resolve({
					animationState: this.animationState,
					delay: 100,
				});
				break;
			}
			default:
        console.error('Unrecognized state: ' + this.animationState);
        reject('Unrecognized state');
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
    const nodeBExtraText2 = document.getElementById('node-b-extra-text2');

    // MESSAGE OBJECTS
    const nodeAMessageBubble = document.getElementById('node-a-message-bubble');
    const nodeAMessageStatus = document.getElementById('node-a-message-status');
    const nodeCMessageBubble = document.getElementById('node-c-message-bubble');
    const nodeCMessageStatus = document.getElementById('node-c-message-status');

    // Client
    const clientMessageBubble = document.getElementById('client-message-bubble');
    const clientQueryMessage = document.getElementById('client-query-message');
    const clientMessageStatus = document.getElementById('client-message-status');
    const clientMessageBackground = document.getElementById('client-message-status-bg');

		switch(this.animationState) {
			case ANIMATION_STATE_LEADER_READS_PROTOCOL: {
        HelperFunctions.hideElement(nodeATermText);
        HelperFunctions.hideElement(nodeBTermText);
        HelperFunctions.hideElement(nodeCTermText);
        HelperFunctions.hideElement(nodeAExtraText);
        HelperFunctions.hideElement(nodeBExtraText);
        HelperFunctions.hideElement(nodeCExtraText);
        var nodeC = document.getElementById('node-c-circle');
        nodeC.classList.remove('leader-node');
        this.changeMainText('')
        this.animationState = Constants.ANIMATION_STATE_INITIAL;
        resolve({
          animationState: this.animationState,
          delay: 1000,
        });
        break;
      }
      case ANIMATION_STATE_START_LEADER_LEASE: {
        // Undo phase
				HelperFunctions.hideElement(nodeATermText);
        HelperFunctions.hideElement(nodeBTermText);
        HelperFunctions.hideElement(nodeCTermText);
        HelperFunctions.hideElement(nodeAExtraText);
        HelperFunctions.hideElement(nodeBExtraText);
        HelperFunctions.hideElement(nodeCExtraText);
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.remove('leader-node');

        // Redo phase
				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				
				//////////////////////////////////////////////////////
				this.changeMainText('Let\'s say we have a 3-node raft group.<br />C is the raft leader, all nodes have data <br />k = V1', () => {
          // make Node C  the leader
          nodeC.classList.add('leader-node');
          HelperFunctions.showElement(nodeATextContainer);
          HelperFunctions.showElement(nodeBTextContainer);
          HelperFunctions.showElement(nodeCTextContainer);
          HelperFunctions.showElement(nodeATermText);
          HelperFunctions.showElement(nodeBTermText);
          HelperFunctions.showElement(nodeCTermText);
          HelperFunctions.showElement(nodeAExtraText);
          HelperFunctions.showElement(nodeBExtraText);
          HelperFunctions.showElement(nodeCExtraText);

          nodeATermText.innerHTML = 'Term: 1';
          nodeBTermText.innerHTML = 'Term: 1';
          nodeCTermText.innerHTML = 'Term: 1';

          nodeAExtraText.innerHTML = '(k, V1)';
          nodeBExtraText.innerHTML = '(k, V1)';
          nodeCExtraText.innerHTML = '(k, V1)';
          this.animationState = ANIMATION_STATE_LEADER_READS_PROTOCOL;
          resolve({
            animationState: this.animationState,
            delay: 1000,
          });
				});
				break;
      }
      case ANIMATION_STATE_LEADER_REPLICATES_LEASE: {
        // Undo phase
        HelperFunctions.hideElement(nodeCMessageBubble);
        document.getElementById('node-c-message-status-text1').innerHTML = '';
        document.getElementById('node-c-message-status-text2').innerHTML = '';
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-c'));

        // Redo phase
        this.changeMainText('Using leader leases to safely perform reads from the leader..', () => {
          this.animationState = ANIMATION_STATE_START_LEADER_LEASE;
          resolve({
            animationState: this.animationState,
            delay: 1000,
          });
        });
        break;
      }
      case ANIMATION_STATE_LEADER_LEASE_DURATION: {
        // Undo phase
        HelperFunctions.hideElement(document.getElementById('llease-rectnode-a'));
        HelperFunctions.hideElement(document.getElementById('llease-rectnode-b'));
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerHTML = '';

        // Redo phase
        this.changeMainText('');
        HelperFunctions.showElement(nodeCMessageBubble);
        HelperFunctions.showElement(nodeCMessageStatus);
        const statusText1 = document.getElementById('node-c-message-status-text1');
        statusText1.innerHTML = '';
        const statusText2 = document.getElementById('node-c-message-status-text2');
        statusText2.innerHTML = '';

        const contentLine1 = {
          index: 0,
          str: 'Raft leader starts a'
        }
        const contentLine2 = {
          index: 0,
          str: 'new lease timer for itself.'
        }
        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 600,
          update: function() {
            statusText1.textContent = contentLine1.str.substr(0, contentLine1.index);
          },
          complete: () => {
            anime({
              targets: contentLine2,
              index: contentLine2.str.length,
              easing: 'linear',
              duration: 600,
              update: function() {
                statusText2.textContent = contentLine2.str.substr(0, contentLine2.index);
              },
              complete: () => {
                this.timersAreActive = true;
                this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, ORIGINAL_LEADER_INITIAL_DURATION, 90, true);
                this.nodeCTimerAnimation.play();
                this.animationState = ANIMATION_STATE_LEADER_REPLICATES_LEASE;
                resolve({
                  animationState: this.animationState,
                  delay: 100,
                  asyncAnimation: true,
                });
              }
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED: {
        this.changeMainText('');
        // this.changeMainText('Leader replicates a lease interval to followers', () => {
        HelperFunctions.hideElement(nodeCMessageBubble);
        HelperFunctions.hideElement(nodeCMessageStatus);
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));
        const textAlt = document.getElementById('node-c-message-text-alt');
        var leaseToA = document.getElementById('node-c-lease-to-node-a');
        const content = {
          index: 0,
          str: 'Raft leader then replicates a\nlease interval to followers. Note\nthe lease timer on C has started\nbefore replicating to A and B.'
        };

        var nodeCTextAnimation = anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2500,
          update: function() {
            textAlt.innerText = content.str.substr(0, content.index);
          }
        });
        var nodeALeaseAnimation = anime({
          targets: leaseToA,
          translateX: -280,
          translateY: 0,
          easing: 'linear',
          duration: 1500,
          begin: () => {
            HelperFunctions.showElement(leaseToA);
          },
          complete: () =>{
            HelperFunctions.hideElement(leaseToA);
            leaseToA.style.transform = 'none';
          },
        });

        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, 5000, 60);
        this.nodeCTimerAnimation.restart();
        var leaseToB = document.getElementById('node-c-lease-to-node-b');
        var nodeBLeaseAnimation = anime({
          targets: leaseToB,
          translateX: -150,
          translateY: -280,
          easing: 'linear',
          duration: 1500,
          begin: () => {
            HelperFunctions.showElement(leaseToB);
          },
          complete: () =>{
            HelperFunctions.hideElement(leaseToB);
            leaseToB.style.transform = 'none';
          },
        });
        Promise.all([nodeCTextAnimation.finished, nodeALeaseAnimation.finished,nodeBLeaseAnimation.finished, this.nodeCTimerAnimation]).then(() => {
          this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, 3000, 85);
          this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, 3000, 90);
          console.log(this.nodeBTimerAnimation);
          this.nodeATimerAnimation.restart();
          this.nodeBTimerAnimation.restart();
          
          this.animationState = ANIMATION_STATE_LEADER_LEASE_DURATION;
          resolve({
            animationState: this.animationState,
            delay: 1000,
            asyncAnimation: true
          });
        });
        break;
      }
      case ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED: {
        this.changeMainText('');
        HelperFunctions.hideElement(document.getElementById('node-c-partition-wrap'));
        this.changeMainText('Any new leader must wait out existing Leader Lease duration before acquiring lease.', () => {
          this.animationState = ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED;
          resolve({
            animationState: this.animationState,
            delay: 1000,
          });
        });
        break;
      }
      case ANIMATION_STATE_CLIENT_UPDATE_FAILS: {
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
        HelperFunctions.hideElement(nodeAMessageBubble);
        HelperFunctions.hideElement(document.getElementById('node-c-partition-wrap'));
        HelperFunctions.hideElement(document.getElementById('node-a-message-status-bg'));
        document.getElementById('node-a-message-status').innerHTML = '';
        var nodeA = document.getElementById('node-a-circle');
        nodeA.classList.remove('leader-candidate-node');
        this.changeMainText('Now suppose the original leader gets network partitioned', () => {
          // partition original leader
					HelperFunctions.partitionNodeC();
          this.animationState = ANIMATION_STATE_NEW_LEADER_CANDIDATE_ELECTED;
          resolve({
            animationState: this.animationState,
            delay: 100,
          });
        });
        break;
      }
      case ANIMATION_STATE_OLD_LEADER_STILL_READABLE: {
        let nodeA = document.getElementById('node-a-circle');
        nodeA.classList.remove('leader-candidate-node');
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(clientQueryMessage);
        document.getElementById('client-query-message-text1').innerHTML = '';
        document.getElementById('client-query-message-text2').innerHTML = '';
        document.getElementById('client-query-message-text3').innerHTML = '';
        HelperFunctions.hideElement(document.getElementById('client-node'));
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
        document.getElementById('client-message-text').innerHTML = '';

        this.changeMainText('');
        HelperFunctions.showElement(nodeAMessageBubble);
        HelperFunctions.showElement(document.getElementById('node-a-message-status-bg'));
        const nodeAContent = {
          index: 0,
          str: 'A wins new leader election\n but cannot perform any\noperations until Leader\nLease on A runs out.'
        };

        anime({
          targets: nodeAContent,
          index: nodeAContent.str.length,
          easing: 'linear',
          duration: 1500,
          update: function() {
            nodeAMessageStatus.innerText = nodeAContent.str.substr(0, nodeAContent.index);
          },
          complete: () => {
            // elect Node A as new leader candidate
            var nodeA = document.getElementById('node-a-circle');
            nodeA.classList.add('leader-candidate-node');
            HelperFunctions.setSVGText({targetId: 'node-a-term-text', text: "Term: 2"});
            HelperFunctions.setSVGText({targetId: 'node-b-term-text', text: "Term: 2"});
            HelperFunctions.showElement(nodeATermHighlight);
            HelperFunctions.showElement(nodeBTermHighlight);
            this.animationState = ANIMATION_STATE_CLIENT_UPDATE_FAILS;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
				});
        break;
      }
      case ANIMATION_STATE_OLD_LEASE_EXPIRES: {
        clientMessageStatus.innerHTML = '';
        HelperFunctions.hideElement(clientMessageBubble);
        HelperFunctions.hideElement(document.getElementById('client-node'));
        document.getElementById('client-message-text').innerHTML = '';
        document.getElementById('client-query-message-text1').innerHTML = '';
        document.getElementById('client-query-message-text2').innerHTML = '';
        document.getElementById('client-query-message-text3').innerHTML = '';
				this.changeMainText('If client tries to write to A, operation is rejected..', () => {
          HelperFunctions.introduceClient();
          HelperFunctions.showElement(clientMessageBubble);
          HelperFunctions.showElement(clientMessageBackground);
          HelperFunctions.showElement(clientQueryMessage);
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
                      var messageContrainerElement = document.getElementById('client-message');
                      var messageElement = document.getElementById('client-message-circle');
                      HelperFunctions.messageFromClient(Constants.NODE_A,	{
                        onBegin: () => {
                          HelperFunctions.showElement(messageContrainerElement);
                          messageElement.classList.add('log-message');
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                        },
                        onChangeComplete: () => {
                          messageElement.classList.remove('log-message');
                          messageElement.classList.add('error-message');
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: 'Rejected'});
                          // messageTextElement
                        },
                        onComplete: () => {
                          messageElement.classList.remove('error-message');
                          HelperFunctions.hideElement(messageContrainerElement);
                          messageContrainerElement.style.transform = 'none';
                          HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                          HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
                        },
                        alternate: true,
                      });
                      this.animationState = ANIMATION_STATE_OLD_LEADER_STILL_READABLE;
                      resolve({
                        animationState: this.animationState,
                        delay: 100,
                      });
                    }
                  });
                }
              });
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_NEW_LEADER_ELECTED: {
        this.changeMainText('');
        HelperFunctions.hideElement(document.getElementById('client-query-message'));
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerHTML = '';
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.add('leader-node');

        const contentLine1 = {
          index: 0,
          str: 'Client can still read from C and get a valid response. Writes, however, are unavailable at this moment.'
        };

        HelperFunctions.showElement(clientMessageBubble);

        anime({
          targets: contentLine1,
          index: contentLine1.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            clientMessageStatus.textContent = contentLine1.str.substr(0, contentLine1.index);
          },
          complete: () => {
            this.animationState = ANIMATION_STATE_OLD_LEASE_EXPIRES;
            resolve({
              animationState: this.animationState,
              delay: 100,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_NEW_LEADER_SENT_LEASES: {
        HelperFunctions.hideElement(document.getElementById('node-a-timer-highlight'));
        HelperFunctions.hideElement(document.getElementById('node-a-message-bubble'));
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.add('leader-node');
        let nodeA = document.getElementById('node-a-circle');
        nodeA.classList.add('leader-candidate-node');
        HelperFunctions.hideElement(nodeAMessageBubble);
        document.getElementById('node-a-message-status').innerHTML = '';
        HelperFunctions.hideElement(clientMessageBubble);
        document.getElementById('client-message-status').innerHTML = '';
        HelperFunctions.showElement(document.getElementById('node-c-message-bubble-alt'));
        const nodeCTextAlt = document.getElementById('node-c-message-text-alt');
        const content = {
          index: 0,
          str: 'Leader Lease of C will run out\nfirst [since it started first]. \nC now steps down as leader.'
        };
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-a'));
        this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, 6000, 25);
        this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, 6000, 30);
        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, 6000);

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            nodeCTextAlt.textContent = content.str.substr(0, content.index);
          },
        });
        this.nodeCTimerAnimation.finished.then(() => {
          var nodeC = document.getElementById('node-c-circle');
          nodeC.classList.remove('leader-node');
          this.animationState = ANIMATION_STATE_NEW_LEADER_ELECTED;
          resolve({
            animationState: this.animationState,
            delay: 100,
            asyncAnimation: true
          });
        });
        break;
      }
      case ANIMATION_STATE_LEADER_LEASE_CONCLUSION: {
        HelperFunctions.hideElement(nodeAExtraHighlight);
        HelperFunctions.hideElement(nodeBExtraHighlight);
        HelperFunctions.hideElement(clientMessageBubble);
        let nodeA = document.getElementById('node-a-circle');
        nodeA.classList.add('leader-candidate-node');
        nodeA.classList.remove('leader-node');
        document.getElementById('client-message-status').innerHTML = '';
        HelperFunctions.hideElement(document.getElementById('node-c-message-bubble-alt'));
        document.getElementById('node-c-message-text-alt').innerHTML = '';

        HelperFunctions.showElement(document.getElementById('node-a-message-bubble'));
        HelperFunctions.showElement(document.getElementById('node-a-message-status-bg'));
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-a'));
        const nodeAMessage = document.getElementById('node-a-message-status');
        const content = {
          index: 0,
          str: 'Once Leader Lease on A expires, it becomes raft leader.'
        };

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 800,
          update: function() {
            nodeAMessage.textContent = content.str.substr(0, content.index);
          },
          complete: () => {
            this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, 10000);
            this.nodeATimerAnimation.finished.then(() => {
              nodeA.classList.remove('leader-candidate-node');
              nodeA.classList.add('leader-node');
              HelperFunctions.showElement(document.getElementById('node-a-timer-highlight'));

              // hide Node A's leader lease timer
              HelperFunctions.hideElement(document.getElementById(HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)));

              // and start its my lease timer
              this.nodeATimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_A, 5000, 50);

              // then send leader lease message to B
              var leaseToB = document.getElementById('node-a-lease-to-node-b');
              anime({
                targets: leaseToB,
                translateX: 150,
                translateY: -280,
                easing: 'linear',
                duration: 1500,
                begin: () => {
                  HelperFunctions.showElement(leaseToB);
                },
                complete: () => {
                  HelperFunctions.hideElement(leaseToB);
                  leaseToB.style.transform = 'none';

                  this.nodeBTimerAnimation.restart();
                  this.animationState = ANIMATION_STATE_NEW_LEADER_SENT_LEASES;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                },
              });
            })
          }
        });

        break;
      }
      case Constants.ANIMATION_STATE_FINISHED: {
        this.setState({animationFinished: false});
        this.changeMainText('');
        document.getElementById('node-a-message-status').innerHTML = '';
        HelperFunctions.showElement(document.getElementById('client-message-status-bg'));
        HelperFunctions.showElement(clientMessageBubble);
        const messageStatus = document.getElementById('client-message-status');

        const content = {
          index: 0,
          str: 'From here on, client can issue reads/writes to the new leader.'
        }

        anime({
          targets: content,
          index: content.str.length,
          easing: 'linear',
          duration: 2000,
          update: function() {
            messageStatus.textContent = content.str.substr(0, content.index);
          },
          complete: () => {
            // initiate a raft round
            
            // client message to A
            var animation = HelperFunctions.sendLogMessage(Constants.CLIENT_NODE, Constants.NODE_A, false, false, '(k, V2)');

            animation.finished.then(() => {
              // message with ack from A to B
              nodeAExtraText.innerHTML = '(k, V2)';
              var messageToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, true, false, '(k, V2)', false, 0, this.nodeBTimerAnimation, this.nodeATimerAnimation);

              messageToBAnimation.finished.then(() => {
                nodeBExtraText.innerHTML = '(k, V2)';
                HelperFunctions.hideElement(nodeAExtraText2);
                HelperFunctions.showElement(nodeAExtraHighlight);
                // confirmation message back to B and the client
                var confirmToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE, false, false, '', true);
                var confirmToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, false, '', true, 300, this.nodeBTimerAnimation);

                Promise.all([confirmToClientAnimation.finished, confirmToBAnimation.finished]).then(() => {
                  HelperFunctions.hideElement(nodeBExtraText2);
                  nodeBExtraText.innerHTML = '(k, V2)';
                  HelperFunctions.showElement(nodeBExtraHighlight);
                  this.animationState = ANIMATION_STATE_LEADER_LEASE_CONCLUSION;
                  this.stopTimers();
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                });
              });
            });
          }
        });
        this.animationState = ANIMATION_STATE_LEADER_LEASE_CONCLUSION;
        resolve({
          animationState: this.animationState,
          delay: 100,
        });
        break;
      }
      default:
        console.error('Unrecognized state: ' + this.animationState);
        break;
    }
  }

	changeMainText(text, onComplete, delay) {
		HelperFunctions.setTextWithAnimation(this.mainTextSect, text, onComplete, delay);
	}
	restartTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.restart();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.restart();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.restart();
		}
	}
	stopTimers() {
		this.timersAreActive = false;
		this.pauseTimers();
	}
	pauseTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.pause();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.pause();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.pause();
		}
	}
	resumeTimers() {
		if (this.nodeATimerAnimation) {
			this.nodeATimerAnimation.play();
		}
		if (this.nodeBTimerAnimation) {
			this.nodeBTimerAnimation.play();
		}
		if (this.nodeCTimerAnimation) {
			this.nodeCTimerAnimation.play();
		}
	}

	render() {
		return(
			<div>
				<div id="main-diagram" >
					<MainDiagram/>
				</div>
				<div id="main-text-sect">
				</div>
			</div>
		)
	}
}

export default LeaderLeaseAnimation;
