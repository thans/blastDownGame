game.BulletEntity = me.ObjectEntity.extend({

	// constructor
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.gravity = 0.0;
        // set the walking & jumping speed
        this.setVelocity(0, 8);
        // this.startY = y + 32;
        // this.endY = 0;
    },

	update: function() {
		if (this.pos.y < 16) {
			me.game.world.removeChild(this);
		}
        this.flipX(this.left);
        this.vel.y -= this.accel.y * me.timer.tick;
        this.updateMovement();
        return true;
      }
    // // update position
    // update: function(dt) {

    // 	if (me.input.isKeyPressed('shoot')) {
    // 		// shoot!
    // 	}

    //     if (me.input.isKeyPressed('left')) {
    //         this.vel.x -= this.accel.x * me.timer.tick;
    //     } else if (me.input.isKeyPressed('right')) {
    //         this.vel.x += this.accel.x * me.timer.tick;
    //     } else {
    //         this.vel.x = 0;
    //     }

    //     // check & update player movement
    //     this.updateMovement();

    //     // update animation if necessary
    //     if (this.vel.x != 0 || this.vel.y != 0) {
    //         // update object animation
    //         this.parent(dt);
    //         return true;
    //     }
        
    //     // else inform the engine we did not perform
    //     // any update (e.g. position, animation)
    //     return false;
    // }
});