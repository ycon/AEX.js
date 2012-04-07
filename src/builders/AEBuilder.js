
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
	
	setProp: function (target, name, animator, prop) {
		
		var key_data,
			keys,
			keys_x,
			keys_y,
			keys_z,
			i,
			isSpatial = false,
			isVector = false;
		
		if (prop !== undefined){
			
			if (isArray(prop)) {
				
				if (isArray(prop[0])) {
					
					key_data = prop[0];
					
					if (isArray(key_data[0])){
						// is a vector
						if (this.isSpatialArray_(key_data)){
							
							// is spatial
							
							keys = new SpatialKeys(target,name);
							animator.add(keys);
							isSpatial = true;
							
						} else {
							isVector = true;
							keys_x = new Keys(target[name],'x');
							keys_y = new Keys(target[name],'y');
							
							animator.add(keys_x);
							animator.add(keys_y);
							
							
							if (key_data[0].length >=2){
								keys_y = new Keys(target[name],'z');
								animator.add(keys_z);
							}
							// non spatial, need to be divided
						}
					} else {
						
						// just add keys;
						
						keys = new Keys(target,name);
						animator.add(keys);
						
					}
					
					
					
					var old_ease = [0,0,1,1];
					var ease;
					var old_type = 1;
					var type = 1;
					var old_time = 0;
					var time;
					var last_time = 0;
					var haveInEase = false;
					var haveOutEase = false;
					
					var haveOutHold = true;
					var key,key_x,key_y,key_z;
					
					var old_tangents = [0,0,0,0,0,0];
					var tangents;
					
					var value;
					
					for ( i = 0; i < prop.length; i++) {
						
						key_data = prop[i];
						value = key_data[0];
						time = key_data[1] || old_time;
						type = key_data[2] || old_type;
						
						
						haveInEase = type > 6;
						haveOutEase = !(type%3);
						
						ease = key_data[3] || old_ease;
						
						
						
						//haveInHold = type <= 3;
						haveOutHold = type === 1 || type === 4 || type === 7;
						
						if (isVector){
							key_x = keys_x.add(time,value[0],haveOutHold);
							key_y = keys_y.add(time,value[1],haveOutHold);
							if (keys_z){
								key_z = keys_z.add(time,value[2],haveOutHold);
							}
						} else {
							key = keys.add(time,value,haveOutHold);
						}
						
						if (haveInEase){
							key.inX = ease[0];
							key.inY = ease[1];
							if (haveOutEase){
								key.outX = ease[2];
								key.outY = ease[4];
							}
						} else if (haveOutEase){
							if (haveOutEase){
								key.outX = ease[0];
								key.outY = ease[1];
							}
						}
						
						if (isSpatial){
							
							tangents = key_data[(haveInEase||haveOutEase)?3:4] || old_tangents;
							
							if (tangents.length > 4){
								key.inTangent = new Vector(tangents[0], tangents[1], tangents[2]);
								key.outTangent = new Vector(tangents[3], tangents[4], tangents[5]);
							} else {
								key.inTangent = new Vector(tangents[0], tangents[1]);
								key.outTangent = new Vector(tangents[2], tangents[3]);
							}
						
						}
						
						old_time = time;
						old_type = type;
						old_ease = ease;
						last_time += time;
					}
					
				} else if (typeof target[name] === 'object') {
					
					target[name].x = prop[0];
					target[name].y = prop[1];
					
					if (target[name].z !== undefined && prop[2] !== undefined){
						target[name].z = prop[2];
					}
				}
				
			} else if (typeof prop === 'number' && typeof target[name] === 'number') {
				
				target[name] = prop;
				
			} else if ( typeof prop === 'object' 
						&& typeof target[name] === 'object' 
						&& (prop.x !== undefined || prop.y !== undefined || prop.z !== undefined) ) {
				
				this.setProp(target[name], 'x', animator, prop.x);
				this.setProp(target[name], 'y', animator, prop.y);
				
				if (prop.z !== undefined){
					this.setProp(target[name], 'z', animator, prop.z);
				}
				
			}
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