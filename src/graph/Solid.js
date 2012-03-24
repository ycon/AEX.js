
/** @constructor */
var Solid = function(){
	
	Layer.call(this);
	
	this.color = '#000000';
	this.width = 640;
	this.height = 360;
	
};


Solid.prototype = new Layer();
Solid.prototype.constructor = Solid;


externs['Solid'] = Solid;