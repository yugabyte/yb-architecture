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

export function setTextWithAnimation(textSect, text, onComplete) {
	textSect.innerHTML=text;

	var ml4 = {};
	ml4.opacityIn = [0,1];
	ml4.scaleIn = [0.2, 1];
	ml4.scaleOut = 3;
	ml4.durationIn = 2000;
	ml4.durationOut = 2000;
	ml4.delay = 500;

	anime({
		targets: textSect,
		opacity: ml4.opacityIn,
		scale: ml4.scaleIn,
		duration: ml4.durationIn,
		complete: onComplete,
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
		translateY: -72
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
			translateY = -100;
			break;
		}
		case Constants.NODE_A: {
			translateX = -160;
			translateY = -120;
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

export function logMessageFromAToB(withAck) {
	return sendLogMessage(Constants.NODE_A, Constants.NODE_B, withAck);
}

export function sendLogMessage(fromNode, toNode, withAck, value, commitValue, delay) {
	console.log('FromNode: ' + fromNode + " toNode: " + toNode + " withAck: " + withAck + " value: " + value + " commitValue: " + commitValue);
	var method = null;
	var messageElement = null;
	var textElementId = null;
	var sourceNodeTextElementId = null;
	switch(fromNode) {
		case Constants.NODE_A: {
			method = messageFromA;
			sourceNodeTextElementId = 'node-a-extra-text';

			if(toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-a-message-to-b');
				textElementId = 'node-b-extra-text';
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-a-message-to-client');
			}
			break;
		}
		case Constants.NODE_C: {
			method = messageFromC;
			sourceNodeTextElementId = 'node-c-extra-text';

			if (toNode == Constants.NODE_A) {
				messageElement = document.getElementById('node-c-message-to-a');
				textElementId = 'node-a-extra-text';
			} else if (toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-c-message-to-b');
				textElementId = 'node-b-extra-text';
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-c-message-to-client');
			}
			break;
		}
		case Constants.CLIENT_NODE: {
			method = messageFromClient;
			if (toNode == Constants.NODE_A) {
				messageElement = document.getElementById('client-message');
				textElementId = 'node-a-extra-text';
			} else if (toNode == Constants.NODE_B) {
				messageElement = document.getElementById('client-message');
				textElementId = 'node-b-extra-text';
			} else if (toNode == Constants.NODE_C) {
				messageElement = document.getElementById('client-message');
				textElementId = 'node-c-extra-text';
			}
			break;
		}
		default: {
			throw new Error('Unrecognized fromNode: ' + fromNode);
		}
	}

	var animation = method(toNode,{
			delay: delay,
			onBegin: anim => {
				showElement(messageElement);
				messageElement.classList.add('log-message')
			},
			onChangeComplete: anim => {
				console.log('In onChangeComplete. messageElement: ' + messageElement);
				if (withAck) {
					messageElement.classList.remove('log-message');
					messageElement.classList.add('log-message-ack');
				}
				console.log('textElementId: ' + textElementId);
				if (value && textElementId){
					var addCSSClass = "";
					var removeCSSClass = "";
					if (commitValue) {
						addCSSClass = "set-text-committed";
						removeCSSClass = "set-text-uncommitted";
					} else {
						addCSSClass = "set-text-uncommitted";
						removeCSSClass = "set-text-committed";
					}
					console.log('addCSSClass: ' + addCSSClass);

					setSVGText({
						targetId: textElementId,
						text: value,
						addCSSClass: addCSSClass,
						removeCSSClass:removeCSSClass,
						showElement: true,
					});
				}

			},
			onComplete: anim => {
				if (withAck) {
					messageElement.classList.remove('log-message-ack');
					// we got the ack back so uncommited text should be shown as commited now
					if (sourceNodeTextElementId) {
						setSVGText({targetId: sourceNodeTextElementId, addCSSClass: "set-text-committed"});
					}
				}
				messageElement.style.transform = 'none';
			},
			alternate: withAck,
		});
	return animation;
}

export function logMessageFromLeaderToFollowers(withAck, value, commitValue, delay) {
	var nodeAAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_A, withAck, value, commitValue, delay);

	// message to Node B
	// var messageToB = document.getElementById('node-c-message-to-b');
	var nodeBAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_B, withAck, value, commitValue, delay);

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
		translateY = -220;
		targets = '#node-c-message-to-b';
	} else if (destination == Constants.NODE_A) {
		targets = '#node-c-message-to-a';
		translateX = -270;
	} else if (destination == Constants.CLIENT_NODE) {
		targets = '#node-c-message-to-client';
		translateX = -100;
		translateY = 100;
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
		translateY = -200;
		targets = '#node-a-message-to-b';
	}
	else if (destination == Constants.CLIENT_NODE) {
		translateX = 150;
		translateY = 100;
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
	return "SET " + value;
}

export function partitionNodeC() {
	var nodeCPartition = document.getElementById('node-c-partition-wrap');
	showElement(nodeCPartition);
}

export function startLeaseTimer(forNode, duration){
	var targetId = constructTimerElementId(forNode);
	var timer = document.getElementById(targetId);
	showElement(timer)
	var animation = anime({
		targets: timer,
		width: '0',
		easing: 'easeInOutQuad',
		duration: duration,
	});
	return animation;
}

export function constructTimerElementId(forNode) {
	var id = "htimer-rect-";
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
