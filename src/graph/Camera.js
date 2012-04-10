
/** @constructor */
var Camera = function(){
	
	LayerBase.call(this);
	
	this.position = new Vector();
	this.rotation = new Vector();
	this.target = new Vector();
	this.haveTarget = true;
	this.zoom = 1333.33;
	this.center = new Vector();
	this.is3D = true;
	
	this.localMatrix_ = new Matrix();
	this.localMatrix2D_ = new Matrix();
	this.matrixCamera_ = new Matrix();
	this.tempMatrixCamera_ = new Matrix();
};

Camera.prototype = new LayerBase();
Camera.prototype.constructor = Camera;

Camera.prototype.getLocalMatrix = function(){
	
	var t   = 	this,
		r	=	t.rotation,
		ta	=	t.target,
		p	=	t.position,
		mat = 	this.localMatrix_
				.rotate(r.x,r.y,r.z);
	
	mat.m41 = mat.m42 = mat.m43 = 0;
	
	if (t.haveTarget){
		mat.lookAt(
				ta.x - p.x,
				ta.y - p.y, 
				ta.z - p.z
		);
	}
	
	mat.translate(p.x,p.y, -p.z);
	
	return 	mat;
};

Camera.prototype.getLocalMatrix2D = function(){
	
	return 	this.localMatrix2D_
			.rotate(0,0,this.rotation.z)
			.translate(this.position.x,this.position.y, 0);
	
};


Camera.prototype.getCameraMatrix = function(){
	
	
	var c = this.center;

	return	this.matrixCamera_
			.translate(c.x,c.y,this.zoom)
			.preMultiply(
				this.tempMatrixCamera_
				.injectMatrix(this.getMatrix())
				.invert()
			);
	//return 	new Matrix()
	//		.translate(c.x,c.y,this.zoom)
	//		.preMultiply(this.getMatrix().createInvert());
	
};


externs['Camera'] = Camera;