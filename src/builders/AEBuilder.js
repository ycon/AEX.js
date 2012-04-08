
var AeBuilder = {
	
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
			controller = new ItemController(comp),
			layers = comp.layers,
			i,layer,animator;
		
		comp.width = item.width;
		comp.height = item.height;
		
		for ( i = 0; i < layers.length; i++) {
			
			layer = layers[i];
			animator = null;
			
			switch (layer.type) {
			case 'Camera':
				animator = this.buildCamera(layer);
				break;
			case 'Solid':
				animator = this.buildSolid(layer, items);
				break;
			case 'Text':
				animator = this.buildText(layer);
				break;
			case 'Composition':
				animator = this.buildCompLayer(layer, items);
				break;
			}
			
			if (animator){
				
				controller.add(animator);
				((animator.layer instanceof Camera)
					? comp.cameras 
					: comp.layers
				).add(animator.layer);
				
			}
		}
		
		return controller;
	},
	
	setProp: function (obj, name, animator, value) {
		
		var i,k,val,offset,is_hold,keys,key,is_object,is_array,is_spatial,is_vector;
		
		if (isArray(value)){
			
			is_spatial = null;
			offset = 0;
			
			for (i = 0; i < value.length; i++) {
				
				k = value[i];
				
				is_object = typeof k !== 'object';
				is_array = isArray(k);
				is_hold = ( is_array || !is_object || (k.e && k.e.o === 0));
				val = (is_array) ? k[0] : (is_object && k.v) ? k.v : k;
				is_vector = (typeof val === 'object' && val.x !== undefined && val.y !== undefined);
				
				if (is_vector){
					val = new Vector(val.x,val.y,val,z);
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
				
				if (k.e && isArray(k.e.i)){
					key.inX = k.e.i[0];
					key.inY = k.e.i[1];
				}
				if (k.e && isArray(k.e.o)){
					key.outX = k.e.o[0];
					key.outY = k.e.o[1];
				}
				
				if (is_spatial && k.t){
					if (isArray(k.t.i)){
						key.inTangent = new Vector(k.t.i[0],k.t.i[1],k.t.i[2]);
					}
					if (isArray(k.t.o)){
						key.outTangent = new Vector(k.t.o[0],k.t.o[1],k.t.o[2]);
					}
				}
				
			}
			
			if (keys){
				animator.add(keys);
			}
			
		} else if (prop && isArray(value.x)) {
			
			setProp(obj[name],'x',animator,value.x);
			
			if (prop.y){
				setProp(obj[name],'y',animator,value.y);
			}
			
			if (prop.z){
				setProp(obj[name],'z',animator,value.z);
			}
			
		} else {
			obj[name] = value;
		}
		
	},
	
	isSpatialArray_: function(arr){
		if (arr.length <= 4){
			return true;
		}
		if (arr.length === 3 && ( arr[2] <= 5 && arr[2] !== 3)) {
			return true;
		}
		return false;
	},

	buildSolid: function (item, items) {
		
		var solid = new Solid(),
			animator = new Animator(solid, item.inPoint, item.outPoint),
			data = items[item.source],
			tr = item.transform;
		
		solid.color = data.color;
		solid.width = data.width;
		solid.height = data.height;
		
		
		solid.name = item.name;
		
		if (tr){
			this.setProp(solid, "position", animator, tr.position);
		}
		
		
		return animator;
	},
	
	buildImage: function (item, items) {
		
	},
	
	buildVideo: function (item, items) {
		
	},

	
	buildCamera: function (layer) {
		
	},
	
	buildSolid: function (layer, items) {
		
	},
	
	buildText: function (layer) {
		
	},
	
	buildCompLayer: function (layer, items) {
		
	},


	dump: function(){
		
	}
};

externs["AeBuilder"] = AeBuilder;