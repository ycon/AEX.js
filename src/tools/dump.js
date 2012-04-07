
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

    
// This the main function, the one that get the main object, serialize it, and save it.
function sceneDump(){
        
    var comp = app.project.activeItem;
   
    if (comp.toString() == "[object CompItem]"){

        context = {}
        context.items = {};
        context.root = parseSourceItem(comp,context);
        
        delete context.layer;
        delete context.layerItem;
        delete context.comp;
        delete context.compItem;
        
        var str;
        
        
        
        
        var f1 = File.saveDialog ("Save AEX Definition");
        f1.encoding = "UTF8";
        f1.open("w");
        var splitName = f1.name.split('.');
        $.writeln(splitName[splitName.length-1]);
        if (splitName[splitName.length-1] == "xml"){
            str = "<json><string><![CDATA["+ JSON.stringify(context, null) +"]]></string></json>";
        } else {
            str = JSON.stringify(context, null, " " );    
        }
        $.writeln (str);
        f1.write(str);
        f1.close();
       
	}
}


var TEXT_TYPE = 'text';
var SHAPE_TYPE = 'shape';
var CAMERA_TYPE = 'camera';

var COMP_TYPE = 'comp';
var SOLID_TYPE = 'solid';
var IMAGE_TYPE = 'image';
var VIDEO_TYPE = 'video';
var NULL_TYPE = 'null_obj';

function parseCompItem(comp,compItem,context){
    // Some setup in case we dump the rootcomp
    var oldComp = context.comp;
    var oldCompItem = context.compItem;

    context.compItem = compItem;
    context.comp = comp;
    
    // Lets get the properties
    comp.bgColor = color2number(compItem.bgColor);
    
    // the type
    comp.type = COMP_TYPE;
    
    // get the layers
    comp.layers = parseCompLayers(compItem.layers,context);
    
    // cleanup the context before sending it.
    context.comp = oldComp;
    context.compItem = oldCompItem;
    
    return comp
}

function parseCompLayers(layerColl,context){
    var comp = context.comp;
    var layers = [];
    // lets loop trhough the layers
    var l = layerColl.length;
    // A quick check to remove previously selected layers that may mess things up later
    // we will flag the layers that have children at the same time
    
    var parents = [];
	for(var i=1;i<=l;i++){
        if (layerColl[i].parent != null) {
            parents.push(layerColl[i].parent.index);
         }
		if (layerColl[i].selected){
			layerColl[i].selected = false;
		}
	}

    // The actual loop
    var layer;
    for(i=1;i<=l;i++){
        if (canParseLayer(layerColl[i],parents)){
            layers.push(parseLayerItem(layerColl[i],context));
        }
	}
    return layers;
}

function canParseLayer(layer,parents){
    /*
    if (layer.active) return true;
    if (layer.isTrackMatte) return true;
    if (parents.indexOf(layer.index) != -1) return true;
    
    return false;
    */
    return true;    
}

function parseLayerItem(layerItem,context){
    var layer  = {};
    var l = layerItem;
    
    // we'll need to clean the context afterward
    var oldLayer;
    var oldLayerItem;
    if (context.layer) oldLayer = context.layer;
    if (context.layerItem) oldLayerItem = context.layerItem;
    
    
    // lets set the common properties first
    layer.id = l.index;
    layer.name = l.name;
    if (l.parent != null) layer.parent = l.parent.index;
    layer.startTime = Math.round(l.startTime*context.compItem.frameRate);
    if (l.stretch != 100) layer.stretch = l.stretch;
    layer.inPoint = Math.round(l.inPoint*context.compItem.frameRate);
    layer.outPoint = Math.round(l.outPoint*context.compItem.frameRate);
    
    // parse ALL the properties now
    var tempProp = parseProperty(l,context,false);
    var propName;
    for(propName in tempProp){
        layer[propName] = tempProp[propName];
    }
    
    switch (layerItem.toString()){
        case "[object AVLayer]":
            setAvLayerProperties(layerItem,layer,context);
            break;
        case "[object TextLayer]":
            setAvLayerProperties(layerItem,layer,context);
            setTextLayerProperties(layerItem,layer,context);
            break;
        case "[object CameraLayer]":
            setCameraLayerProperties(layerItem,layer,context);
            break;
        case "[object LightLayer]":
            break;
        case "[object ShapeLayer]":
            setAvLayerProperties(layerItem,layer,context);
            layer.type = SHAPE_TYPE;
            break;
    }
    
    //Lets clean the context
    context.layer = oldLayer;
    context.layerItem = oldLayerItem;
    
    
    return layer;
}

function setCameraLayerProperties(l,layer,context){
    layer.type = CAMERA_TYPE;
    
    //lets do some cleanups
    if (layer.transform){
        delete layer.transform.xPosition;
        delete layer.transform.yPosition;
        delete layer.transform.zPosition;
        
        
        layer.transform.X = layer.transform.positionX;
        delete layer.transform.positionX;
        layer.transform.Y = layer.transform.positionY;
        delete layer.transform.positionY;
        layer.transform.Z = layer.transform.positionZ;
        delete layer.transform.positionZ;
        

        // Sorry, I don't like inconsistent naming
        layer.transform.rotationX = layer.transform.xRotation;
        layer.transform.rotationY = layer.transform.yRotation;
        layer.transform.rotationZ = layer.transform.zRotation;
        
        if (layer.transform.pointofInterestX) layer.transform.targetX = layer.transform.pointofInterestX;
        if (layer.transform.pointofInterestY) layer.transform.targetY = layer.transform.pointofInterestY;
        if (layer.transform.pointofInterestZ) layer.transform.targetZ = layer.transform.pointofInterestZ;
        
        delete layer.transform.pointofInterestX;
        delete layer.transform.pointofInterestY;
        delete layer.transform.pointofInterestZ;
        
        delete layer.transform.xRotation
        delete layer.transform.yRotation;
        delete layer.transform.zRotation;
        delete layer.transform.opacity;
        
        if (layer.cameraOptions){
            layer.transform.zoom = layer.cameraOptions.zoom;
        }
    }
    delete layer.cameraOptions;
}

function setAvLayerProperties(l,layer,context){

    // set the common AVLayer properties
    layer.width = l.width;
    layer.height = l.height;
    
    // properties can make a heavy file, so lets only get values when it matters.
    if (l.adjustmentLayer) layer.adjustmentLayer = true;
    if (l.threeDLayer) layer.is3D = true;
    if (l.threeDPerChar) layer.have3DCharacter = true;
    if (!l.collapseTransformation) layer.collapse = false;
    if (l.timeRemapEnabled) {
        layer.timeRemapEnabled = true;
    } else {
        delete layer.timeRemap;
    }
    if (l.hasAudio){
        layer.hasAudio = true;
    } else {
        delete layer.audio;
    }
    if (l.audioActive) layer.audioActive = true;
    if (l.blendingMode != BlendingMode.NORMAL) layer.blendingMode = getBlendingModeString(l.blendingMode);
    //if (l.isTrackMatte) layer.isTrackMatte = true;
    if (l.autoOrient) layer.autoOrient = true;
    
    if (l.hasTrackMatte) {
		layer.trackMask = l.index-1;
		switch(l.trackMatteType){
			case TrackMatteType.ALPHA:
				layer.trackType = "alpha";
				break;
			case TrackMatteType.ALPHA_INVERTED:
				layer.trackType = "alpha_inverted";
				break;
			case TrackMatteType.LUMA:
				layer.trackType = "luma";
				break;
			case TrackMatteType.LUMA_INVERTED:
				layer.trackType = "luma_inverted";
				break;
		}
	}
    
    // Masks have added properties. We can add those now
    var i;
    for(i=1;i<=l.Masks.numProperties;i++){
        setMaskProperties(layer.masks[i-1],l.Masks.property(i));
    }
    
    // if the layer have a source or is not a Null, parse it
    if (l.source != null && !l.nullLayer){
        layer.source = parseSourceItem(l.source,context);
    }
    
    // OK, this is where we will clean some common AvLayer properties
    
    // clean up layer styles. All layer style are "on" when no style are present
    // this is problematic
    delete layer.layerStyles
    // we then parse styles using flags
    
 
    if (canParseProperty(l.property("Layer Styles"),true)){
       layer.layerStyles =  parseProperty(l.property("Layer Styles"),context,true);
       // lets not forget "blending option" Ð An expeption whithin an expeption...
       layer.layerStyles.blendingOptions = parseProperty(l.property("Layer Styles").property("Blending Options"),context);
    }

    if (layer.effects){
        for(i=0;i<layer.effects.length;i++){
            layer.effects[i].type = layer.effects[i].type.replace("aDBE","");
        }
    }

    // AE creates a different position object when we "separate dimensions" we can remove those values
    
    if (layer.transform){
        delete layer.transform.xPosition;
        delete layer.transform.yPosition;
        delete layer.transform.zPosition;


        layer.transform.X = layer.transform.positionX;
        delete layer.transform.positionX;
        layer.transform.Y = layer.transform.positionY;
        delete layer.transform.positionY;
        if (layer.is3D){
            layer.transform.Z = layer.transform.positionZ;
        }
        delete layer.transform.positionZ;
        
        layer.transform.anchorX = layer.transform.anchorPointX;
        delete layer.transform.anchorPointX;
        layer.transform.anchorY = layer.transform.anchorPointY;
        delete layer.transform.anchorPointY;
        if (layer.is3D){
            layer.transform.anchorZ = layer.transform.anchorPointZ;
        }
        delete layer.transform.anchorPointZ;
    
        if (layer.is3D){
            // Sorry, I don't like inconstistent naming
            if(layer.transform.xRotation) layer.transform.rotationX = layer.transform.xRotation;
            if(layer.transform.yRotation)layer.transform.rotationY = layer.transform.yRotation;
            if(layer.transform.zRotation)layer.transform.rotationZ = layer.transform.zRotation;
            
            
            
            delete layer.transform.xRotation
            delete layer.transform.yRotation;
            delete layer.transform.zRotation;
        } else {
            // We don't need 3D related properties when we deal with a 2D layer
            delete layer.transform.positionZ;
            delete layer.transform.anchorPointZ;
            delete layer.transform.scaleZ;
            delete layer.transform.xRotation;
            delete layer.transform.yRotation;
            delete layer.transform.orientation;
        }
    


        // Flash prefers its opacity, no... "alpha" and scale to be between 0 to 1.
        if (layer.transform.opacity != null) layer.transform.alpha = divideProperty(layer.transform.opacity,100);
        delete layer.transform.opacity;
        if (layer.transform.scaleX != null) layer.transform.scaleX = divideProperty(layer.transform.scaleX,100);
        if (layer.transform.scaleY != null) layer.transform.scaleY = divideProperty(layer.transform.scaleY,100);
        if (layer.is3D){
            if (layer.transform.scaleZ != null) layer.transform.scaleZ = divideProperty(layer.transform.scaleZ,100);
        }
    }
    // We not going to implement 3D lighting anyway
    delete layer.materialOptions
}


function setTextLayerProperties(l,layer,context){
    layer.type = TEXT_TYPE;
        
    var prop_array;
    if (layer.name[0] == "["){
        // the motion designer actually took time to set a text layer properly
        prop_array = layer.name.split("][");
        prop_array[0] = prop_array[0].split("[")[1];
        prop_array[prop_array.length-1] = prop_array[prop_array.length-1].split("]")[0];
    } else {
        // Somebody have forgoten something somewhere...
        prop_array = [legalizeName(layer.name).substr(0,12),'t'];
    }

    // We complement Textdocument properties AE refuse to give us with user generated ones
    layer.name = prop_array[0];
    layer.text.sourceText.valign = prop_array[1];
    layer.text.sourceText.text = "["+layer.text.sourceText.text+"]";
    switch (prop_array[1]){
		case "b":
		case "bottom":
			layer.text.sourceText.valign = "bottom";
			break;
		case "m":
		case "middle":
		case "c":
		case "center":
			layer.text.sourceText.valign = "middle";
			break;
		default:
			layer.text.sourceText.valign = "top";
			break;	
	}
    if (prop_array[2] != null) layer.text.sourceText.leading = prop_array[2];
    
    
    // We need a bounding box for the text to resize properly during localization
    
    var bounds;
    if (l.Masks.numProperties >= 1){
        // Good, the motion designer haven't forget to set a bounding box
        bounds = getMaskBounds(l.Masks.property(1));
    } else {
        // Grrr!! No bounding box set! Lets create one...
        l.selected = true;
        app.executeCommand(2367); // 2367 : app.findMenuCommandId("New Mask")
        var myMask = l.Masks.property(l.Masks.numProperties);
        bounds = getMaskBounds(myMask);
        myMask.remove();
        l.selected = false;
        
        // We need to make the bounding box bigger
        if (layer.text.sourceText.align == 'right'){
            bounds.x -= bounds.width*.5;
        } else if (layer.text.sourceText.align == 'center'){
            bounds.x -= bounds.width*.25;
        }
        if (layer.text.sourceText.valign == 'bottom'){
            bounds.y -= bounds.height;
            bounds.y += layer.text.sourceText.fontSize / 3;
        } else if (layer.text.sourceText.align == 'middle'){
            bounds.y -= bounds.height*.5;
        } else {
            bounds.y -= layer.text.sourceText.fontSize / 3;
        }
        bounds.width *= 1.5;
        bounds.height *= 2;
    }
    layer.text.bounds = bounds;
    
    // We remove "pathOptions" when we don't need it
//    if (layer.text.pathOptions.path == 0) delete layer.text.pathOptions;
    
    // Animators creates way too much data
    var a = layer.text.animators;
    if (typeof(a) == 'object'){
        if (a.length >= 1){
            // OK, we have animators
            
            var i, p,tA;
            var animators = [];
            
            // loopss through the properties and remove the one that have a default value
            for(i=0;i<a.length;i++){
                p = a[i].properties;
                
                    tP = {};
                tA = {};
                var propName;
                var goodProps = 0;
                if (p){
                    for (propName in p){
                        switch (propName){
                            case 'anchorPointX':
                            case 'anchorPointY':
                            case 'anchorPointZ':
                            case 'positionX':
                            case 'positionY':
                            case 'positionZ':
                            case 'skew':
                            case 'skewAxis':
                            case 'xRotation':
                            case 'yRotation':
                            case 'zRotation':
                            case 'rotation':
                            case 'blurX':
                            case 'blurY':
                            case 'trackingAmount':
                            case 'lineAnchor':
                            case 'lineSpacingX':
                            case 'lineSpacingY':
                            case 'characterValue':
                            case 'characterOffset':
                                if (p[propName] != 0){
                                    goodProps += 1;
                                    tP[propName] = p[propName];
                                }
                                break;
                            case 'opacity':
                            case 'scaleX':
                            case 'scaleY':
                            case 'scaleZ':
                                if (p[propName] != 100){
                                    goodProps += 1;
                                    tP[propName] = divideProperty(p[propName],100);
                                }
                                break;
                            case 'characterAlignment':
                                if (p[propName] != 50){
                                    goodProps += 1;
                                    tP[propName] = divideProperty(p[propName],100);
                                }
                                break;
                            case 'trackingType':
                            case 'characterRange':
                                if (p[propName] != 1){
                                    goodProps += 1;
                                    tP[propName] = p[propName];
                                }
                                break;
                            default:
                        }
                    }
                }
                if (goodProps > 0){
                    tA.selectors = a[i].selectors;
                    tA.properties = tP;
                    animators.push(tA);
                }
            }
            if (animators.length){
               layer.text.animators = animators;
            } else {
               delete layer.text.animators;
            }
        } else {
            delete layer.text.animators;
        }
    }
}

function getMaskBounds(m_obj){
		var myVertices  = m_obj.maskShape.value.vertices;
		var max_x = -1000000000000000000;
		var max_y = -1000000000000000000;
		var ret_obj = {};
		ret_obj.x = 1000000000000000000;
		ret_obj.y = 1000000000000000000;
		for(var i=0;i<myVertices.length;i++){
			ret_obj.x = Math.min(ret_obj.x,myVertices[i][0]);
			ret_obj.y = Math.min(ret_obj.y,myVertices[i][1]);
			max_x = Math.max(max_x,myVertices[i][0]);
			max_y = Math.max(max_y,myVertices[i][1]);
		}
		ret_obj.width = (max_x-ret_obj.x).toFixed(2);
		ret_obj.height = (max_y-ret_obj.y).toFixed(2);
		ret_obj.x = ret_obj.x.toFixed(2);
		ret_obj.y = ret_obj.y.toFixed(2);

		return ret_obj;
}

function setMaskProperties(mask,maskItem){
    mask.maskMode = parseMaskMode(maskItem.maskMode);
    mask.inverted = maskItem.inverted;
    delete mask.type;
}

function divideProperty(prop,divider){
    
    if (typeof(prop) == 'object'){
        var i;
        var temp = [];
        for(i=0;i<prop.length;i++){
            if (typeof(prop[i]) == 'object'){
                temp.push([prop[i][0]/divider,prop[i][1]]);
            } else {
                temp.push(prop[i]/divider);
            }
        }
        return temp;
    } else {
        return prop / divider;
    }

}

// parsePorperty loop through all the properties a layer have
// This is too much information. We will have to do some clean up later
function parseProperty(propItem,context,removeStyle){
    var p = propItem;
    var prop;
    var i;
    
    switch(p.propertyType){
        case PropertyType.INDEXED_GROUP:
            prop = [];
            for(i=1;i<=p.numProperties;i++){
                if (canParseProperty(p.property(i),removeStyle,true)){
                    prop.push(parseProperty(p.property(i),context));
                }
            }
            break;
        case PropertyType.NAMED_GROUP:
            prop = {};
            for(i=1;i<=p.numProperties;i++){
                if (canParseProperty(p.property(i),removeStyle)){
                    
                    var legalName = legalizeName(p.property(i).name);
                    
                    var child = p.property(i);
                    var parsedChild = parseProperty(child,context);
                    // We want to flaten multi-dimentional properties
                    switch (child.propertyValueType){
                        case PropertyValueType.ThreeD_SPATIAL:
                        case PropertyValueType.ThreeD:

                            prop[legalName+"X"] = parsedChild.x;
                            prop[legalName+"Y"] = parsedChild.y;
                            prop[legalName+"Z"] = parsedChild.z;                                

                            break;
                        case PropertyValueType.TwoD_SPATIAL:
                        case PropertyValueType.TwoD: 

                            prop[legalName+"X"] = parsedChild.x;
                            prop[legalName+"Y"] = parsedChild.y;
                            prop[legalName+"Z"] = parsedChild.z;                                
                            
                            break;
                        default:
                            prop[legalName] = parsedChild;
                    }
                }
            }
            if (p.parentProperty){
                if (p.parentProperty.propertyType == PropertyType.INDEXED_GROUP){
                    prop.type = legalizeName(p.matchName);
                }
            }
            break;
        default:

//$.writeln(p.name, p.propertyValueType,p.elided,p.active, p.enabled, p.isModified);
        
            switch (p.propertyValueType){
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.ThreeD:
                    prop = {};
                    prop.x = parsePropertyValue(p,context,getNumber,{index:0});
                    prop.y = parsePropertyValue(p,context,getNumber,{index:1});
                    prop.z = parsePropertyValue(p,context,getNumber,{index:2});
                    break;
                case PropertyValueType.TwoD_SPATIAL:
                case PropertyValueType.TwoD:
                    prop = {};
                    prop.x = parsePropertyValue(p,context,getNumber,{index:0});
                    prop.y = parsePropertyValue(p,context,getNumber,{index:1});
                    break;
                case PropertyValueType.MARKER:
                    prop = parseKeys(p,context);
                    break;
                case PropertyValueType.LAYER_INDEX:
                case PropertyValueType.MASK_INDEX:
                case PropertyValueType.OneD:
                    prop = parsePropertyValue(p,context,getNumber);
                    break;
                case PropertyValueType.COLOR:
                    prop = parsePropertyValue(p,context,getColor);
                    break;
                case PropertyValueType.SHAPE:
                    prop = parseShape(p,context);
                    break;
                case PropertyValueType.TEXT_DOCUMENT:
                    prop = parseText(p,context);
                    break;
                    
            }
            
    }
    return prop;
}


// canParseProperty determine if a property should be included in the parsing
// agr number 2 is a flag especially set for "layer styles"
function canParseProperty(prop,removeStyle,deep){
    
    if (deep != true){
     if (!prop.isModified && prop.name != "Position" && prop.name != "Anchor Point" && prop.name != "Zoom" && prop.name != "Point of Interest"  && removeStyle!=true ) return false;
    }
    
    if (removeStyle && !(prop.canSetEnabled && prop.enabled)) {
        return false;
    }
     
    if (prop.canSetEnabled){
        if (prop.enabled == false) return false;
    }
    
    if (!prop.active) return false;
    
    if (removeStyle==true) return true;
    
    switch(prop.propertyType){
        case PropertyType.INDEXED_GROUP:
        case PropertyType.NAMED_GROUP:
            
            if (prop.numProperties == 0) return false;
            var i;
            var count = 1;
            for(i=1;i<=prop.numProperties;i++){
                if ( canParseProperty(prop.property(i),removeStyle,true)) return true; 
            }
            return false;
            break;
        default:
    }
    return true;
}

function parseKeys(propItem,context){
    var p = propItem;
    return 0;
}

function parseText(p,context){
    txtDoc = p.valueAtTime(0,false);
    var textObj = {};
    
    // remove carriage returns and double spaces
    var txt = txtDoc.toString().replace('[\r]', ' ', 'g');
	txt = txt.replace(' +', ' ', 'g');
	txt = txt.replace(' +$', '', 'g');
    
    textObj.text = txt;
    textObj.fontSize = txtDoc.fontSize;
    textObj.color = color2number(txtDoc.fillColor);
    textObj.font = txtDoc.font;
    
    if (txtDoc.tracking) textObj.tracking = txtDoc.tracking;
    if (txtDoc.leading) textObj.leading = txtDoc.leading/textObj.fontSize;
    switch (txtDoc.justification){
		case ParagraphJustification.LEFT_JUSTIFY:
			textObj.align = "left";
			break;
		case ParagraphJustification.RIGHT_JUSTIFY:
			textObj.align = "right";
			break;
		case ParagraphJustification.CENTER_JUSTIFY:
			textObj.align = "center";
			break;	
    }
    return textObj;
}


function color2number(prop){
	var r = Math.floor(Math.min(Math.max(prop[0],0),1)*0xFF);
	var g = Math.floor(Math.min(Math.max(prop[1],0),1)*0xFF);
	var b = Math.floor(Math.min(Math.max(prop[2],0),1)*0xFF);
	return Math.floor((r<<16)+(g<<8)+b);
}

function parseShape(shape_prop,context){
	var values = [];
	var tempValue, value;
    var comp = context.compItem;
	var l = shape_prop.value.vertices.length;
	for (var i = 0;i<l;i++){
        value = [];
        tempValue = [];
        
        value.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'vertices',position:i,index:0}));
        value.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'vertices',position:i,index:1}));
        tempValue.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'inTangents',position:i,index:0}));
        tempValue.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'inTangents',position:i,index:1}));
        tempValue.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'outTangents',position:i,index:0}));
        tempValue.push(parsePropertyValue(shape_prop, context, getShapeNumber, {propName:'outTangents',position:i,index:1}));

        if (tempValue[0] || tempValue[1] || tempValue[2] || tempValue[3]){
            
            value = value.concat(tempValue);
        } else {
         
        }
        values.push(value);
	}
    var obj = {};
    obj.closed = shape_prop.valueAtTime(0,false)['closed'];
    obj.values = values
	return obj;
}

function getNumber(prop,time,context,options){
        
    var precision = options.precision || 100;
    var index = options.index;
    var res;
    if (index != null){
        res = prop.valueAtTime(time,false)[index];
    } else {
        res = prop.valueAtTime(time,false);
    }
    if(res < 10){
        precision *= 100;
    } else if (res < 100) {
        precision *= 10;
    }
    res = Math.round(res*precision)/precision;

    return res;
}

function getShapeNumber(prop,time,context,options){
    var precision = options.precision || 100;
    var propName = options.propName;
    var position = options.position;
    var index = options.index;
    return Math.round(prop.valueAtTime(time,false)[propName][position][index]*precision)/precision;
}

function getColor(prop,time,context,options){
    return color2number(prop.valueAtTime(time,false));
}


// parsePropertyValue loop through a given property and returns a flaten list a property at
// every frame. It calculate the value returned by the expression as well.
// Beware, this does not export its key frames. It merely pack a property value trough time.
// An actual keyframes export will appear in later versions when the property will not have expressons.
function parsePropertyValue(prop,context,fct,options){
        var value;
        var comp = context.compItem;
        var temp_val;
        var old_val = null;
        var fixed_duration = 0;
        var end_time = comp.duration;
        if (options == null){
            options = {};
        }
    
		if (prop.isTimeVarying){
            value = [];
			for (var i = 0;i<end_time;i+=comp.frameDuration){
					temp_val = fct(prop,i,context,options);
				if (temp_val == old_val){
					fixed_duration ++;
				} else if (old_val != null) {
					if (fixed_duration != 0){
                        value[value.length-1] = [value[value.length-1],fixed_duration];
					}
                     value.push(temp_val);
					fixed_duration = 0;
				} else {
                     value.push(temp_val);
				}
				old_val = temp_val;
			}
		}
		temp_val = fct(prop,end_time,context,options);
		if (prop.isTimeVarying){
			if (temp_val != old_val){
				if (fixed_duration !=0){
					value[value.length-1] = [value[value.length-1],fixed_duration];
				} else {
                    value.push(temp_val);
                }
			}
		} else {
			value = temp_val;
		}
    
    
//$.write(prop.name, " ", value, "\n");
    
	return value;
	
}


function legalizeName(val){
    var prop_name = val.replace(/[^a-z0-9A-Z_]/g,"");
	var prop_name_split = prop_name.split("");
	prop_name_split[0] = prop_name_split[0].toLowerCase();
	prop_name = prop_name_split.join("");
    
    return prop_name;
}

function parseSourceItem(sourceItem,context){
    var s = sourceItem;

    if (context.items[s.id] == null){
        var source = {};
        var fileLinkSplit;
        source.name = s.name;
        source.id = s.id;
        source.type = s.typeName;
        switch(s.typeName){
            case 'Composition':
                setAVItemProperties(source,s,context);
                parseCompItem(source,s,context);
                break;
            case 'Footage':
                setAVItemProperties(source,s,context);
                if (s.mainSource.isStill){
                    delete source.duration;
                    delete source.frameRate;
                    if (s.mainSource.toString() == '[object FileSource]'){
                       source.type = IMAGE_TYPE;
                       fileLinkSplit = s.mainSource.file.toString().split("/");
                       source.src = fileLinkSplit[fileLinkSplit.length-1];
                    } else if (s.mainSource.toString() == '[object SolidSource]'){
                       source.type = SOLID_TYPE;  
                       source.color = color2number(s.mainSource.color);
                    } else {
                       source.type = SOLID_TYPE; 
                    }
                } else {
                    source.type = VIDEO_TYPE;
                    fileLinkSplit = s.mainSource.file.toString().split("/");
                    source.src = fileLinkSplit[fileLinkSplit.length-1];
                }
                break;
            default:
            
        }
        context.items[s.id] = source;
    }

    return s.id;
}



function setAVItemProperties(av,avItem,context){ 
    av.width = avItem.width;
    av.height = avItem.height;
    av.frameRate = avItem.frameRate;
    av.duration = avItem.duration;
}

function parseMaskMode(prop){
		switch(prop){
			case MaskMode.NONE:
				return 'none';
				break;
			case MaskMode.ADD:
				return 'add';
				break;
			case MaskMode.SUBTRACT:
				return 'subtract';
				break;
			case MaskMode.INTERSECT:
				return 'intersect';
				break;
			case MaskMode.LIGHTEN:
				return 'lighten';
				break;
			case MaskMode.DARKEN:
				return 'darken';
				break;
			case MaskMode.DIFFERENCE:
				return 'difference';
				break;
			default:
				return 'add';
		}
}


function getBlendingModeString(val){
		switch(val){

			case BlendingMode.ADD:
				return "add";
				break;
			case BlendingMode.COLOR_BURN:
				return "subtract";
				break;
			case BlendingMode.DARKEN:
				return "darken";
				break;
			case BlendingMode.DIFFERENCE:
				return "difference";
				break;
			case BlendingMode.HARD_LIGHT:
				return "hardlight";
				break;
			case BlendingMode.LIGHTEN:
				return "lighten";
				break;
			case BlendingMode.LINEAR_LIGHT:
				return "hardlight"
				break;
			case BlendingMode.MULTIPLY:
				return "multiply";
				break;
			case BlendingMode.NORMAL:
				return "normal";
				break;
			case BlendingMode.OVERLAY:
				return "overlay";
				break;
			case BlendingMode.SCREEN:
				return "screen";
				break;
			case BlendingMode.SILHOUETE_ALPHA:
				return "erase";
				break;
			case BlendingMode.STENCIL_ALPHA:
				return "alpha";
				break;
			default:
				return "normal";
				break;
		}
}





sceneDump();