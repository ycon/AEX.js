
var PropertyExporter = {
		
	getProperty : function( prop, project, options , force_separation){
		
		var keys = [],
			result,
			i,
			val,old_val,
			time,
			old_time = 0,
			old_time_dif = 0,
			type = prop.propertyValueType,
			is_marker = type === PropertyValueType.MARKER,
			is_text = type === PropertyValueType.TEXT_DOCUMENT,
			is_two = type === PropertyValueType.TwoD,
			is_three = type === PropertyValueType.ThreeD,
			layer = prop.propertyGroup(prop.propertyDepth),
			dur = layer.containingComp.frameDuration;
		

		
		if (prop.isTimeVarying){
			
			if ( (options.bake || prop.expressionEnabled) && !(is_marker || is_text) ) {

				old_val = val = [];
				keys = [];
				
				for (i = layer.inPoint; i <= layer.outPoint; i+=dur) {
					
					val = this.getSimpleProperty(prop, prop.valueAtTime(i, true), options);
					
					if (JSON.stringify(val) !== JSON.stringify(old_val)){
						
						time = prop.keyTime(i)-old_time;
						
						if (!keys.length){
							keys.push([val,time]);
						} else if (time === old_time_dif) {
							keys.push(val);
						} else {
							keys.push([val,time]);
						}

						old_time = i;
						old_time_dif = time;
						old_val = val;
					}
				}

				return keys;
				
			} else if (is_two || is_three) {
				
				result = {
					x: [],
					y: []
				};
				
				if (is_three) {
					result.z = [];
				}
				
				for (i = 1; i <= prop.numKeys; i++ ) {
					
					result.x.push(this.getKey(prop,i,options,0,'x'));
					result.y.push(this.getKey(prop,i,options,1,'y'));
					
					if (result.z) {
						result.z.push(this.getKey(prop,i,options,2,'z'));
					}
				}
				
				return result;
				
			} else {
				keys = [];
				for (i = 1; i <= prop.numKeys; i++ ) {
					keys.push(this.getKey(prop,i,options));
				}
				return keys;
			}
				
		} else {
			return this.getSimpleProperty(prop, prop.valueAtTime(0, true), options);
		}
		
	},
	
	
	getKey : function(prop, index, options, ease_index, name){
		
		var time = prop.keyTime(index),
			offset = (index > 1) ? time - prop.keyTime(index-1) : time,
			value = this.getSimpleProperty(prop, prop.keyValue(index), options),
			in_type = prop.keyInInterpolationType(index),
			out_type = prop.keyOutInterpolationType(index),
			bezier_type = KeyframeInterpolationType.BEZIER,
			hold_type = KeyframeInterpolationType.HOLD,
			key,in_anchor,out_anchor;
		
		if (!ease_index) {
			ease_index = 0;
		}
		
		if (name && value.hasOwnProperty(name)){
			value = value[name];
		}
		
		if (in_type === hold_type && out_type === hold_type){
				
			if (index > 2 && (offset === prop.keyTime(index-1) - prop.keyTime(index-2)) ){
				return value;
			} else {
				return [value, offset];
			}
				
		} else {
			
			key = {
				v:value,
				d:offset,
				e:{
					i: 0,
					o: 0,
				}
			};
			
			if (in_type === bezier_type){
				
				key.e.i = this.getEaseData(
					prop.keyInTemporalEase(index), 
					(index > 1) ? this.getEaseLength(prop, index-1, index, ease_index) : null,
					true, ease_index
				);
				
			} else if (in_type !== hold_type) {
				delete key.e.i;
			}
			
			if (out_type === bezier_type){

				key.e.o = this.getEaseData(
					prop.keyOutTemporalEase(index), 
					(index < prop.numKeys) ? this.getEaseLength(prop, index, index+1, ease_index) : null,
					false, ease_index
				);
				
			} else if (out_type !== hold_type) {
				delete key.e.o;
			}
			
			if (key.e.i === undefined && key.e.o === undefined){
				delete key.e;
			}
			
			if (prop.isSpatial) {
				
				in_anchor = prop.keyInSpatialTangent(index);
				out_anchor = prop.keyOutSpatialTangent(index);
				
				
				
				
				key.t = {};
				
				
				if (index > 1 && this.isCurve(prop,index,index-1)){
					
					key.t.i = [round(in_anchor[0],0.01), round(in_anchor[1],0.01)];
					if (in_anchor.length >= 3){
						key.t.i.push(round(in_anchor[2],0.01));
					}
				}
				
				if (index < prop.numKeys && this.isCurve(prop,index+1,index)){
					
					key.t.o = [round(out_anchor[0],0.01), round(out_anchor[1],0.01)];
					if (out_anchor.length >= 3){
						key.t.o.push(round(out_anchor[2],0.01));
					}
				}
				
				if (!key.t.i && !key.t.o){
					delete key.t;
				}

			}
			
			return key;
			
		}
		
		
	},
	
	getEaseData : function(data, length, to_invert, index){
		
		var x = data[index].influence /100,
			y = data[index].speed * x;
		
		if (!index) {
			index = 0;
		}
		
		if (length){
			y = (data[index].speed * x)/length;
		}
		
		if (to_invert){
			x = 1-x;
			y = 1-y;
		}
		
		return [round(x,0.001), round(y,0.001)];

	},
	
	isCurve : function(prop,key,next_key){
		var ae = global.AE,
			p_1,t_1,t_2,p_2,c_1,c_2,
			start_val = prop.keyValue(key),
			end_val = prop.keyValue(next_key),
			l_1,l_2;
			
		if (key < next_key){
			t_1 = prop.keyOutSpatialTangent(key);
			t_2 = prop.keyInSpatialTangent(next_key);
		} else {
			t_1 = prop.keyInSpatialTangent(key);
			t_2 = prop.keyOutSpatialTangent(next_key);
		}
		
		
		p_1 = new ae.Vector( start_val[0], start_val[1], start_val[2]);
		c_1 = new ae.Vector( t_1[0], t_1[1], t_1[2]).add(p_1);
		p_2 = new ae.Vector( end_val[0], end_val[1], end_val[2]);
		c_2 = new ae.Vector( t_2[0], t_2[1], t_2[2]).add(p_2);
		
		
		l_1 = p_1.distance(p_2);
		l_2 = p_1.distance(c_1)+c_1.distance(c_2)+c_2.distance(p_2);
		return (l_2/l_1) > 1.03;
	},
	
	getEaseLength : function (prop,key,next_key,index){
		
		var ae = global.AE,
			p_1,c_1,c_2,p_2,
			start_val = prop.keyValue(key),
			end_val = prop.keyValue(next_key),
			type = prop.propertyValueType;

		if (!index) {
			index = 0;
		}
		
		if (prop.propertyValueType === PropertyValueType.OneD){
			
			return end_val - start_val;
			
		} else if (	type === PropertyValueType.TwoD_SPATIAL || type === PropertyValueType.ThreeD_SPATIAL) {
			
			p_1 = new ae.Vector( start_val[0], start_val[1], start_val[2]);
			
			if (key < next_key){
				c_1 = prop.keyOutSpatialTangent(key);
				c_2 = prop.keyInSpatialTangent(next_key);
			} else {
				c_1 = prop.keyInSpatialTangent(key);
				c_2 = prop.keyOutSpatialTangent(next_key);
			}
			
			p_2 = new ae.Vector( end_val[0], end_val[1], end_val[2]);
			
			return new ae.CubicCurve(
				p_1,
				new ae.Vector(c_1[0],c_1[1],c_1[2]).add(p_1),
				new ae.Vector(c_2[0],c_2[1],c_2[2]).add(p_2),
				p_2
			).length();
			
		} else if (prop.propertyValueType === PropertyValueType.SHAPE) {
			
			return 1;
			
		} else {
			
			return end_val[index] - start_val[index];
			
		}
	},
	
	getSimpleProperty : function( prop, value, options){
		
		var divider = (prop.unitsText === "percent") ? 100 : 1;
		var presision = 0.0001/divider;
		
        switch (prop.propertyValueType){
        	case PropertyValueType.MARKER:
        		return this.getMarker(value);
        		break;
	        case PropertyValueType.SHAPE:
	        	return this.getShape(value);
	        	break;
	        case PropertyValueType.TEXT_DOCUMENT:
	        	return this.getText(value, prop, options);
	            break;
	        case PropertyValueType.OneD:
            	return round(value/divider,presision);
            	break;
	        case PropertyValueType.TwoD_SPATIAL:
            case PropertyValueType.TwoD:
            	return {
            		x:round(value[0]/divider,presision),
            	    y:round(value[1]/divider,presision)
            	};
            	break;
            case PropertyValueType.ThreeD_SPATIAL:
            case PropertyValueType.ThreeD:
            	return {
            		x: round(value[0]/divider,presision),
            	    y: round(value[1]/divider,presision),
            	    z: round(value[2]/divider,presision)
            	};
            	break;
	        default :
	        	return null;
	    }
        
	},
	
	getMarker : function(val){
		
		var obj = {
			comment: val.comment,
			duration: val.duration
		};
		
		if (val.chapter){
			obj.chapter = val.chapter;
		}
		
		if (val.cuePointName){
			obj.name = val.cuePointName;
		}
		
		if (val.eventCuePoint){
			obj.event = val.eventCuePoint;
		}
		
		if (val.url){
			obj.url = val.url;
		}
		
		if (val.frameTarget){
			obj.target = val.frameTarget;
		}
		
		var params = val.getParameters();
		
		if (params){
			obj.params = params;
		}
		
		return obj;
	},
	
	getShape : function(val){
		
		var obj = {
			
		};
		
		if (!val.closed){
			obj.closed = false;
		}
		
		var data = [];
		var v,in_data,out_data;
		
		for ( var i = 0; i < val.vertices.length; i++) {
			
			v = val.vertices[i];
			in_data = val.inTangents[i];
			out_data = val.outTangents[i];
			
			if (in_data[0] || in_data[1] || out_data[0] || out_data[1]){
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01),
				           round(in_data[0],0.01),
				           round(in_data[1],0.01),
				           round(out_data[0],0.01),
				           round(out_data[1],0.01)
				           ]);
			} else {
				data.push([
				           round(v[0],0.01),
				           round(v[1],0.01)
				           ]);
			}
		}
		
		obj.data = data;
		
		return obj;
	},

	getText : function(val, prop, options){
		
		var obj = {
			text: val.text,
			fontFamily: val.font,
			fontSize: val.fontSize,
			textColor: ProjectExporter.getColor(val.fillColor)
		};
		
		if (options.valign && options.valign !== 'top'){
			obj.verticalAlign = options.valign;
		}
		
		if (val.justification === ParagraphJustification.RIGHT_JUSTIFY) {
			obj.textAlign = 'right';
		} else if (val.justification === ParagraphJustification.CENTER_JUSTIFY) {
			obj.textAlign = 'center';
		} else {
			obj.textAlign = 'left';
		}

		if (val.tracking){
			obj.letterSpacing = val.tracking;
		}
		
		if (options.leading){
			obj.lineHeight = options.leading/val.fontSize;
		}
		
		if (val.isParaText){
			obj.width = val.boxTextSize[0];
			obj.height = val.boxTextSize[1];
		}
		
		return obj;
	}
};
