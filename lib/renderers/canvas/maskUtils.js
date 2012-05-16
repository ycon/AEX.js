
/*global define */

define(['./fastBlur'],function(fastBlur){

    var canvasElement = document.createElement('canvas'),
        tempContext = (canvasElement.getContext) ? canvasElement.getContext('2d') : null;


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

    function renderMask (context, mask, scale, bounds, opt_is_first) {

        scale = scale || 1;

        var big_number = 99999999,
            is_first_sub = (mask.blending === 'subtract') && opt_is_first,
            to_invert = (is_first_sub) ? !mask.inverted : mask.inverted,
            blur_val = Math.round(Math.abs(mask.feather.x)) * scale,
            buffer = tempContext,
            prev_anchor, blending;

        buffer.canvas.width = bounds.width + (blur_val * 2);
        buffer.canvas.height = bounds.height + (blur_val * 2);
        buffer.globalCompositeOperation = 'source-over';

        buffer.setTransform(scale, 0, 0, scale, -bounds.x + blur_val, -bounds.y + blur_val);

        buffer.beginPath();

        if (to_invert) {

            buffer.moveTo(-big_number, -big_number);
            buffer.lineTo( big_number, -big_number);
            buffer.lineTo( big_number,  big_number);
            buffer.lineTo(-big_number,  big_number);
            buffer.closePath();
        }

        mask.each(function (anchor) {
            if (!prev_anchor) {
                buffer.moveTo(anchor.x,anchor.y);
            } else {
                draw(buffer, prev_anchor, anchor);
            }
            prev_anchor = anchor;
        });

        draw(buffer, prev_anchor, mask.get(0));
        buffer.closePath();

        buffer.fillStyle = '#000000';
        buffer.fill();

        if (mask.expansion !== 0) {
            buffer.globalCompositeOperation = (to_invert !== mask.expansion < 0)
                                              ? 'destination-out'
                                              : 'source-over';
            buffer.lineWidth = Math.abs(mask.expansion * 2);
            buffer.lineStyle = 'black';
            buffer.lineJoin  = 'round';
            buffer.stroke();
        }

        if (mask.feather && mask.feather.x > 0) {
            buffer.putImageData(
                fastBlur.blurAlpha(
                    buffer.getImageData(
                        0, 0,
                        buffer.canvas.width ,
                        buffer.canvas.height
                    ),
                    mask.feather.x * 0.6 * scale, 1
                ),
            0, 0);
        }

        context.globalAlpha = mask.opacity;

        if (is_first_sub) {
            context.globalCompositeOperation = 'add';
        } else {
            setBlending(context, mask);
        }
        context.setTransform(1, 0, 0, 1, -blur_val, -blur_val);
        context.drawImage(buffer.canvas, 0, 0);

    }

    function renderMasks(context, masks, scale, bounds) {

        context.canvas.width = context.canvas.width;
        var is_first = true;
        masks.each(function (mask) {

            if (mask.blending && mask.blending !== 'none' && mask.getLength() && mask.closed) {
                renderMask(context, mask, scale, bounds, is_first);
                is_first = false;
            }
        });
    }

    return {
        renderMasks: renderMasks
    };
});
