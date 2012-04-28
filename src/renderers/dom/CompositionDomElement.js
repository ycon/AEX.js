
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

CompositionDomElement.v1_ = new Vector();
CompositionDomElement.v2_ = new Vector();
CompositionDomElement.v3_ = new Vector();

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
		
		if (!Browser.haveTransform && Browser.haveIEFilter){
			
			element.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11='1.0', sizingMethod='auto expand'); " +
								   "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
			
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
		
		if (this.width !== model.width || this.height !== model.height) {

			this.width = model.width;
			this.height = model.height;
			style.width = this.width.toFixed(4) + 'px';
			style.height = this.height.toFixed(4) + 'px';
			
			if (!this.collapse) {
				style.clip = "rect(0px, " + this.width + "px, " + this.height + "px, 0px)";
			}
		}
		
		if (!this.collapse){
			
			if (this.zoom !== camera.zoom) {
				
				this.zoom = camera.zoom;
				if (Browser.have3DTransform){
					style[Browser.PERSPECTIVE] = this.zoom.toString() + 'px';
				}
				
			}
			
			if (this.centerX !== camera.center.x || this.centerY !== camera.center.y) {
				
				this.centerX = camera.center.x;
				this.centerY = camera.center.y;
				if (Browser.have3DTransform){
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
					
					if (layer.model.collapse) {
						
						var mx = mat.m21,
							my = mat.m22,
							mz = mat.m23,
							scale = (
								(layer.model.is3D) ?
									Math.sqrt((mx * mx) + (my * my) + (mz * mz)) *
									(this.zoom / (this.zoom - mat.m43)
									) :
									Math.sqrt((mx * mx) + (my * my))
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
					
					this.setMatrix(
						layer.element,
						mat,
						(layer.model.is3D) ? camera : null,
						layer.model.getDepthPoint(),
						layer.model.width,
						layer.model.height
					);
					
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
			
			if (Browser.have3DTransform) {
				style[Browser.TRANSFORM_STYLE] = "";
				style[Browser.PERSPECTIVE] = "";
				style[Browser.PERSPECTIVE_ORIGIN] = "";
			}
			style.clip = 'rect(auto ,auto, auto, auto)';
			style.overflow = '';
			
		} else {
			
			style.overflow = 'hidden';
			style[Browser.TRANSFORM_STYLE] = 'flat';
		}
		
	},
	
	setScale: function(elem, scale) {
		
		if (Browser.haveTransform) {
			
			elem.style[Browser.TRANSFORM] = (scale !== 1) ?
											'scale('+scale.toFixed(4)+','+scale.toFixed(4)+')' : '';
											
		} else if (elem.style.zoom !== undefined) {
			
			elem.style.zoom = scale;
			
		}
		
	},
	
	setMatrix: function(elem, matrix, camera, depth_point) {
		
		var style = elem.style;
		
		if (Browser.have3DTransform) {
			
			style[Browser.TRANSFORM] = matrix.toCSS();
			
		} else {
			
			var m11 = matrix.m11,
				m12 = matrix.m12,
				m21 = matrix.m21,
				m22 = matrix.m22,
				x = matrix.m41,
				y = matrix.m42,
				z = matrix.m43,
				scale, center, p, p_x, p_y;
			
			if (camera) {
				
				center = camera.center;
				zoom = camera.zoom;
				p = matrix.multiplyVector(CompositionDomElement.v1_.copy(depth_point));
				p_x = matrix.multiplyVector(
					CompositionDomElement.v2_.set(depth_point.x + 1, depth_point.y, 0)
				);
				p_y = matrix.multiplyVector(
					CompositionDomElement.v3_.set(depth_point.x, depth_point.y + 1, 0)
				);
				
				scale = zoom / (zoom - z);
				x = x * scale + center.x * (1-scale);
				y = y * scale + center.y * (1-scale);
				
				scale = zoom / (zoom - p.z);
				p.x = p.x * scale + center.x * (1-scale);
				p.y = p.y * scale + center.y * (1-scale);
				
				scale = zoom / (zoom - p_x.z);
				p_x.x = p_x.x * scale + center.x * (1-scale);
				p_x.y = p_x.y * scale + center.y * (1-scale);
				
				scale = zoom / (zoom - p_y.z);
				p_y.x = p_y.x * scale + center.x * (1-scale);
				p_y.y = p_y.y * scale + center.y * (1-scale);
				
				m11 = p_x.x - p.x;
				m12 = p_x.y - p.y;
				m21 = p_y.x - p.x;
				m22 = p_y.y - p.y;
				
				x = p.x - (depth_point.x * m11 + depth_point.y * m21);
				y = p.y - (depth_point.x * m12 + depth_point.y * m22);
				
			}
			
			if (Browser.haveTransform) {
				
				style[Browser.TRANSFORM] = "matrix("+
					m11.toFixed(4)+","+m12.toFixed(4)+","+
					m21.toFixed(4)+","+m22.toFixed(4)+","+
					x.toFixed(4)+","+y.toFixed(4)+
				")";
				
			} else {
				
				if (Browser.haveIEFilter && elem.filters.length){
					
					var bounds = Browser.getLocalBound(elem);
					
					style.width = bounds.width+'px';
					style.height = bounds.height+'px';
					
					if (bounds.x || bounds.y) {
						var children = elem.childNodes,
							l = children.length,
							i = 0,
							child;
						
						for ( ; i < l; i += 1) {
							child = children[i];
							
							child.style.left = -bounds.x + 'px';
							child.style.top = -bounds.y + 'px';
							
						}
						
						x += bounds.x * m11 + bounds.y * m21;
						y += bounds.x * m12 + bounds.y * m22;
						
					}
					
					var filter = elem.filters.item(0);
					var min = Math.min;
					
					x += min(
						0,
						min(
							bounds.width * m11 + bounds.height * m21,
							min(
								bounds.width * m11,
								bounds.height * m21
							)
						)
					);
					
					y += min(
						0,
						min(
							bounds.width * m12 + bounds.height * m22,
							min(
								bounds.width * m12,
								bounds.height * m22
							)
						)
					);
					
					filter.M11 = m11;
					filter.M12 = m21;
					filter.M21 = m12;
					filter.M22 = m22;
					
				}
				
				style.left = x.toFixed(4) + 'px';
				style.top = y.toFixed(4) + 'px';
			}
			
		}
		
	},
	
	cleanTransform: function(elem) {
		
		elem.style[Browser.TRANSFORM] = '';
		elem.style.filter = '';
	},
	
	setOpacity: function(elem, opacity) {
		
		if (elem.style.opacity !== undefined) {
			
			elem.style.opacity = ( opacity !== 1 ) ? opacity : "";
			
		} else if (Browser.haveIEFilter && elem.filters.length === 2) {
			
			elem.filters.item(1).Opacity = opacity*100;
			
		}
		
	}
};
