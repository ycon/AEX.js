
/*global define */

define(function(){

    function setBlending (context, mask) {

        var blending = 'source-over';

        switch(mask.blending) {
        case 'subtract':
            blending = 'destination-out';
            break;
        case 'intersect':
            blending = 'source-in';
            break;
        case 'lighten':
            blending = 'lighter';
            break;
        case 'darken':
            blending = 'destination-in';
            break;
        case 'difference':
            blending = 'xor';
            break;
        }

        context.globalCompositeOperation = blending;
    }

    function draw (context, inAnchor, outAnchor) {
        context.bezierCurveTo(
            inAnchor.x + inAnchor.outVector.x,
            inAnchor.y + inAnchor.outVector.y,
            outAnchor.x + outAnchor.inVector.x,
            outAnchor.y + outAnchor.inVector.y,
            outAnchor.x,
            outAnchor.y
        );
    }

    function renderMask (context, mask, opt_set_blending) {

        var big_number = 99999999,
            prev_anchor, blending;

        if (
            mask.blending == null
            || mask.blending === 'none'
            || mask.getLength() === 0
            || !mask.closed
        ) {
            return;
        }

        context.beginPath();

        if (mask.inverted) {

            context.moveTo(-big_number, -big_number);
            context.lineTo( big_number, -big_number);
            context.lineTo( big_number,  big_number);
            context.lineTo(-big_number,  big_number);
            context.closePath();
        }

        mask.each(function (anchor) {

            if (!prev_anchor) {
                context.moveTo(anchor.x,anchor.y);
            } else {
                draw(context, prev_anchor, anchor);
            }

            prev_anchor = anchor;
        });

        draw(context, prev_anchor, mask.get(0));

        context.fillStyle = '#000000';
        context.globalAlpha = mask.opacity;
        context.closePath();

        if ( opt_set_blending !== false) {
            setBlending(context, mask);
        }

        context.fill();

    }

    function renderMasks(context, masks) {

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        masks.each(function (mask) {
            renderMask(context, mask);
        });
    }

    return {
        renderMasks: renderMasks
    };
});
