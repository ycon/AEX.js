
/** @constructor */
var LayerBase = function(){
	
	this.is3D = true;
	this.parent = null;
	this.visible = true;
	this.name = null;
	
	this.matrix_ = new Matrix;;
	this.matrix2D_ = new Matrix;
	
};


LayerBase.prototype.getMatrix = function(){
	
	if (!this.is3D){
		return this.getMatrix2D();
	}

	var mat = this.matrix_.injectMatrix(this.getLocalMatrix()),
		p = this.parent;
	
	if (p){
		mat.multiply(p.getMatrix());
	}
	
	return mat;
};


LayerBase.prototype.getMatrix2D = function(){
	
	var mat = this.matrix2D_.injectMatrix(this.getLocalMatrix2D()),
		p = this.parent;

	if (p){
		mat.multiply(p.getMatrix2D());
	}
	
	return mat;
};


LayerBase.prototype.getLocalMatrix = function(){
	return new Matrix();
};

LayerBase.prototype.getLocalMatrix2D = function(){
	return new Matrix();
};
