game.Ship = me.ObjectEntity.extend({
	// constructor
	// pass the correct image, width/height and x, y for any type of ship that moves in the same pattern
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.gravity = 0.0;
        // set the walking & jumping speed
        this.setVelocity(0, 0);
        // this.startY = y + 32;
        // this.endY = 0;
        this.numSteps = 0;
        this.moveRight = true;
    },

    // TODO move left and right
    update: function() {
    	if (this.numSteps % 3 == 0) {
    		if (this.numSteps % (96 * 2) == 0) {
    			this.moveRight = !this.moveRight;
    			this.numSteps = 0;
    		}
    		
    		if (this.moveRight) {
	    		this.pos.x -= 1;
	    	} else {
	    		this.pos.x += 1;
	    	}
    	}
    	this.numSteps++;
    }
});