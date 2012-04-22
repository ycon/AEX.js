
/** @constructor */
var Layer = function(){
	
	LayerBase.call(this);

	this.filters = new Stack();
	this.masks = new Stack();
	
	this.collapse = false;
	
	this.position = new Vector();
	this.anchor = new Vector();
	this.scale = new Vector(1,1,1);
	this.rotation = new Vector();
	this.orientation = new Quaternion();
	this.opacity = 1;
	this.type = 'null';
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	
};

Layer.prototype = new LayerBase();
Layer.prototype.constructor = Layer;

Layer.prototype.getLocalMatrix = function(){
	
	var p = this.position,
		a = this.anchor,
		s = this.scale,
		r = this.rotation,
		o = this.orientation;
	
	return this.localMatrix_
		   .translation(-a.x,-a.y, a.z)
		   .scale(s.x, s.y, s.z)
		   .rotate(r.x, r.y, r.z)
		   .quaternionRotate(o.x, o.y, o.z, o.w)
		   .translate(p.x,p.y, -p.z);
};

Layer.prototype.getLocalMatrix2D = function(){
	
	var p = this.position,
		a = this.anchor,
		s = this.scale;

	return this.localMatrix2D_
		   .translation(-a.x, -a.y, 0)
		   .scale(s.x, s.y, 1)
		   .rotate(0, 0, this.rotation.z)
		   .translate(p.x, p.y, 0);
};


externs.Layer = Layer;
