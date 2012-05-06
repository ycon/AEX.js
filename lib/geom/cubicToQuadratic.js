
/**
 * Will divide a cubic curve into a set of quadratic curves.
 * this is based on the adaptive division algorythm defined here :
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
 */

define(function () {

    function cubicToQuadratic (p1, c1, c2, p2, path, precision) {

        var res1 = p1.clone();
        var res2 = p2.clone();

        if (c2.equals(p2)) {
            // exception made when an anchor is the same as end point, we just 1
            // quad curve to approximate that.
            path.curveTo(res1.lerp(c1, 0.89), p2);
            return path;
        }

        if (c1.equals(p1)) {
            // same as before
            path.curveTo(res2.lerp(c2, 0.89), p2);
            return path;
        }

        // we first guess where the quadratic mid-points candidate are

        res1.lerp(c1, 1.5);
        res2.lerp(c2, 1.5);

        if (!precision) {
            // if precision isn't set, we come up with one.
            // This one is a guess based on overall curve haul width and height.

            precision = (
                Math.max(
                    Math.max(res1.max(), res2.max()),
                    Math.max(p1.max(), p2.max())
                ) -
                Math.min(
                    Math.min(res1.min(), res2.min()),
                    Math.min(p1.min(), p2.min())
                )
            ) / 350;
        }

        // d will define where we will need to split the curve.
        // d is the distance between the 2 possible quadratic approximations.
        // the closer they are, the less curves we need.
        // if (d >= 1) = we only need one quadratic curve
        // if (d < 1 && >=.5) = We'll split it in 2 at d point
        // if (d < .5) = We'll split the curve is 3, one will be 0>d the other
        // (1-d)>1.
        // we will then iterate the algorithm in the remaining bit.

        var d = Math.sqrt(10.3923048 / res1.distance(res2) * precision);

        if (d > 1) {

            path.curveTo(res1.lerp(res2, 0.5), p2);

        } else {
            // Lets do some curve spliting!
            /*
             * var begin =p1.clone(); var end = p2.clone(); var mid =
             * c1.clone().lerp(c2,d);
             *
             * var d1_c1 = begin.lerp(c1,d).clone(); var d1_c2 =
             * begin.lerp(mid,d).clone();
             *
             * var d2_c2 = end.lerp(c2,1-d).clone(); var d2_c1 =
             * mid.lerp(end,d).clone();
             *
             * mid.lerp(begin,1-d); end.set(p2); begin.set(p1);
             */

            var d1_p1 = p1.clone(),
                d1_c1 = d1_p1.clone().lerp(c1, d),
                d2_p2 = p2,
                d2_c2 = c2.clone().lerp(p2, d),
                temp_c = c1.clone().lerp(c2, d),
                d1_c2 = d1_c1.clone().lerp(temp_c, d),
                d2_c1 = temp_c.lerp(d2_c2, d),
                p = d1_c2.clone().lerp(d2_c1, d);

            // trace(d);

            res1 = d1_p1.clone().lerp(d1_c1, 1.5);
            res2.copy(p).lerp(d1_c2, 1.5);

            path.curveTo(res1.lerp(res2, 0.5), p.clone());

            if (d < 0.5) {
                // mmm, we need to split it again.
                d = 1 - (d / (1 - d));

                c1 = d2_c1.clone();
                c2 = d2_c2.clone();

                p1 = d1_p1.copy(p);

                d1_c1.copy(d1_p1).lerp(c1, d);
                d2_c2.copy(c2).lerp(p2, d);
                temp_c.copy(c1).lerp(c2, d);
                d1_c2.copy(d1_c1).lerp(temp_c, d);
                d2_c1 = temp_c.lerp(d2_c2, d);
                p.copy(d1_c2).lerp(d2_c1, d);

                // path.curveTo(p.clone(),p.clone());
                cubicToQuadratic(d1_p1, d1_c1, d1_c2.clone(), p.clone(), path, precision);

                // cubicToQuadratic(d1_p1,d1_c1,d1_c2.clone(),p.clone(),path,precision*3);
            }

            res1 = p.clone().lerp(d2_c1, 1.5);
            res2 = d2_p2.clone().lerp(d2_c2, 1.5);

            // and finally the remaining
            path.curveTo(res1.lerp(res2, 0.5), p2.clone());

        }
        return path;
    }

    return cubicToQuadratic;
});
