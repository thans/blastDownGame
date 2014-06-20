game.PlayerEntity = me.ObjectEntity.extend({

	// constructor
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        console.log(settings);
        console.log(this);
        this.gravity = 0.0;
        this.type = game.PLAYER;
        this.movesUntilShoot = 0;
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(5, 0);
    },

    // update position
    update: function(dt) {
        if (me.input.isKeyPressed('left')) {
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }
        this.movesUntilShoot--;

        if (this.movesUntilShoot < 0 && me.input.isKeyPressed('shoot') && game.AMMUNITION > 0) {
    		var shot = me.pool.pull('bullet', this.pos.x, this.pos.y, {
                height: 16,
                image: "bullet",
                name: "shot",
                spriteheight: 16,
                spritewidth: 16,
                width: 16
            });
            game.AMMUNITION--;
            this.movesUntilShoot = 5; // 5 updates befre you can shoot again

            me.game.world.addChild(shot, Number.POSITIVE_INFINITY);
    	}

        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x != 0 || this.vel.y != 0) {
            // update object animation
            this.parent(dt);
            return true;
        }
        return true;
    }

});