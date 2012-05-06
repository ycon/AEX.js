
define([
    'animation/KeyFrame',
    'animation/Animator',
    'animation/AnimatorStack',
    'animation/Keys',
    'animation/SpatialKeys'
], function (
    KeyFrame,
    Animator,
    AnimatorStack,
    Keys,
    SpatialKeys
) {

    return {
        KeyFrame        : KeyFrame,
        Animator        : Animator,
        AnimatorStack   : AnimatorStack,
        Keys            : Keys,
        SpatialKeys     : SpatialKeys
    };
});
