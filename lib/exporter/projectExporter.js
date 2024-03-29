﻿
/*global define AutoOrientType CameraLayer AVLayer TextLayer ShapeLayer BlendingMode TrackMatteType PropertyType*/

define([
    'extern/json',
    './blendingModes',
    './propertyCleaner',
    './propertyExporter'
], function (
    json,
    blendingModes,
    propertyCleaner,
    propertyExporter
) {

    function getProject (comp) {

        var project = {
            items : {}
        };

        project.root = getItem(comp,project);

        return project;
    }

    function getItem ( item, project ) {

        if ( !project.items[item.id] ){

            var options = json.parse(item.comment || "{}");

            var result = {
                name : item.name,
                id : item.id,
                type : item.typeName,
                width : item.width,
                height : item.height
            };

            switch (item.typeName) {
            case 'Composition':
                setComp( item, result, project );
                break;
            case 'Footage':
                var source = item.mainSource;
                if (source.toString() === '[object FileSource]') {
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
                    if (source.toString() === '[object SolidSource]'){
                        result.color = propertyExporter.getColor(source.color);
                    }
                }
                break;
            }

            project.items[item.id] = result;
        }

        return item.id;
    }

    function setComp (comp, result, project) {

        var parents = [],
            i = 1,
            layer,
            layer_opt;

        result.layers       = [];
        result.type         = "Composition";
        result.color        = propertyExporter.getColor(comp.bgColor);
        result.frameRate    = comp.frameRate;
        result.duration     = comp.duration;

        if (comp.motionBlur){
            result.motionBlur   = comp.motionBlur;
            result.shutterAngle = comp.shutterAngle;
            result.shutterPhase = comp.shutterAngle;
        }
        if (comp.workAreaStart){
            result.workAreaStart = comp.workAreaStart;
        }



        for ( ; i < comp.layers.length; i += 1) {

            layer = comp.layers[i];

            if (
                layer.parent != null
                && json.parse(layer.comment || "{}").exportable !== false
            ) {
                parents.push(layer.parent);
            }

            if (layer.selected){

                layer.selected = false;

            }
        }

        for ( i = 1; i <= comp.layers.length; i += 1) {

            layer = comp.layers[i];
            layer_opt = json.parse(layer.comment || "{}");

            var exportable = layer_opt.exportable !== false;
            if ( exportable  && ( layer.enabled || layer.isTrackMatte || parents.indexOf(layer) !== -1 ) ){
                result.layers.push( getLayer( layer, layer_opt, project ) );
            }

        }

    }

    function getLayer (layer, options, project) {

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

        var properties = getProperties( layer, project, false, options );

        for(var prop_name in properties){
            if (properties.hasOwnProperty(prop_name)){
                result[prop_name] = properties[prop_name];
            }
        }

        if (layer instanceof AVLayer || layer instanceof TextLayer || layer instanceof ShapeLayer){

            if (layer.adjustmentLayer) result.adjustmentLayer = true;
            if (layer.threeDLayer) result.is3D = true;
            if (layer.threeDPerChar) result.have3DCharacter = true;
            if (layer.collapseTransformation) result.collapse = true;
            //if (layer.audioActive) result.audioActive = true;
            if (layer.blendingMode !== BlendingMode.NORMAL) {
                result.blendingMode = blendingModes.getString(layer.blendingMode);
            }

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

            delete result.layerStyles;
            if (canParseProperty(layer.property("Layer Styles"), true)){
                result.layerStyles =  getProperties(
                    layer.property("Layer Styles"),
                    project,
                    true,
                    options
                );
                result.layerStyles.blendingOptions = getProperties(
                    layer.property("Layer Styles").property("Blending Options"),
                    project,
                    false,
                    options
                );
            }
            propertyCleaner.cleanAVLayer(result, layer, project, options);

            if ( layer.source && !layer.nullLayer ){
                result.source = getItem( layer.source, project );
            }
        }



        if ( layer instanceof TextLayer ){
            propertyCleaner.cleanTextLayer(result, layer, project, options);
        } else if ( layer instanceof ShapeLayer ) {

        } else if (layer instanceof CameraLayer) {
            propertyCleaner.cleanCameraLayer(result, layer, project, options);
        }

        return result;
    }

    function getProperties (item, project, removeStyle, options) {

        var result,i;

        switch( item.propertyType ){
        case PropertyType.INDEXED_GROUP:
            result = [];
            for(i = 1; i <= item.numProperties; i += 1){
                if ( canParseProperty( item.property(i), removeStyle, true ) ){
                    result.push( getProperties( item.property(i), project, removeStyle, options ) );
                }
            }
            break;

        case PropertyType.NAMED_GROUP:
            result = {};
            for(i = 1; i <= item.numProperties; i += 1){
                if ( canParseProperty( item.property(i), removeStyle ) ){
                    result[legalizeName(item.property(i).name)] = getProperties(item.property(i), project, removeStyle, options);
                }
            }
            if ( item.parentProperty ){
                if ( item.parentProperty.propertyType === PropertyType.INDEXED_GROUP ){
                    item.type = legalizeName(item.matchName);
                }
            }
            break;
        default:
            result = propertyExporter.getProperty( item, project, options );
        }

        return result;
    }

    function legalizeName (val) {

        var name = val.replace(/[^a-z0-9A-Z_]/g,"");

        return name[0].toLowerCase() +name.slice(1);
    }

    function canParseProperty ( prop, removeStyle, deep ) {

        if (!deep){
            if (!prop.isModified
                && prop.name !== "Position"
                && prop.name !== "Anchor Point"
                && prop.name !== "Zoom"
                && prop.name !== "Point of Interest"
                && !removeStyle ) {
                return false;
            }
        }

        if (removeStyle && !(prop.canSetEnabled && prop.enabled)) {
            return false;
        }

        if (prop.canSetEnabled) {
            if (!prop.enabled) {
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
            for(var i = 1; i <= prop.numProperties; i += 1){
                if ( canParseProperty( prop.property(i), removeStyle, true ) ){
                    return true;
                }
            }
            return false;
        default:
        }

        return true;
    }

    return {
        getProject: getProject,
        getItem: getItem
    };

});
