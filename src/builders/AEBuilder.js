
var AEBuilder = {
	
	build: function(data){
		
		return this.buildItem(data.items[data.root],data.items);
		
	},
	
	buildItem: function(item,items){
		switch (item.type) {
		case 'Composition':
			return this.buildComp(item,items);
			break;
		case 'Solid':
			return this.buildSolid(item,items);
			break;
		case 'Image':
			return this.buildImage(item,items);
			break;
		case 'Video':
			return this.buildVideo(item,items);
			break;
		}
		
	},
	
	buildComp: function (item, items) {
		
		var comp = new Composition(),
			item_animator = new AnimatorStack(comp),
			layers = item.layers,
			i,layer_data,animator;
		
		comp.width = item.width;
		comp.height = item.height;
		comp.color = item.color || "#000000";
		item_animator.duration = item.duration || 1;
		item_animator.frameRate = item.frameRate || 25;
		
		
		for ( i = 0; i < layers.length; i++) {
			
			layer_data = layers[i];
			animator = null;
			
			switch (layer_data.type) {
			case 'Camera':
				animator = this.buildCamera(layer_data);
				break;
			case 'Text':
				animator = this.buildText(layer_data);
				break;
			default:
				if (layer_data.source){
					animator = this.buildItemLayer(layer_data,items);
				}
				break;
			}

			if (animator){
				
				item_animator.add(animator);
				((animator.layer instanceof Camera)
					? comp.cameras 
					: comp.layers
				).add(animator.layer);
				
			}
		}
		
		return item_animator;
	},
	
	setLayer: function(animator,data){
		var layer = animator.layer,
			tr = data.transform;
		
		layer.name = data.name;
		layer.is3D = data.is3D || false;
		
		if (tr){
			this.setProp(layer, "position", animator, tr.position);
			this.setProp(layer, "anchor", animator, tr.anchor);
			this.setProp(layer, "scale", animator, tr.scale);
			this.setProp(layer, "opacity", animator, tr.opacity);
		}
		
		if (layer.is3D){
			this.setProp(layer, "rotation", animator, tr.rotation);
			this.setProp(layer, "orientation", animator, tr.orientation);
		} else {
			this.setProp(layer.rotation, "z", animator, tr.rotation);
		}
		
	},
	
	

	buildSolid: function (data, items) {
		
		var solid = new Solid(),
			item_animator = new AnimatorStack(solid);
		
		solid.width = data.width;
		solid.height = data.height;
		solid.color = data.color;
		
		return item_animator;
		
	},
	
	
	buildItemLayer: function (data, items) {
		
		var item_animator = this.buildItem(items[data.source], items),
			layer = item_animator.item,
			animator = new Animator(layer, data.inPoint, data.outPoint);
		
		this.setLayer(animator, data);
		
		animator.source = item_animator;
		animator.startTime = data.startTime || 0;
		animator.speed = data.speed || 1;
		
		return animator;
	},
	
	buildImage: function (item, items) {
		
	},
	
	buildVideo: function (item, items) {
		
	},

	
	buildCamera: function (layer) {
		
	},

	buildText: function (layer) {
		
	},


	dump: function(){
		
	},
	
	
	setProp: function (obj, name, animator, value) {
		
		if (!value && value !== 0){
			return;
		}
		
		var i,k,val,offset,is_hold,keys,key,is_object,is_array,is_spatial,is_vector,target;
		
		if (Array.isArray(value)){
			
			is_spatial = null;
			offset = 0;
			
			for (i = 0; i < value.length; i++) {
				
				k = value[i];
				
				is_object = typeof k === 'object';
				is_array = Array.isArray(k);
				is_hold = ( is_array || !is_object || (k.e && k.e.o === 0));
				val = (is_array) ? k[0] : (is_object && k.v) ? k.v : k;
				is_vector = Vector.isVector(val);
				
				if (is_vector){
					if (val.w !== undefined){
						val = new Quaternion(val.x,val.y,val.z,val.w);
					} else {
						val = new Vector(val.x,val.y,val.z);
					}
				}
				
				if (is_spatial === null){
					
					is_spatial = is_vector;
					
					if (is_spatial){
						keys = new SpatialKeys(obj,name);
					} else {
						keys = new Keys(obj,name);
					}
				}
				
				if (is_array){
					offset = k[1];
				} else if (is_object && k.d !== undefined){
					
					offset = k.d || 0;
				}
				
				key = keys.add(offset,val,is_hold);
				
				if (k.e && Array.isArray(k.e.i)){
					key.inX = k.e.i[0];
					key.inY = k.e.i[1];
				}
				if (k.e && Array.isArray(k.e.o)){
					key.outX = k.e.o[0];
					key.outY = k.e.o[1];
				}
				
				if (is_spatial && k.t){
					if (Array.isArray(k.t.i)){
						key.inTangent = new Vector(k.t.i[0],k.t.i[1],k.t.i[2]);
					}
					if (Array.isArray(k.t.o)){
						key.outTangent = new Vector(k.t.o[0],k.t.o[1],k.t.o[2]);
					}
					key.update = true;
				}
				
			}
			
			if (keys){
				animator.add(keys);
			}
			
		} else if (Array.isArray(value.x)) {
			
			setProp(obj[name],'x',animator,value.x);
			
			if (prop.y){
				setProp(obj[name],'y',animator,value.y);
			}
			
			if (prop.z){
				setProp(obj[name],'z',animator,value.z);
			}
			
		} else {
			
			if (Vector.isVector(value)){
				
				target = obj[name];
				target.set(value.x,value.y,value.z);
				if (target.w !== undefined){
					target.w = value.w;
				}
				
			} else {
				obj[name] = value;
			}
			
		}
		
	},
	
};

externs["AEBuilder"] = AEBuilder;
