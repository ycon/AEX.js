

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
			
			if ( layer.parent != null && JSON.parse(layer.comment || "{}").exportable !== false ) {
				
				parents.push(layer.parent);
	            
			}
			
			if (layer.selected){
				
				layer.selected = false;
				
			}
		}
		
		for ( var i = 1; i <= comp.layers.length; i++) {
			
			layer = comp.layers[i];
			layer_opt = JSON.parse(layer.comment || "{}");
			
			var exportable = layer_opt.exportable !== false;
			
			if ( exportable  && ( layer.enabled || layer.isTrackMatte || parents.indexOf(layer) !== -1 ) ){
				
				result.layers.push( this.getLayer( layer, layer_opt, project ) );
				
			};
			
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
		
		switch ( layer.autoOrient ){
			case AutoOrientType.ALONG_PATH:
				result.autoOrient = 'path';
				break;
			case AutoOrientType.CAMERA_OR_POINT_OF_INTEREST:
				if ( ! (layer instanceof CameraLayer) ) result.autoOrient = 'camera';
				break;
			default:
				if ( layer instanceof CameraLayer ) result.autoOrient = 'none';
		}
		
		var properties = this.getProperties( layer, project, false, options );
		
		for(var prop_name in properties){
			
	        result[prop_name] = properties[prop_name];
	        
	    }

		if (layer instanceof AVLayer || layer instanceof TextLayer || layer instanceof ShapeLayer){

			if (layer.adjustmentLayer) result.adjustmentLayer = true;
			if (layer.threeDLayer) result.is3D = true;
			if (layer.threeDPerChar) result.have3DCharacter = true;
			if (layer.collapseTransformation) result.collapse = true;
			//if (layer.audioActive) result.audioActive = true;
			if (layer.blendingMode !== BlendingMode.NORMAL) result.blendingMode = BlendingModes.getString(l.blendingMode);

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
			
			PropertyCleaner.cleanAVLayer( result, layer, project, options );
			
			if ( layer.source && !layer.nullLayer ){
				
		        result.source = this.getItem( layer.source, project );
		        
		    }
			
			
			
		}
		
		
		
		if ( layer instanceof TextLayer ){
			
			PropertyCleaner.cleanTextLayer(result, layer, project, options);
			
		} else if ( layer instanceof ShapeLayer ) {
			
		} else if (layer instanceof CameraLayer) {
			
			PropertyCleaner.cleanCameraLayer(result, layer, project, options);
			
		}
		
		return result;
	},
	
	getProperties : function( item, project, removeStyle, options ){
		
		var result,i;
		
		switch( item.propertyType ){
		
	        case PropertyType.INDEXED_GROUP:
	        	
	            result = [];
	            
	            for( i=1; i<=item.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( item.property(i), removeStyle, true ) ){
	                	
	                    result.push( this.getProperties( item.property(i), project, removeStyle, options ) );
	                    
	                }
	                
	            }
	            
	            break;
	            
	        case PropertyType.NAMED_GROUP:
	        	
	            result = {};
	            
	            for( i = 1; i <= item.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( item.property(i), removeStyle ) ){
	                	
	                    result[ this.legalizeName( item.property(i).name ) ] = this.getProperties( item.property(i), project, removeStyle, options );
	                    
	                }
	                
	            }
	            
	            if ( item.parentProperty ){
	            	
	                if ( item.parentProperty.propertyType == PropertyType.INDEXED_GROUP ){
	                	
	                    item.type = this.legalizeName(item.matchName);
	                    
	                }
	                
	            }
	            
	            break;
	            
	        default:
	        	
	        	var divider = (item.matchName.match(/opacity$|scale$|/gi)) ? 100 : 1;
	        	
	        	result = PropertyExporter.getProperty( item, project, options, divider );
	        
	    }

		return result;
	},
	
	getColor : function( color ){
		
		var r = Math.floor( Math.min( Math.max( color[0], 0 ), 1 )*0xFF );
		var g = Math.floor( Math.min( Math.max( color[1], 0 ), 1 )*0xFF );
		var b = Math.floor( Math.min( Math.max( color[2], 0 ), 1 )*0xFF );
		
		return "#" + Math.floor( ( r<<16 ) + ( g<<8 ) + b ).toString(16);
		
	},
	
	legalizeName : function( val ){
		
		var name = val.replace(/[^a-z0-9A-Z_]/g,"");
		
		return name[0].toLowerCase() +name.slice(1);

	},
	
	canParseProperty : function ( prop, removeStyle, deep ){
		
	    if (!deep){
	    	
	    	if (!prop.isModified 
	    		&& prop.name != "Position" 
	    		&& prop.name != "Anchor Point" 
	    		&& prop.name != "Zoom" 
	    		&& prop.name != "Point of Interest"  
	    		&& !removeStyle ) {
	    		return false;
	    		
	    	}
	    	
	    }
	    
	    if ( removeStyle && !( prop.canSetEnabled && prop.enabled ) ) {
	        return false;
	        
	    }
	     
	    if (prop.canSetEnabled){
	    	
	        if (prop.enabled == false){
	        	return false;
	        }
	        
	    }
	    
	    if (!prop.active){
	    	return false;
	    }
	    
	    if ( removeStyle ){
	    	return true;
	    }
	    
	    switch( prop.propertyType ){
	    
	        case PropertyType.INDEXED_GROUP:
	        case PropertyType.NAMED_GROUP:
	            
	            if ( !prop.numProperties ){
	            	return false;
	            }
	            
	            for( var i = 1; i <= prop.numProperties; i++ ){
	            	
	                if ( this.canParseProperty( prop.property(i), removeStyle, true ) ){
	                	return true;
	                	
	                }
	                
	            }
	            return false;
	            
	            break;
	            
	        default:
	    }
	    return true;
	}
	
	
};
