
/** @constructor */
var Camera = function(){
	
	LayerBase.call(this);
	
	this.position = new Vector();
	this.rotation = new Vector();
	this.orientation = new Quaternion();
	this.target = new Vector();
	this.haveTarget = true;
	this.zoom = 1333.33;
	this.center = new Vector();
	this.is3D = true;
	this.type = 'camera';
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	this.matrixCamera_ = new Matrix();
	this.tempMatrixCamera_ = new Matrix();
};

Camera.prototype = new LayerBase();
Camera.prototype.constructor = Camera;

Camera.prototype.getLocalMatrix = function(){
	
	var t = this,
		r =	t.rotation,
		ta = t.target,
		p = t.position,
		o = t.orientation,
		mat = this.localMatrix_
			  .rotation(r.x,r.y,r.z);
	
	mat.m41 = mat.m42 = mat.m43 = 0;
	
	mat.quaternionRotate(o.x, o.y, o.z, o.w);
	
	if (t.haveTarget){
		mat.lookAt(
				ta.x - p.x,
				ta.y - p.y,
				ta.z - p.z
		);
	}
	
	
	
	mat.translate(p.x, p.y, -p.z);
	
	return 	mat;
};

Camera.prototype.getLocalMatrix2D = function(){
	
	return this.localMatrix2D_
		   .rotation(0,0,this.rotation.z)
		   .translate(this.position.x,this.position.y, 0);
	
};


Camera.prototype.getCameraMatrix = function(){
	
	var c = this.center;

	return	this.matrixCamera_
			.translation(c.x,c.y,this.zoom)
			.preMultiply(
				this.tempMatrixCamera_
				.identity()
				.injectMatrix(this.getMatrix())
				.invert()
			);
};

Camera.prototype.align = function(x, y){
	
	this.center.x = this.position.x = x;
	this.center.y = this.position.y = y;
	this.position.z = -this.zoom;
	
};


externs.Camera = Camera;
