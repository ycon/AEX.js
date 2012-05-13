
/*global define */

define([
    'core/Stack',
    './Anchor',
    'path/CurvePatch',
    'path/SimplePath',
    'geom/Vector'
], function (
    Stack,
    Anchor,
    CurvePatch,
    SimplePath,
    Vector
) {


    function Path () {

        Stack.call(this);

        this.closed    = false;
        this.update    = true;
        this.path_     = null;

        var onChange = function () {
            this.update = true;
        };
        this.on.add.add(onChange, this);
        this.on.remove.add(onChange, this);
        this.on.swap.add(onChange, this);
    }

    Path.prototype = new Stack();
    Path.prototype.constructor = Path;

    Path.prototype.create = function(x, y, inX, inY, outX, outY) {

        var anchor = new Anchor(x, y, inX, inY, outX, outY);

        this.add(anchor);

        return anchor;
    };

    Path.prototype.getLogicalPath = function() {

        var last, path, previous;

        // We populate a new path when the mask had been updated
        if (this.update) {

            this.update = false;

            path = new SimplePath();
            this.each(function(anchor){
                if (previous) {
                    path.add(new CurvePatch(previous, anchor));
                }
                previous = anchor;
            });
            this.path_ = path;
        }

        // We update the path if the closed attribute has changed
        last = this.path_.elements[this.path_.elements.length - 1];

        if ( this.closed !== (this.get(0) === last.end)) {

            if (this.closed) {
                last  = this.get(this.getLength() - 1);
                this.path_.add(new CurvePatch(
                    last,
                    last.outVector,
                    this.get(0).inVector,
                    this.get(0)
                ));
            } else {
                this.path_.remove(last);
                this.path_.update = true;
            }
        }

        return this.path_;
    };

    return Path;
});




