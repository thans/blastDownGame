game.BulletEntity = me.ObjectEntity.extend({

	// constructor
	init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.gravity = 0.0;
        // set the movement speed
        this.setVelocity(0, 8);
        this.type = game.BULLET;
    },

	update: function() {
        // did we hit the top wall?
        if (this.pos.y < 16) {
            me.game.world.removeChild(this);
            game.AMMUNITION++;
        }

        // did we hit an enemy?
        var res = me.game.world.collide(this);
        if (res) {
            if (res.obj.type == game.ENEMY_ENTITY) {
                console.log("bullet hit enemy");
                me.game.world.removeChild(this);
                me.game.world.removeChild(res.obj);
                game.AMMUNITION++;
            }
        }

        // keep going
        this.vel.y -= this.accel.y * me.timer.tick;
        this.updateMovement();
        return true;
      }
});