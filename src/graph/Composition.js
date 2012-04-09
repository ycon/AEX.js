
/** @constructor */
var Composition = function(){
	Layer.call(this);
	
	this.layers = new Stack(Layer);
	this.cameras = new Stack(Camera);
	this.width = 640;
	this.height = 360;
	this.color = "#000000";
};


Composition.prototype = new Layer();
Composition.prototype.constructor = Composition;


Composition.prototype.getCamera = function(){
	
	
	var i = 0,
		l = this.cameras.length,
		temp_cam = null,
		cam = null;
	
	camLoop : for (i = 0; i < l; i++) {
		
		temp_cam = this.cameras.get(i);
		
		if (temp_cam.visible){
			cam = temp_cam;
			break camLoop;
		}
		
	}
	
	return cam;
};

externs['Composition'] = Composition;
