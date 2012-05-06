
/*global define*/

define([
    'geom/Vector',
    'geom/Quaternion',
    './blendingModes'
], function (
    Vector,
    Quaternion,
    blendingModes
) {

    function cleanAVLayer ( result, layer , project ) {

        var i,mask,mask_res;

        for(i = 1; i <= layer.Masks.numProperties; i += 1){

            mask_res = result.masks[i-1];
            mask = layer.Masks.property(i);

            mask_res.maskMode = blendingModes.getMaskString(mask.maskMode);
            mask_res.inverted = mask.inverted;
            delete mask_res.type;

        }

        if ( result.effects ){

            for(i = 0; i < result.effects.length; i += 1){

                result.effects[i].type = result.effects[i].type.replace("aDBE","");

            }
        }

        result.transform.anchor = result.transform.anchorPoint;
        delete result.transform.anchorPoint;

        if (result.is3D){

            cleanRotation(result.transform);

            if (result.transform.orientation){
                result.transform.orientation = transformOrientation(result.transform.orientation);
            }

            delete result.materialOptions;

            delete result.transform.xPosition;
            delete result.transform.yPosition;
            delete result.transform.zPosition;

        } else {

            if (result.transform.zRotation){
                result.transform.rotation = {z: result.transform.zRotation};
            }

            delete result.transform.zRotation;
            delete result.transform.xRotation;
            delete result.transform.yRotation;
            delete result.transform.orientation;

            if ( result.transform.scale ){
                delete result.transform.scale.z;
            }

            reduceProperty(result.transform.anchor);
            reduceProperty(result.transform.position);

            delete result.transform.xPosition;
            delete result.transform.yPosition;
        }

        mixin(result,result.transform);
        delete result.transform;
    }

    function cleanTextLayer (result, layer, project, options){

        result.type = "Text";

        var key;
        var txt = separateTextProperties(result.text.sourceText);

        mixin(result, result.text.pathOptions);
        mixin(result, result.text.moreOptions);
        mixin(result, separateTextProperties(result.text.sourceText));

        if (layer.Masks.numProperties >= 1){
            var bounds = getMaskBounds(layer.Masks.property(1));
            result.textPosition = {x:bounds.x,y:bounds.y};
            result.width = bounds.width;
            result.height = bounds.height;
        }
    }

    function getMaskBounds (m_obj) {

        var v  = m_obj.maskShape.value.vertices,
            max_x = -1000000000000000000,
            max_y = -1000000000000000000,
            result = {},
            i;

        result.x = 1000000000000000000;
        result.y = 1000000000000000000;

        for(i = 0; i < v.length; i += 1){

            result.x = Math.min(result.x,v[i][0]);
            result.y = Math.min(result.y,v[i][1]);
            max_x = Math.max(max_x,v[i][0]);
            max_y = Math.max(max_y,v[i][1]);
        }

        result.width = parseFloat((max_x-result.x).toFixed(2));
        result.height = parseFloat((max_y-result.y).toFixed(2));
        result.x = parseFloat(result.x.toFixed(2));
        result.y = parseFloat(result.y.toFixed(2));

        return result;
    }

    function cleanCameraLayer ( result, layer , project ) {
        result.type = "Camera";

        if (result.transform){
            //delete result.transform.xPosition;
            //delete result.transform.yPosition;
            //delete result.transform.zPosition;

            cleanRotation(result.transform);

            if (result.transform.orientation){
                result.transform.orientation = transformOrientation(result.transform.orientation);
            }

            if (result.transform.pointofInterest){
                result.transform.target = result.transform.pointofInterest;
                delete result.transform.pointofInterest;
            }

            delete result.transform.opacity;

            if (result.cameraOptions){
                result.transform.zoom = result.cameraOptions.zoom;
            }
        }
        delete result.cameraOptions;

        mixin(result,result.transform);
        delete result.transform;
    }

    function reduceProperty (prop) {

        var k;

        if (Array.isArray(prop)){
            for (var i = 0; i < prop.length; i += 1) {
                k = prop[i];
                if (Array.isArray(k)){
                    delete k[0].z;
                } else if (Vector.isVector(k)){
                    delete k.z;
                } else {
                    delete k.v.z;
                    if (k.t){
                        if (k.t.i){
                            k.t.i.pop();
                        }
                        if (k.t.o){
                            k.t.o.pop();
                        }
                    }
                }
            }
        } else {
            delete prop.z;
        }
    }

    function separateTextProperties (obj) {
        if ( Array.isArray( obj ) ) {

            var result = {},
                offsets = {},
                text_obj,
                prev_text_obj,
                i = 0,
                l = obj.length,
                current_time = 0,
                old_offset = 0,
                offset = 0,
                key;

            for ( ; i < l; i += 1 ) {
                text_obj = ( Array.isArray(obj[i]) ) ? obj[i][0] : obj[i];
                offset = ( Array.isArray(obj[i]) ) ? obj[i][1] : old_offset;
                current_time += offset;
                old_offset = offset;

                for (key in text_obj) {
                    if (text_obj.hasOwnProperty(key)){
                        prev_text_obj = ( Array.isArray( result[key] ) )
                                        ? result[key][result[key].length-1][0]
                                        : result[key];

                        if ( text_obj.hasOwnProperty( key ) && ( text_obj[key] !== prev_text_obj ) ) {

                            if ( result.hasOwnProperty( key ) ) {
                                if (!Array.isArray( result[key] ) ){
                                    result[key] = [ [ result[key], offsets[key] ] ];
                                }
                                result[key].push([ text_obj[key], current_time - offsets[key] ]);
                                offsets[key] = current_time;

                            } else {
                                result[key] = text_obj[key];
                                offsets[key] = current_time;
                            }
                        }
                    }
                }
            }

            return result;
        } else {

            return obj;
        }
    }

    function transformOrientation (obj) {

        var res, k;

        if (Array.isArray(obj)){

            res = [];

            for (var i = 0; i < obj.length; i += 1) {
                k = obj[i];
                if (Array.isArray(k)){
                    res.push([new Quaternion().setFromEuler(k[0]), k[1]]);
                } else if (Vector.isVector(k)){
                    res.push(new Quaternion().setFromEuler(k));
                } else {

                    res.push({
                        v: new Quaternion().setFromEuler(k.v),
                        d: k.d,
                        e : k.e
                    });
                }
            }
            return res;
        } else {
            return new Quaternion().setFromEuler(obj);
        }


    }

    function cleanRotation (obj) {

        obj.rotation = {
            x:obj.xRotation || 0,
            y:obj.yRotation || 0,
            z:obj.zRotation || 0
        };

        delete obj.xRotation;
        delete obj.yRotation;
        delete obj.zRotation;
    }

    function mixin (target, source, safe) {

        if (typeof source === 'object'){
            for ( var key in source ) {

                if (source.hasOwnProperty(key) && !(target.hasOwnProperty(key) && safe) ){
                        target[key] = source[key];
                }
            }
        }
    }

    function rename (obj, oldName, newName) {

        if ( obj.hasOwnProperty(oldName) ){
            obj[newName] = obj[oldName];
            delete obj[oldName];
        }
    }

    return {
        cleanAVLayer: cleanAVLayer,
        cleanTextLayer: cleanTextLayer,
        cleanCameraLayer: cleanCameraLayer
    };
});
