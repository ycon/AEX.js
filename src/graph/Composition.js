
/** @constructor */
var Composition = function(){
	Layer.call(this);
	
	var cam = new Camera();
	
	cam.haveTarget = false;
	
	this.layers = new Stack(Layer);
	this.cameras = new Stack(Camera);
	this.width = 640;
	this.height = 360;
	this.color = "#000000";
	this.type = 'composition';

	cam.align(this.width/2, this.height/2);
	this.defaultCam_ = cam;
};

Composition.prototype = new Layer();
Composition.prototype.constructor = Composition;

Composition.prototype.getCamera = function(){
	
	var i = 0,
		l = this.cameras.getLength(),
		temp_cam;

	for ( i = 0; i < l; i += 1 ) {
		temp_cam = this.cameras.get(i);
		if (temp_cam.visible){
			temp_cam.center.set(this.width/2, this.height/2);
			return temp_cam;
		}
	}
	
	temp_cam = this.defaultCam_;
	temp_cam.align(this.width/2, this.height/2);
	
	return temp_cam;
};

externs.Composition = Composition;
