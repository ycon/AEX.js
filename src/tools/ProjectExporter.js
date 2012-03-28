

var ProjectExporter = {
		
	getProject : function(comp) {
		
		var project = {	
			items : {}
		};
		
		project.root = this.getItem(comp,project);
		
		return project;
	},
	
	getItem : function( item, project ){
		
		if ( !project.items[item.id] ){
			
			var options = JSON.parse(item.comment || "{}");
			
			var result = {
				name : item.name,
				id : item.id,
				type : item.typeName,
				width : item.width,
				height : item.height,
			};

			switch (item.typeName) {
			
				case 'Composition':
					this.setComp( item, result, project );
					break;
				case 'Footage':
					
					var source = item.mainSource;
					
					if (source.toString() == '[object FileSource]'){
						
						 result.src = options.src || source.file.displayName;
						 
						 if (source.isStill){
							 
							 result.type = "Image";
							 
						 } else {
							 
							 result.type = "Video";
							 result.frameRate = item.frameRate;
							 result.duration = item.duration;
							 
						 }
					} else {
						
						result.type = "Solid";
                   	 
						if (source.toString() == '[object SolidSource]'){
	                   		 
							result.color = this.getColor(source.color);
							
						}
						
					}
					
					break;
			};
			
			project.items[item.id] = result;
			
		}
		
		return item.id;
		
	},
	
	setComp : function(comp,result,project){
		
		result.layers = [];
		result.type = "Composition";
		result.color = this.getColor(comp.bgColor);
		
		var parents = [],
			layer,
			layer_opt;
		
		for ( var i = 1; i < comp.layers.length; i++) {
			
			layer = comp.layers[i];
			
			if (layer.parent != null) {
				
				parents.push(layer.parent);
	            
			}
			
			if (layer.selected){
				
				layer.selected = false;
				
			}
		}
		
		for ( var i = 1; i < comp.layers.length; i++) {
			
			layer = comp.layers[i];
			layer_opt = JSON.parse(layer.comment || "{}");
			
			if ( layer.active 
				 || layer.isTrackMatte 
				 || parents.indexOf(layer) !== -1
				 || layer_opt.exportable !== false ) {
				
				result.layers.push( this.getLayer( layer, layer_opt, project ) );
				
			}
			
		}

	},
	
	getLayer : function( layer, options, project ) {
		
		var result = {
				
			id : layer.index,
			name : options.id || layer.name,
			startTime : layer.startTime,
			inPoint : layer.inPoint,
			outPoint : layer.outPoint
			
		};
		
		if (layer.parent !== null) {
			result.parent = layer.parent.index;
		}
		
		if (layer.stretch !== 100) {
			result.stretch = layer.stretch;
		}
		
		var properties = this.getProperties(layer,project,false,options);
		var type = layer.toString();
		
		switch (type){
		
			case "[object AVLayer]":
			case "[object TextLayer]":
			case "[object ShapeLayer]":
				
				result.width = layer.width;
				result.height = layer.height;
			    
			    if (layer.adjustmentLayer) result.adjustmentLayer = true;
			    if (layer.threeDLayer) result.is3D = true;
			    if (layer.threeDPerChar) result.have3DCharacter = true;
			    if (!layer.collapseTransformation) result.collapse = false;
			    if (layer.audioActive) result.audioActive = true;
			    if (layer.blendingMode !== BlendingMode.NORMAL) result.blendingMode = BlendingModes.getString(l.blendingMode);
			    if (layer.autoOrient) result.autoOrient = true;
			    
			    if (layer.hasTrackMatte) {
			    	
					switch(layer.trackMatteType){
					
						case TrackMatteType.ALPHA:
							result.trackType = "alpha";
							break;
							
						case TrackMatteType.ALPHA_INVERTED:
							result.trackType = "alpha_inverted";
							break;
							
						case TrackMatteType.LUMA:
							result.trackType = "luma";
							break;
							
						case TrackMatteType.LUMA_INVERTED:
							result.trackType = "luma_inverted";
							break;
					}
					
				}

	            break;
	    }
		
		if ( type === "[object TextLayer]" ){
			
		} else if ( type === "[object ShapeLayer]" ) {
			
		}
		
		return result;
	},
	
	getProperties : function( layer, context, fct, options ){
		
		var result = {};
		
		return result;
	},
	
	getColor : function( color ){
		
		var r = Math.floor( Math.min( Math.max( color[0], 0 ), 1 )*0xFF );
		var g = Math.floor( Math.min( Math.max( color[1], 0 ), 1 )*0xFF );
		var b = Math.floor( Math.min( Math.max( color[2], 0 ), 1 )*0xFF );
		
		return "#" + Math.floor( ( r<<16 ) + ( g<<8 ) + b ).toString(16);
		
	}
	
	
};
