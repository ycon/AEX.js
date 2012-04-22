

var SolidDomElement = function(model){

	this.element = document.createElement('solid');
	this.model = model;
	
};

SolidDomElement.prototype = {
		
	constructor: SolidDomElement,
	
	render: function(){
		
		var style = this.element.style,
			model = this.model;
		
		style.width = model.width;
		style.height = model.height;
		style.backgroundColor = model.color;
		
	}
};

