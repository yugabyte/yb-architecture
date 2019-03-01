function setSVGText(params) {
	var target = document.getElementById(params.targetId);
	if (params.text) {
		target.textContent = params.text;
	}
	target.classList.add(params.addCSSClass);
	if (params.showElement) {
		showElement(target);
	}
}
exports.setSVGText = setSVGText;

function showElement(element) {
	element.classList.remove('visibility-hidden');
	element.classList.add('visibility-visible');
}
exports.showElement = showElement;

function hideElement(element){
	element.classList.remove('visibility-visible');
	element.classList.add('visibility-hidden');
}
exports.hideElement = hideElement;
