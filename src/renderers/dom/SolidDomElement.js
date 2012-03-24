


/**
 * @constructor
 */
var SolidDomElement = function(layer){

	LayerDomElement.call(this,layer);
	
};

SolidDomElement.prototype = new LayerDomElement(null);
SolidDomElement.prototype.constructor = SolidDomElement;
SolidDomElement.prototype.tagName = 'solid';

SolidDomElement.prototype.render = function(camera_mat,camera_zoom){
	
	LayerDomElement.prototype.render.call(this,camera_mat,camera_zoom);
	
	var h = this.holder,
		m = this.model;
	
	h.style.width = m.width;
	h.style.height = m.height;
	h.style.backgroundColor = m.color;
	
};
