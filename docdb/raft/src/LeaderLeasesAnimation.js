
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

		switch(this.animationState) {
			case Constants.ANIMATION_STATE_INITIAL: {
				//////////////////// initial setup ////////////////////

				// hide all outer circles (TODO: revisit this approach)
				var nodeOuterCircles = document.getElementsByClassName('node-outer-circle');
				for (var i = 0; i < nodeOuterCircles.length; i++){
					HelperFunctions.hideElement(nodeOuterCircles[i]);
				}
				
				//////////////////////////////////////////////////////
				this.changeMainText('Let\'s say we have a 3-node Raft group.<br />C is the Raft leader, all nodes have data <br />k = V1', () => {
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
        this.changeMainText('This sequence shows how to safely perform reads from the leader using leader leases.', () => {
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
        const status = document.getElementById('node-c-message-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Raft leader stats a new lease timer for itself.');
          },
          complete: () => {
            this.timersAreActive = true;
            this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, {
              duration: ORIGINAL_LEADER_INITIAL_DURATION,
              targetPercent: 90,
              disableAutoPlay: true,
            });
            this.nodeCTimerAnimation.play();
            this.animationState = ANIMATION_STATE_LEADER_REPLICATES_LEASE;
            resolve({
              animationState: this.animationState,
              delay: 100,
              asyncAnimation: true,
            });
          }
        });
        break;
      }
			case ANIMATION_STATE_LEADER_REPLICATES_LEASE: {
        this.nodeCTimerAnimation.seek(0);
        HelperFunctions.destroyNodeCMessage();
        var leaseToA = document.getElementById('node-c-lease-to-node-a');
        const leaderStatus = document.getElementById('node-c-message-text');

        var nodeCTextAnimation = anime({
          targets: leaderStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Raft leader then replicates a lease interval to followers. Note the lease timer on C has started before replicating to A and B.');
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

        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, {
          duration: LEADER_REPLICATION_DURATION,
          targetPercent: 60,
          startPercent: 90,
        });

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
        Promise.all([nodeCTextAnimation.finished, nodeALeaseAnimation.finished, nodeBLeaseAnimation.finished, this.nodeCTimerAnimation]).then(() => {
          this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
            duration: ORIGINAL_LEADER_INITIAL_DURATION,
            targetPercent: 85
          });
          this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
            duration: ORIGINAL_LEADER_INITIAL_DURATION,
            targetPercent: 90
          });

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
        HelperFunctions.destroyNodeCMessage();
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
        const nodeAContent = document.getElementById('node-a-message-text');
        anime({
          targets: nodeAContent,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('A wins new leader election but cannot perform any operations until Leader Lease on A runs out.');
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
        HelperFunctions.destroyNodeAMessage();
        HelperFunctions.hideElement(nodeATermHighlight);
        HelperFunctions.hideElement(nodeBTermHighlight);
				this.changeMainText('If client tries to write to A, operation is rejected...', () => {
          HelperFunctions.introduceClient();
          const clientStatus = document.getElementById('client-status-text');

          anime({
            targets: clientStatus,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createClientMessage('UPDATE T SET value = V2 WHERE <br>key = k', true);
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
                },
                onComplete: () => {
                  messageElement.classList.remove('error-message');
                  HelperFunctions.hideElement(messageContrainerElement);
                  messageContrainerElement.style.transform = 'none';
                  HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                  HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
                  document.getElementById('client-node-value-error-header').innerHTML = 'Query Rejected:';
                  document.getElementById('client-node-value-error-subtitle').innerHTML = 'Old leader still has lease';
                  this.animationState = ANIMATION_STATE_OLD_LEADER_STILL_READABLE;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                },
                alternate: true,
              });
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_OLD_LEADER_STILL_READABLE: {
        this.changeMainText('');
        HelperFunctions.destroyClientMessage();
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));
        const clientStatus = document.getElementById('client-status-text');
        anime({
          targets: clientStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('Client can still read from C and get a valid response. Writes, however, are unavailable at this moment.')
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
        HelperFunctions.destroyClientMessage();
        const nodeCStatus = document.getElementById('node-c-message-text');
        this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
          duration: 6000,
          startPercent: 85,
          targetPercent: 35,
         });
        this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
          duration: 6000,
          startPercent: 90,
          targetPercent: 40,
         });
        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, {
          duration: 6000,
          startPercent: 60,
        });

        anime({
          targets: nodeCStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Leader Lease of C will run out first (since it started first). C now steps down as leader.');
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
        HelperFunctions.destroyNodeCMessage();
        const status = document.getElementById('node-a-message-text');

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('Once Leader Lease on A expires, it becomes Raft leader.');
          },
          complete: () => {
            this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
              duration: 2500,
              startPercent: 35,
            });
            this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
              duration: 2500,
              targetPercent: 20,
              startPercent: 40,
              disableAutoPlay: true
            });
            this.nodeBTimerAnimation.play();
            this.nodeATimerAnimation.finished.then(() => {
              var nodeA = document.getElementById('node-a-circle');
              HelperFunctions.showElement(document.getElementById('node-a-timer-highlight'));
              nodeA.classList.remove('leader-candidate-node');
              nodeA.classList.add('leader-node');
    
              // hide Node A's leader lease timer
              HelperFunctions.hideElement(document.getElementById(HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)));
    
              // and start its my lease timer
              this.nodeATimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_A, {
                duration: 3000,
                targetPercent: 60,
               });
    
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
    
                  this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
                    duration: 2500,
                    targetPercent: 80,
                  });
                  this.animationState = ANIMATION_STATE_NEW_LEADER_SENT_LEASES;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                    asyncAnimation: true
                  });
                },
              });
            });
          }
        });        
				break;
			}
			case ANIMATION_STATE_NEW_LEADER_SENT_LEASES: {
        HelperFunctions.destroyNodeAMessage();
        HelperFunctions.hideElement(document.getElementById('node-a-timer-highlight'));
        const clientStatus = document.getElementById('client-message-status');
        anime({
          targets: clientStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('From here on, client can issue reads/writes to the new leader.');
          },
          complete: () => {
            // initiate a Raft round
            this.nodeATimerAnimation.restart();
   
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
                let newBTimer = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
                  duration: 2500,
                  startPercent: 100,
                  targetPercent: 80
                });
                // confirmation message back to B and the client
                var confirmToClientAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.CLIENT_NODE, false, false, '', true);
                var confirmToBAnimation = HelperFunctions.sendLogMessage(Constants.NODE_A, Constants.NODE_B, false, false, '', true, 300, newBTimer);

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
        HelperFunctions.destroyClientMessage();
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
				this.changeMainText('Let\'s say we have a 3-node Raft group.<br />C is the Raft leader, all nodes have data <br />k = V1', () => {
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
        HelperFunctions.destroyNodeCMessage();
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-c'));

        // Redo phase
        this.changeMainText('This sequence shows how to safely perform reads from the leader using leader leases.', () => {
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
        HelperFunctions.hideElement(document.getElementById('llease-rect-node-a'));
        HelperFunctions.hideElement(document.getElementById('llease-rect-node-b'));;
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-c'));
        HelperFunctions.destroyNodeCMessage();

        // Redo phase
        this.changeMainText('');
        const nodeCStatus = document.getElementById('node-c-message-text')

        anime({
          targets: nodeCStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Raft leader starts a new lease timer for itself.');
          },
          complete: () => {
            this.timersAreActive = true;
            HelperFunctions.startMyLeaseTimer(Constants.NODE_C, {
              duration: ORIGINAL_LEADER_INITIAL_DURATION,
              targetPercent: 90,
            });
            this.animationState = ANIMATION_STATE_LEADER_REPLICATES_LEASE;
            resolve({
              animationState: this.animationState,
              delay: 100,
              asyncAnimation: true,
            });
          }
        });
        break;
      }
      case ANIMATION_STATE_ORIGINAL_LEADER_PARITIONED: {
        this.changeMainText('');
        // this.changeMainText('Leader replicates a lease interval to followers', () => {
        HelperFunctions.destroyNodeCMessage();
        HelperFunctions.hideElement(document.getElementById('llease-rect-node-a'));
        HelperFunctions.hideElement(document.getElementById('llease-rect-node-b'));

        var leaseToA = document.getElementById('node-c-lease-to-node-a');
        const content = document.getElementById('node-c-message-text');

        var nodeCTextAnimation = anime({
          targets: content,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Raft leader then replicates a lease interval to followers. Note the lease timer on C has started before replicating to A and B.')
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

        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, {
          duration: 5000,
          targetPercent: 60,
          startPercent: 90,
        });
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
          this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
            duration: 3000,
            targetPercent: 85
          });
          this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
            duration: 3000,
            targetPercent: 90
          });
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
        HelperFunctions.hideElement(document.getElementById('node-c-partition-wrap'));
        HelperFunctions.destroyNodeAMessage();
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
        HelperFunctions.destroyNodeAMessage();
        HelperFunctions.destroyClientMessage();
        HelperFunctions.hideElement(document.getElementById('client-node'));
        HelperFunctions.hideElement(document.getElementById('client-message-circle'));
        document.getElementById('client-message-text').innerHTML = '';
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));

        this.changeMainText('');
        const nodeAContent = document.getElementById('node-a-message-text');

        anime({
          targets: nodeAContent,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('A wins new leader election but cannot perform any operations until Leader Lease on A runs out.');
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
        HelperFunctions.destroyClientMessage();
        document.getElementById('client-message-text').innerHTML = '';

				this.changeMainText('If client tries to write to A, operation is rejected...', () => {
          HelperFunctions.introduceClient();
          const clientStatus = document.getElementById('client-status-text');
          anime({
            targets: clientStatus,
            opacity: [0, 1],
            easing: 'linear',
            duration: 1200,
            begin: function() {
              HelperFunctions.createClientMessage('UPDATE T SET value = V2 WHERE <br>key = k', true);
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
                },
                onComplete: () => {
                  messageElement.classList.remove('error-message');
                  HelperFunctions.hideElement(messageContrainerElement);
                  messageContrainerElement.style.transform = 'none';
                  HelperFunctions.setSVGText({targetId: 'client-message-text', text: ''});
                  HelperFunctions.showElement(document.getElementById('client-node-value-alt'));
                  this.animationState = ANIMATION_STATE_OLD_LEADER_STILL_READABLE;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                  });
                },
                alternate: true,
              });
              
            }
          });
        });
        break;
      }
      case ANIMATION_STATE_NEW_LEADER_ELECTED: {
        this.changeMainText('');
        HelperFunctions.destroyNodeCMessage();
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.add('leader-node');
        HelperFunctions.hideElement(document.getElementById('client-node-value-alt'));

        const clientStatus = document.getElementById('client-status-text');
        anime({
          targets: clientStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('Client can still read from C and get a valid response. Writes, however, are unavailable at this moment.')
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
        HelperFunctions.destroyNodeAMessage();
        let nodeC = document.getElementById('node-c-circle');
        nodeC.classList.add('leader-node');
        let nodeA = document.getElementById('node-a-circle');
        nodeA.classList.add('leader-candidate-node');
        
        const nodeCStatus = document.getElementById('node-c-message-text');
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-a'));
        this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
          duration: 6000,
          targetPercent: 35
        });
        this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
          duration: 6000,
          targetPercent: 40
        });
        this.nodeCTimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_C, { duration: 6000 });

        anime({
          targets: nodeCStatus,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeCMessage('Leader Lease of C will run outfirst (since it started first). C now steps down as leader.');
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
        HelperFunctions.destroyClientMessage();
        let nodeA = document.getElementById('node-a-circle');
        nodeA.classList.add('leader-candidate-node');
        nodeA.classList.remove('leader-node');

        const status = document.getElementById('node-a-message-text');
        HelperFunctions.hideElement(document.getElementById('mlease-rect-node-a'));

        anime({
          targets: status,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createNodeAMessage('Once Leader Lease on A expires, it becomes Raft leader.');
          },
          complete: () => {
            this.nodeATimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_A, {
              duration: 2500,
              startPercent: 35,
            });
            this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
              duration: 2500,
              targetPercent: 20,
              startPercent: 40,
            });
            this.nodeATimerAnimation.finished.then(() => {
              nodeA.classList.remove('leader-candidate-node');
              nodeA.classList.add('leader-node');
              HelperFunctions.showElement(document.getElementById('node-a-timer-highlight'));

              // hide Node A's leader lease timer
              HelperFunctions.hideElement(document.getElementById(HelperFunctions.leaderLeaseTimerId(Constants.NODE_A)));

              // and start its my lease timer
              this.nodeATimerAnimation = HelperFunctions.startMyLeaseTimer(Constants.NODE_A, {
                duration: 3000,
                targetPercent: 60
              });

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

                  this.nodeBTimerAnimation = HelperFunctions.startLeaderLeaseTimer(Constants.NODE_B, {
                    duration: 2500,
                    targetPercent: 80
                  });
                  this.animationState = ANIMATION_STATE_NEW_LEADER_SENT_LEASES;
                  resolve({
                    animationState: this.animationState,
                    delay: 100,
                    asyncAnimation: true
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
        const content = document.getElementById('client-status-text');

        anime({
          targets: content,
          opacity: [0, 1],
          easing: 'linear',
          duration: 1200,
          begin: function() {
            HelperFunctions.createClientMessage('From here on, client can issue reads/writes to the new leader.');
          },
          complete: () => {
            // initiate a Raft round
            
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
