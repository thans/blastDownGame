game.Mothership = me.ObjectEntity.extend({
	// constructor
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.gravity = 0.0;
        // set the walking & jumping speed
        this.setVelocity(0, 0);
        // this.startY = y + 32;
        // this.endY = 0;
    },

    // TODO move left and right
});