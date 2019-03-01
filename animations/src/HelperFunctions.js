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

export function clientMessageToNodeC() {
	var clientMessage = document.getElementById('client-message');
	var animation = anime({
		targets: clientMessage,
		translateX: 100,
		translateY: -100,
		easing: 'linear',
		duration: 800,
		begin: anime => {
			showElement(clientMessage);
		},
		complete: anime => {
			hideElement(clientMessage);
			clientMessage.style.transform = 'none';
		}
	});
	return animation;
}
export function clientMessageToNodeA() {
	var clientMessage = document.getElementById('client-message');
	var animation = anime({
		targets: clientMessage,
		translateX: -100,
		translateY: -100,
		easing: 'linear',
		duration: 800,
		begin: anime => {
			showElement(clientMessage);
		},
		complete: anime => {
			hideElement(clientMessage);
			clientMessage.style.transform = 'none';
		}
	});
	return animation;
}
export function logMessageFromAToB(withAck) {
	return sendLogMessage(Constants.NODE_A, Constants.NODE_B, withAck);
}

export function sendLogMessage(fromNode, toNode, withAck) {
	var method = null;
	var messageElement = null;
	switch(fromNode) {
		case Constants.NODE_A: {
			method = messageFromA;
			if(toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-a-message-to-b');
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-a-message-to-client');
			}
			break;
		}
		case Constants.NODE_C: {
			method = messageFromC;
			if (toNode == Constants.NODE_A) {
				messageElement = document.getElementById('node-c-message-to-a');
			} else if (toNode == Constants.NODE_B) {
				messageElement = document.getElementById('node-c-message-to-b');
			} else if (toNode == Constants.CLIENT_NODE) {
				messageElement = document.getElementById('node-c-message-to-client');
			}
			break;
		}
		default: {
			throw new Error('Unrecognized fromNode: ' + fromNode);
		}
	}

	var animation = method(toNode,{
			onBegin: anim => {
				showElement(messageElement);
				messageElement.classList.add('log-message')
			},
			onChangeComplete: anim => {
				if (withAck) {
					messageElement.classList.remove('log-message');
					messageElement.classList.add('log-message-ack');
				}
			},
			onComplete: anim => {
				if (withAck) {
					messageElement.classList.remove('log-message-ack');
				}
				messageElement.style.transform = 'none';
			},
			alternate: withAck,
		});
	return animation;
}

export function logMessageFromLeaderToFollowers(withAck) {
	var nodeAAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_A, withAck);

	// message to Node B
	// var messageToB = document.getElementById('node-c-message-to-b');
	var nodeBAnimation = sendLogMessage(Constants.NODE_C,Constants.NODE_B, withAck);

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
	});
	return animation;
}
