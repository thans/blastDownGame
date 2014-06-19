game.PlayerEntity = me.ObjectEntity.extend({

	// constructor
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        console.log(settings);
        console.log(this);
        this.gravity = 0.0;

        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(5, 0);
    },

    // update position
    update: function(dt) {
    	//console.log('update');
        if (me.input.isKeyPressed('left')) {
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }


        if (me.input.isKeyPressed('shoot')) {
    		console.log('this', this);

    		var shot = new game.BulletEntity(this.x, this.y, {
				height: 16,
				image: "test",
				name: "shot",
				spriteheight: 16,
				spritewidth: 32,
				width: 16,
				x: this.x,
				y: this.y,
				z: 9
			});

			me.game.world.addChild(shot, 9);

   //  		var shot = new game.BulletEntity(this.x, this.y, {image: "test", z: this.z+1, height: 16, width: 16, spritewidth: 16, spriteheight: 16}); 

			// me.game.world.addChild(shot);
    	}

        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x != 0 || this.vel.y != 0) {
            // update object animation
            this.parent(dt);
            return true;
        }
        
        //console.log("returning");
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return true;
    }

});