

var SolidDomElement = function(model){

	this.element = document.createElement('solid');
	this.model = model;
	
};

SolidDomElement.prototype = {
		
	constructor: SolidDomElement,
	
	render: function(){
		
		var style = this.element.style,
			model = this.model;
		
		style.width = model.width+'px';
		style.height = model.height+'px';
		style.backgroundColor = model.color;
		
	}
};

