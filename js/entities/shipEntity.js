game.Ship = me.ObjectEntity.extend({
	// constructor
	// pass the correct image, width/height and x, y for any type of ship that moves in the same pattern
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.gravity = 0.0;
        // set the movement speed
        this.setVelocity(0, 0);

        this.numSteps = 0;
        this.moveRight = true;
        this.collidable = true;
        this.type = game.ENEMY_ENTITY;
    },

    draw: function(context) {
        context.save();
        this.parent(context);       
        context.globalCompositeOperation = "source-in";

        context.fillStyle="green";
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height);

        context.globalCompositeOperation = "source-over"; // should be unnecessary with the next line, just a sanity check
        context.restore();
        
    },

    update: function() {
        // simple movement pattern
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
