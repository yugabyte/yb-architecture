import anime from 'animejs/lib/anime.es.js';

import {Constants} from './constants';
import {clientNodePositions} from './svg/MainDiagram';


// Set text content of a SVG text element
// params:{
//	targetId:
//	text:
//	addCSSClass:
//	showElement:
//}
export function setSVGText(params) {
	var target = document.getElementById(params.targetId);
	if (params.text) {
		target.textContent = params.text;
	}
	if (params.addCSSClass) {
		target.classList.add(params.addCSSClass);
	}
	if (params.removeCSSClass) {
		target.classList.remove(params.removeCSSClass);
	}
	if (params.showElement) {
		showElement(target);
	}
}

export function showElement(element) {
	element.classList.remove('visibility-hidden');
	element.classList.add('visibility-visible');
}

export function hideElement(element){
	element.classList.remove('visibility-visible');
	element.classList.add('visibility-hidden');
}

export function delayedNext(animation, delay) {
	if (!delay) {
		delay = Constants.DEFAULT_DELAY;
	}
	setTimeout(() => animation.next(), delay);
}

export function setTextWithAnimation(textSect, text, onComplete, delay) {
	textSect.innerHTML=text;

	var ml4 = {};
	ml4.opacityIn = [0,1];
	ml4.scaleIn = [0.2, 1];
	ml4.scaleOut = 3;
	ml4.durationIn = 2000;
	ml4.durationOut = 2000;
	ml4.delay = (delay?delay:500);

	anime({
		targets: textSect,
		opacity: ml4.opacityIn,
		scale: ml4.scaleIn,
		duration: ml4.durationIn,
		complete: onComplete,
		delay: ml4.delay,
	});
}
///////////////////////////////////////////////////////////////
//Animation Helpers. TODO: Maybe they should go in AnimationHelper module?
//////////////////////////////////////////////////////////////

export function introduceClient(clientTextValue) {
	var clientNode = document.getElementById("client-node");
	if (clientTextValue) {
		setSVGText({targetId: "client-node-main-text", text: clientTextValue})
	}
	var animation = anime({
		targets: clientNode,
		translateY: -84
	});
	return animation;
}


export function messageFromClient(destination, params) {
	var messageElement = document.getElementById('client-message');
	var translateX = 0;
	var translateY = 0;

	switch (destination) {
		case Constants.NODE_C: {
			translateX = 100;
			translateY = -120;
			break;
		}
		case Constants.NODE_A: {
			translateX = -160;
			translateY = -156;
			break;
		}
		default: {
			console.log('messageFromClient: Unrecognized destination: ' + destination);
			return;
		}
	}

	var animation = anime({
		targets: messageElement,
		translateX: translateX,
		translateY: translateY,
		easing: 'linear',
		duration: 800,
		begin: params.onBegin,
		complete: params.onComplete,
		changeComplete: params.onChangeComplete,
		direction: params.alternate?'alternate':'normal',
	});
	return animation;
}

export function sendLogMessage(fromNode, toNode, withAck, value, commitValue, delay, destinationTimerAnimation, srcTimerAnimation) {
	console.log('FromNode: ' + fromNode + " toNode: " + toNode + " withAck: " + withAck + " value: " + value + " commitValue: " + commitValue);
	var method = null;
	var messageElement = null;
	var textElementId = null;
	var sourceNodeTextElementId = null;
	var messageContrainer = null;
	var additionalTextElementID = null;
	var sourceNodeAdditionalTextElementId = null;

	switch(fromNode) {
		case Constants.NODE_A: {
			method = messageFromA;
			sourceNodeTextElementId = 'node-a-extra-text';
			sourceNodeAdditionalTextElementId = 'node-a-extra-text2';

			if(toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-a-message-to-b');
				textElementId = 'node-b-extra-text';
				additionalTextElementID = 'node-b-extra-text2';
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-a-message-to-client');
			}
			break;
		}
		case Constants.NODE_C: {
			method = messageFromC;
			sourceNodeTextElementId = 'node-c-extra-text';
			sourceNodeAdditionalTextElementId = 'node-c-extra-text2';

			if (toNode == Constants.NODE_A) {
				messageElement = document.getElementById('node-c-message-to-a');
				textElementId = 'node-a-extra-text';
				additionalTextElementID = 'node-a-extra-text2';
			} else if (toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-c-message-to-b');
				textElementId = 'node-b-extra-text';
				additionalTextElementID = 'node-b-extra-text2';
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-c-message-to-client');
			}
			break;
		}
		case Constants.CLIENT_NODE: {
			method = messageFromClient;
			messageElement = document.getElementById('client-message-circle');
			messageContrainer = document.getElementById('client-message');

			if (toNode == Constants.NODE_A) {
				textElementId = 'node-a-extra-text';
				additionalTextElementID = 'node-a-extra-text2';
			} else if (toNode == Constants.NODE_B) {
				textElementId = 'node-b-extra-text';
				additionalTextElementID = 'node-b-extra-text2';
			} else if (toNode == Constants.NODE_C) {
				textElementId = 'node-c-extra-text';
				additionalTextElementID = 'node-c-extra-text2';
			}
			break;
		}
		default: {
			throw new Error('Unrecognized fromNode: ' + fromNode);
		}
	}

	var animation = method(toNode,{
			delay: delay,
			destinationTimerAnimation: destinationTimerAnimation,
			onBegin: anim => {
				showElement(messageElement);
				messageElement.classList.add('log-message')
			},
			onChangeComplete: anim => {
				console.log('In onChangeComplete. messageElement: ' + messageElement);
				if (destinationTimerAnimation) {
					console.log('Will restart timer animation');
					destinationTimerAnimation.restart();
				}

				if (withAck) {
					messageElement.classList.remove('log-message');
					messageElement.classList.add('log-message-ack');
				}

				var additionalText = null;
				if (value && textElementId){
					var addCSSClass = "";
					var removeCSSClass = "";
					if (commitValue) {
						addCSSClass = "set-text-committed";
						removeCSSClass = "set-text-uncommitted";
						additionalText = Constants.COMMITED;
					} else {
						addCSSClass = "set-text-uncommitted";
						removeCSSClass = "set-text-committed";
						additionalText = Constants.UNCOMMITED;
					}

					setSVGText({
						targetId: textElementId,
						text: value,
						addCSSClass: addCSSClass,
						removeCSSClass:removeCSSClass,
						showElement: true,
					});

					console.log('additionalText: ' + additionalText + 'additionalTextElementID: ' + additionalTextElementID);
					if (additionalText != null && additionalTextElementID){
						console.log('will update additionalText');
						setSVGText({
							targetId: additionalTextElementID,
							text: additionalText,
							addCSSClass: addCSSClass,
							removeCSSClass:removeCSSClass,
							showElement: true,
						});
					}
				}
			},
			onComplete: anim => {
				if (withAck) {
					messageElement.classList.remove('log-message-ack');
					// we got the ack back so uncommited text should be shown as commited now
					if (value && sourceNodeTextElementId) {
						setSVGText({targetId: sourceNodeTextElementId, addCSSClass: "set-text-committed"});
					}
					if (value && sourceNodeAdditionalTextElementId){
						setSVGText({targetId: sourceNodeAdditionalTextElementId, text: Constants.COMMITED, addCSSClass: "set-text-committed"});
					}
				}
				if (srcTimerAnimation) {
					srcTimerAnimation.restart();
				}
				messageElement.style.transform = 'none';
				if (messageContrainer) {
					messageContrainer.style.transform = 'none';
				}

			},
			alternate: withAck,
		});
	return animation;
}

export function logMessageFromLeaderToFollowers(withAck, value, commitValue, delay, nodeATimerAnimation, nodeBTimerAnimation, nodeCTimerAnimation) {
	var nodeAAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_A, withAck, value, commitValue, delay,nodeATimerAnimation, nodeCTimerAnimation);

	// message to Node B
	// var messageToB = document.getElementById('node-c-message-to-b');
	var nodeBAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_B, withAck, value, commitValue, delay, nodeBTimerAnimation, nodeCTimerAnimation);

	return [nodeAAnimation,nodeBAnimation];
}
export function getFinishPromises(animations) {
	var animationPromises = [];
	animations.forEach(currentAnimation => {
		animationPromises.push(currentAnimation.finished);
	});
	return animationPromises;
}

export function messageFromC(destination, params) {
	var translateX = 0;
	var translateY = 0;
	var targets = "";
	if (destination == Constants.NODE_B) {
		translateX = -132;
		translateY = -290;
		targets = '#node-c-message-to-b';
	} else if (destination == Constants.NODE_A) {
		targets = '#node-c-message-to-a';
		translateX = -270;
	} else if (destination == Constants.CLIENT_NODE) {
		targets = '#node-c-message-to-client';
		translateX = -100;
		translateY = 130;
	}

	var animation = anime({
		targets: targets,
		translateX: translateX,
		translateY: translateY,
		easing: 'linear',
		duration: 1000,
		direction: params.alternate?'alternate':'normal',
		begin: params.onBegin,
		changeComplete: params.onChangeComplete,
		complete: params.onComplete,
		delay: params.delay?params.delay:0
	});
	return animation;
}

export function messageFromA(destination, params) {
	var translateX = 0;
	var translateY = 0;
	var targets = "";
	if (destination == Constants.NODE_B) {
		translateX = 160;
		translateY = -290;
		targets = '#node-a-message-to-b';
	}
	else if (destination == Constants.CLIENT_NODE) {
		translateX = 150;
		translateY = 148;
		targets = '#node-a-message-to-client';
	}
	else {
		console.warning('Unsupported destination: ' + destination);
		return;
	}


	var animation = anime({
		targets: targets,
		translateX: translateX,
		translateY: translateY,
		easing: 'linear',
		duration: 1000,
		direction: (params.alternate?'alternate':'normal'),
		begin: params.onBegin,
		changeComplete: params.onChangeComplete,
		complete: params.onComplete,
		delay: params.delay?params.delay:0
	});
	return animation;
}

export function getSetValueText(value) {
	return "Value: " + value;
}

export function partitionNodeC() {
	var nodeCPartition = document.getElementById('node-c-partition-wrap');
	showElement(nodeCPartition);
}

export function startMyLeaseTimer(forNode, duration){
	var targetId = myLeaseTimerId(forNode);
	return startLeaseTimer(targetId, forNode, duration);
}
export function startLeaderLeaseTimer(forNode, duration){
	var targetId = leaderLeaseTimerId(forNode);
	return startLeaseTimer(targetId, forNode, duration);
}

export function startLeaseTimer(targetId, forNode, duration){
	var timer = document.getElementById(targetId);
	showElement(timer);

	var innerRect = document.getElementById(targetId + '-inner');
	var animation = anime({
		targets: innerRect,
		width: '0',
		easing: 'easeOutCubic',
		duration: duration,
	});
	return animation;
}

export function myLeaseTimerId(forNode) {
	return constructTimerId("mlease-rect-", forNode);
}

export function leaderLeaseTimerId(forNode) {
	return constructTimerId("llease-rect", forNode);
}

function constructTimerId(prefix, forNode) {
	var id = prefix;
	switch(forNode) {
		case Constants.NODE_C: {
			id += "node-c";
			break;
		}
		case Constants.NODE_B: {
			id += "node-b";
			break;
		}
		case Constants.NODE_A: {
			id += "node-a";
			break;
		}
		default: {
			console.error("Unrecognized Node: " + forNode);
		}
	}
	return id;
}
