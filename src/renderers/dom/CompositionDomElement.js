
var CompositionDomElement = function(model) {

		var sig = model.layers.on,
			e;
		
		this.model = model;
		this.element = document.createElement('composition');
		this.collapse = null;
		this.zoom = 0;
		this.centerX = 0;
		this.centerY = 0;
		this.width = 0;
		this.height = 0;
		this.layers = [];

		var self = this;
		model.layers.each(function(layer) {
			e = self.generate(layer);
			if (e) {
				if(self.element.firstChild){
					self.element.insertBefore(e.element,self.element.firstChild);
				} else {
					self.element.appendChild(e.element);
				}
				self.layers.push(e);
			}
		});

		sig.add.add(this.add, this);
		sig.remove.add(this.remove, this);
		sig.swap.add(this.swap, this);
		
		this.matrix_ = new Matrix();
		this.matrix2D_ = new Matrix();
		this.tempMatrix_ = new Matrix();
};

CompositionDomElement.prototype = {
	
	constructor: CompositionDomElement,
	
	add: function(layer, pos) {

		var e = this.generate(layer),
			elem = thid.element,
			children;
		
		if (e) {
			
			//TODO test DOM layer insertion properly
			if(elem.hasChildNodes() || pos < 0) {
				children = elem.childNodes();
				elem.insertBefore(e.element,children[children.length-pos-1]);
			} else {
				elem.appendChild(e.element);
			}
			this.layers.splice(pos, 0, e);
		}
		

	},
	
	remove: function(layer, pos) {

		var e = this.layers[pos];
		this.element.removeChild(e.element);
		this.layers.splice(pos, 1);

	},
	
	swap: function(pos_1, pos_2) {

		var e = this.layers[pos_1];
		this.layers[pos_1] = this.layers[pos_2];
		this.layers[pos_2] = e;

	},
	
	generate: function(model) {

		var element = document.createElement('layer'),
			result = {
				model: model,
				element: element,
				mask: null,
				scale: 1,
				opacity: 1
			},
			handler = null;
		
		switch (model.type) {
		case 'composition':
			handler = new CompositionDomElement(model);
			break;
		case 'text':
			handler = new TextDomElement(model);
			break;
		case 'solid':
			handler = new SolidDomElement(model);
			break;
		}
		
		if (handler && handler.element) {
			element.appendChild(handler.element);
			result.content = handler.element;
			result.handler = handler;
		}
		
		return result;
	},
	
	render: function(opt_camera, opt_parent, opt_parent_2D) {

		var layers = this.layers,
			l = this.layers.length,
			model = this.model,
			style = this.element.style,
			camera = (opt_camera)?
					 opt_camera :
					 model.getCamera(),
			cam_mat = camera.getCameraMatrix(),
			i, layer, mat, mat_2D;
		
		if (this.collapse !== model.collapse) {
			
			this.collapse = model.collapse;
			this.setCollapse();
			
			if (!this.collapse) {
				this.width = this.height = this.zoom = null;
			}
		}

		if (!this.collapse) {
			
			if (this.width !== model.width || this.heigh !== model.height) {

				this.width = model.width;
				this.height = model.height;
				style.width = this.width.toString() + 'px';
				style.height = this.height.toString() + 'px';
				style.clip = "rect(0px , " + this.width + "px, " + this.height + "px, 0px)";
			}
			
			if (Browser.have3DTransform){
				
				if (this.zoom !== camera.zoom) {
					
					this.zoom = camera.zoom;
					style[Browser.PERSPECTIVE] = this.zoom.toString() + 'px';
				}
				
				if (this.centerX !== camera.center.x || this.centerY !== camera.center.y) {
					
					this.centerX = camera.center.x;
					this.centerY = camera.center.y;
					style[Browser.ORIGIN] = this.centerX.toString() + 'px ' +
											this.centerY.toString() + 'px';
				}
				
			}

		}

		for (i = 0; i < l; i++) {

			layer = layers[i];

			if (layer.visible !== layer.model.visible) {
				layer.visible = layer.model.visible;
				style.display = (layer.visible) ? 'block' : 'none';
			}

			if (layer.visible && layer.handler && layer.content) {
				
				mat = this.matrix_.injectMatrix(layer.model.getMatrix());
				
				if (opt_parent && layer.model.is3D){
					mat.multiply(opt_parent);
				} else if (opt_parent_2D && !layer.model.is3D) {
					mat.multiply(opt_parent_2D);
				}
				
				if (layer.model.type === 'composition' && layer.model.collapse){
					
					if (!layer.collapse) {
						layer.collapse  = true;
						this.cleanTransform(layer.element);
					}
					
					mat_2D = mat;
					
					if (layer.model.is3D){
						
						mat_2D = this.matrix2D_.injectMatrix(layer.model.getMatrix2D());
						if (opt_parent_2D){
							mat_2D.multiply(opt_parent_2D);
						}
						
					}
					
					
					layer.handler.render(camera, mat, mat_2D);
					
				} else if (layer.handler && layer.content) {
					
					if (layer.model.is3D){
						mat.multiply(cam_mat);
					}
					
					if (layer.model.collapse || !layer.model.is3D) {
						
						var mx = mat.m21,
							my = mat.m22,
							mz = mat.m23,
							scale = (
								(layer.model.is3D) ?
									Math.sqrt(
										(mx * mx) + (my * my) + (mz * mz)) *
										(this.zoom / (this.zoom - mat.m43)
									) :
									Math.sqrt( (mx * mx) + (my * my) )
							) * 1.2 ,
							ratio = scale / layer.scale;
						
						if (ratio > 1.3 || ratio < 0.77) {
							layer.scale = (scale > 0.77 && scale < 1.1) ? 1 : scale;
							this.setScale(layer.content, scale);
						}
						
						scale = 1/layer.scale;
						mat.preMultiply(this.tempMatrix_.scaling(scale, scale, 1));
						
					} else if (!layer.model.collapse && layer.model.is3D && layer.scale !== 1) {
						
						layer.scale = 1;
						this.setScale(layer.content, layer.scale);
						
					}
					
					layer.collapse = layer.model.collapse;
					
					layer.handler.render();
					this.setMatrix(layer.element, mat, (layer.model.is3D) ? camera : null);
					
				}
				
				if (layer.opacity !== layer.model.opacity){
					layer.opacity = layer.model.opacity;
					this.setOpacity(layer.element, layer.model.opacity);
				}

				mat.identity();

			}
		}
	},
	
	setCollapse: function(){
		
		var style = this.element.style;
		
		if (this.collapse){
			
			style[Browser.TRANSFORM_STYLE] = "";
			style[Browser.PERSPECTIVE] = "";
			style[Browser.PERSPECTIVE_ORIGIN] = "";
			style.clip = "";
			style.overflow = "";
		} else {
			style.overflow = 'hidden';
			style[Browser.TRANSFORM_STYLE] = 'flat';
		}
		
	},
	
	setScale: function(elem, scale) {
		
		elem.style[Browser.TRANSFORM] = (scale !== 1) ?
										'scale('+scale.toFixed(4)+','+scale.toFixed(4)+')' : '';
	},
	
	setMatrix: function(elem, matrix, camera) {
		
		if (Browser.have3DTransform) {
			elem.style[Browser.TRANSFORM] = matrix.toCSS();
		} else {
			
			var m11 = matrix.m11,
				m12 = matrix.m12,
				m21 = matrix.m21,
				m22 = matrix.m22,
				x = matrix.m41,
				y = matrix.m42,
				z = matrix.m43;
			
			if (camera) {
				var scale = camera.zoom / (camera.zoom - z);
				m11 *= scale;
				m12 *= scale;
				m21 *= scale;
				m22 *= scale;
				x *= scale;
				y *= scale;
				x += camera.center.x*(1-scale);
				y += camera.center.y*(1-scale);
			}
			
			if (Browser.haveTransform) {
				elem.style[Browser.TRANSFORM] = "matrix("+
					m11.toFixed(4)+","+m12.toFixed(4)+","+
					m21.toFixed(4)+","+m22.toFixed(4)+","+
					x.toFixed(4)+","+y.toFixed(4)+
				")";
			} else {
				elem.style.left = x + 'px';
				elem.style.top = y + 'px';
			}
			
		}
		
	},
	
	cleanTransform: function(elem) {
		
		elem.style[Browser.TRANSFORM] = '';
	},
	
	setOpacity: function(elem, opacity) {
		
		elem.style.opacity = ( opacity !== 1 ) ? opacity : "";
	}
};
