
define(['../geom/Matrix'], function (Matrix) {

	function LayerBase () {
		this.is3D = true;
		this.parent = null;
		this.visible = true;
		this.name = null;
		this.type = 'null';

		this.matrix_ = new Matrix();
		this.matrix2D_ = new Matrix();
	}

	LayerBase.prototype = {

		constructor: LayerBase,

		getMatrix: function () {

			if (!this.is3D){
				return this.getMatrix2D();
			}

			var mat = this.matrix_.injectMatrix(this.getLocalMatrix()),
				p = this.parent;

			if (p && p !== this){
				mat.multiply(p.getMatrix());
			}

			return mat;
		},

		getMatrix2D: function () {

			var mat = this.matrix2D_.injectMatrix(this.getLocalMatrix2D()),
				p = this.parent;

			if (p){
				mat.multiply(p.getMatrix2D());
			}

			return mat;
		},

		getLocalMatrix: function () {
			return new Matrix();
		},

		getLocalMatrix2D: function () {
			return new Matrix();
		}
	};

	return LayerBase;
});
