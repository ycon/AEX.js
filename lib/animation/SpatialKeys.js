
/*global define*/
define(['./Keys','path/CubicCurve'], function (Keys, CubicCurve) {

    function SpatialKeys (target, property) {

        Keys.call(this, target, property);

        this.temp_ = target[property].clone();
    }

    SpatialKeys.prototype = new Keys();
    SpatialKeys.prototype.constructor = SpatialKeys;

    SpatialKeys.prototype.interpolate = function (key, next_key, pos, opt_vec) {

        if (key.update){
            if (key.outTangent && next_key.inTangent){
                key.path = new CubicCurve(
                    key.value,
                    key.outTangent.clone().add(key.value),
                    next_key.inTangent.clone().add(next_key.value),
                    next_key.value
                );
            } else {
                key.path = null;
            }

            key.update = false;
        }
        if (key.path){
            return key.path.getVect(pos, opt_vec);
        } else {
            return ((opt_vec) ? opt_vec.copy(key.value) : key.value.clone())
                   .lerp(next_key.value,pos);
        }
    };

    SpatialKeys.prototype.set = function(pos){

        var res = this.get(pos, this._temp),
            v = this.target[this.property];

        if (v.equals && !v.equals(res)){
            v.copy(res);
        }
    };

    return SpatialKeys;
});

