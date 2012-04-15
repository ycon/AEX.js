


/**
 * @constructor
 */
var LayerDomElement = function(layer){

	this.model = layer;
	
	this.holder = document.createElement(this.tagName);
	this.element = this.holder;

	this.prevScale = 0;
	this.visible = false;
	
	this.matrix_ = new Matrix();
	this.tempMatrix_ = new Matrix();
};

LayerDomElement.prototype = {
		
		constructor : LayerDomElement,
		
		tagName : 'layer',
		
		visible : false,
		
		setVisible : function(val){
			
			if (val !== this.visible){
				this.visible = val;
				if (val){
					this.element.style.display = 'block';
				} else {
					this.element.style.display = 'none';
				}
			}
			
		},
		
		
		render : function(camera_mat,camera_zoom){
			
			var m = this.model,
				mat = this.matrix_.injectMatrix( m.getMatrix() );
			
			this.modifyMatrix( mat );
			
			if ( camera_mat ) {
				mat.multiply( camera_mat );
			}
			
			this.modifyCollapse( mat, camera_zoom );

			

			
			this.element.style[Browser.TRANSFORM] = mat.toString();
			this.holder.style.opacity = ( m.opacity !== 1 ) ? m.opacity : undefined;
			
			
		},
		
		modifyCollapse : function(mat,zoom){
			
			
			var t = this,
				e = t.element,
				h = t.holder,
				m = t.model;
			
			if ((e === h) === m.collapse){
				
				if (m.collapse){
					
					e = t.element = document.createElement('transform');
					
					if (h.parentElement){
						h.parentElement.replaceChild(e,h);
						e.style[TRANSFORM] = h.style[TRANSFORM];
						e.appendChild(h);
					}
					
				} else {
					
					if (e.parentElement){
						e.parentElement.replaceChild(h,e);
						h.style[TRANSFORM] = e.style[TRANSFORM];
					}
					
					t.element = h;
				}
				
			}
			
			
			if (m.collapse){
				
				var scale = 1,
					invScale,
					mx = mat.m21,
					my = mat.m22,
					mz = mat.m23,
					prev = t.prevScale;
				
				scale = Math.sqrt((mx * mx) + (my * my) + (mz * mz)) * (zoom / (zoom - mat.m43))*1.2;
				
				
				
				if (scale / prev > 1.3 || scale / prev < .77) {
					
					t.prevScale = scale;
					
					h.style[TRANSFORM] = 'scale('+scale+','+scale+')';
					
				} else {
					scale = prev;
				}
				
				invScale = 1/scale;
				mat.preMultiply(t.tempMatrix_.scaling(invScale, invScale, 1));
				
			} else {
				this.prevScale = 0;
			}

		},

		modifyMatrix : function(mat){
			return mat;
		}
};

