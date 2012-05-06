
define(function () {

	function KeyFrame (offset, value, is_hold) {

		this.offset = offset;
		this.position_ = 0;

		this.value = value;
		this.isHold = is_hold;
		this.inX = 0;
		this.inY = 0;
		this.outX = 0;
		this.outY = 0;
		this.inTangent = null;
		this.outTangent = null;
		this.path = null;
		this.update = false;
	}

	return KeyFrame;
});
