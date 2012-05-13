
define([
    'animation/KeyFrame',
    'animation/Animator',
    'animation/AnimatorStack',
    'animation/Keys',
    'animation/SpatialKeys',
    'animation/PathKeys'
], function (
    KeyFrame,
    Animator,
    AnimatorStack,
    Keys,
    SpatialKeys,
    PathKeys
) {

    return {
        KeyFrame        : KeyFrame,
        Animator        : Animator,
        AnimatorStack   : AnimatorStack,
        Keys            : Keys,
        SpatialKeys     : SpatialKeys,
        PathKeys        : PathKeys
    };
});
