
/*global define*/
define([
    './Keys',
    'path/Path',
    'path/Anchor'
], function (
    Keys,
    Path,
    Anchor
) {

    var v1 = new Anchor();

    function PathKeys (target) {

        Keys.call(this, target, '');

        this.path = target;
    }

    PathKeys.prototype = new Keys();
    PathKeys.prototype.constructor = PathKeys;

    PathKeys.prototype.interpolate = function (key, next_key, pos, opt_path) {

        if (!opt_path) {
            opt_path = new Path();
        }

        var prev_path = key.value,
            next_path = next_key.value,
            i = opt_path.getLength(),
            l = prev_path.getLength(),
            anchor, prev_anchor, next_anchor;

        if (i !== l) {
            opt_path.update = true;
        }

        if (i < l) {
            for ( ; i < l; i += 1) {
                opt_path.add(prev_path.get(i).clone());
            }
        } else if (i > l) {
            for ( ; i > l; i -= 1) {
                opt_path.remove(opt_path.get(i - 1));
            }
        }

        i = 0;
        l = Math.min(l, next_path.getLength());
        for ( ; i < l; i += 1) {
            anchor = opt_path.get(i);
            prev_anchor = prev_path.get(i);
            next_anchor = next_path.get(i);

            anchor.copy(prev_anchor).lerp(next_anchor, pos);
            if (anchor.inVector && anchor.outVector) {
                anchor.inVector.copy(prev_anchor.inVector).lerp(next_anchor.inVector, pos);
                anchor.outVector.copy(prev_anchor.outVector).lerp(next_anchor.outVector, pos);
            }
        }
    };

    PathKeys.prototype.set = function(pos){

        this.get(pos, this.path);
    };

    return PathKeys;
});

