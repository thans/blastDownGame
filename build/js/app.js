/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * a simple debug panel plugin
 * usage : me.plugin.register(debugPanel, "debug");
 *
 * you can then use me.plugin.debug.show() or me.plugin.debug.hide()
 * to show or hide the panel, or press respectively the "S" and "H" keys.
 *
 * note :
 * Heap Memory information is available under Chrome when using
 * the "--enable-memory-info" parameter to launch Chrome
 */

(function($) {

	// ensure that me.debug is defined
	me.debug = me.debug || {};

	/**
	 * @class
	 * @public
	 * @extends me.plugin.Base
	 * @memberOf me
	 * @constructor
	 */
	debugPanel = me.plugin.Base.extend(
	/** @scope me.debug.Panel.prototype */
	{

		// Object "Game Unique Identifier"
		GUID : null,

		// to hold the debug options
		// clickable rect area
		area : {},

		// panel position and size
		rect : null,

		// for z ordering
		// make it ridiculously high
		z : Infinity,

		// visibility flag
		visible : false,

		// frame update time in ms
		frameUpdateTime : 0,

		// frame draw time in ms
		frameDrawTime : 0,

		// minimum melonJS version expected
		version : "1.0.1",

		/** @private */
		init : function(showKey, hideKey) {
			// call the parent constructor
			this.parent();

			this.rect = new me.Rect(new me.Vector2d(0, 0), me.video.getWidth(), 35);

			// set the object GUID value
			this.GUID = "debug-" + me.utils.createGUID();

			// set the object entity name
			this.name = "me.debugPanel";

			// persistent
			this.isPersistent = true;

			// a floating object
			this.floating = true;

			// renderable
			this.isRenderable = true;

			// always update, even when not visible
			this.alwaysUpdate = true;
            // create a default font, with fixed char width
            var s = 10;
            this.mod = 1;
            if(me.game.viewport.width < 500) {
                s = 7;
                this.mod = 0.7;
            }
            this.font = new me.Font('courier', s, 'white');

			// clickable areas
			this.area.renderHitBox = new me.Rect(new me.Vector2d(160,5),15,15);
      this.area.renderVelocity = new me.Rect(new me.Vector2d(165,18),15,15);

      this.area.renderDirty = new me.Rect(new me.Vector2d(270,5),15,15);
      this.area.renderCollisionMap = new me.Rect(new me.Vector2d(270,18),15,15);
            // some internal string/length
            this.help_str      = "(s)how/(h)ide";
            this.help_str_len = this.font.measureText(me.video.getSystemContext(), this.help_str).width;
            this.fps_str_len = this.font.measureText(me.video.getSystemContext(), "00/00 fps").width;
            this.memoryPositionX = this.font.measureText(me.video.getSystemContext(), "Draw   : ").width * 2.2 + 310 * this.mod;

			// some internal string/length
			this.help_str	  = "(s)how/(h)ide";
			this.help_str_len = this.font.measureText(me.video.getSystemContext(), this.help_str).width;
			this.fps_str_len = this.font.measureText(me.video.getSystemContext(), "00/00 fps").width;

			// enable the FPS counter
			me.debug.displayFPS = true;

			// bind the "S" and "H" keys
			me.input.bindKey(showKey || me.input.KEY.S, "show", false, false);
			me.input.bindKey(hideKey || me.input.KEY.H, "hide", false, false);
            
            // add some keyboard shortcuts
            var self = this;
            this.keyHandler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
                if (action === "show") {
                    self.show();
                } else if (action === "hide") {
                    self.hide();
                }
            });
            
            // re-apply panel settings on level changes
            this.levelHandler = me.event.subscribe(me.event.LEVEL_LOADED, function () {
                var layer = me.game.currentLevel.getLayerByName("collision");
                if (layer) {
                    layer.setOpacity((me.debug.renderCollisionMap===true)?1:0);
                }
            });

			// memory heap sample points
			this.samples = [];

			//patch patch patch !
			this.patchSystemFn();

			// make it visible
			this.show();
		},


		/**
		 * patch system fn to draw debug information
		 */
		patchSystemFn : function() {

			// add a few new debug flag (if not yet defined)
			me.debug.renderHitBox = me.debug.renderHitBox || false;
			me.debug.renderVelocity = me.debug.renderVelocity || false;
			me.debug.renderCollisionMap = me.debug.renderCollisionMap || false;
			var _this = this;
			// patch timer.js
			me.plugin.patch(me.timer, "update", function (time) {
				// call the original me.timer.update function
				this.parent(time);

				// call the FPS counter
				me.timer.countFPS();
			});

			// patch me.game.update
			me.plugin.patch(me.game, 'update', function(time) {
				var frameUpdateStartTime = window.performance.now();

				this.parent(time);

				// calculate the update time
				_this.frameUpdateTime = window.performance.now() - frameUpdateStartTime;
			});

			// patch me.game.draw
			me.plugin.patch(me.game, 'draw', function() {
				var frameDrawStartTime = window.performance.now();

				this.parent();

				// calculate the drawing time
				_this.frameDrawTime = window.performance.now() - frameDrawStartTime;
			});

			// patch sprite.js
			me.plugin.patch(me.SpriteObject, "draw", function (context) {
				// call the original me.SpriteObject function
				this.parent(context);

				// draw the sprite rectangle
				if (me.debug.renderHitBox) {
					context.strokeStyle =  "green";
					context.strokeRect(this.left, this.top, this.width, this.height);
				}
			});

			// patch entities.js
			me.plugin.patch(me.ObjectEntity, "draw", function (context) {
				// call the original me.game.draw function
				this.parent(context);

				// check if debug mode is enabled
				if (me.debug.renderHitBox && this.shapes.length) {

                    // translate to the object position
                    var translateX = this.pos.x ;
                    var translateY = this.pos.y ;

                    context.translate(translateX, translateY);

                    // draw the original shape
                    this.getShape().draw(context, "red");
             		if (this.getShape().shapeType!=="Rectangle") {
             			// draw the corresponding bounding box
	                    this.getShape().getBounds().draw(context, "red");
                    }

                    context.translate(-translateX, -translateY);

                }

                if (me.debug.renderVelocity) {
                    // draw entity current velocity
                    var x = ~~(this.pos.x + this.hWidth);
                    var y = ~~(this.pos.y + this.hHeight);

                    context.strokeStyle = "blue";
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(
                        x + ~~(this.vel.x * this.hWidth),
                        y + ~~(this.vel.y * this.hHeight)
                    );
                    context.stroke();
                }
            });
        },

        /**
         * show the debug panel
         */
        show : function() {
            if (!this.visible) {
                // register a mouse event for the checkboxes
                me.input.registerPointerEvent('pointerdown', this.rect, this.onClick.bind(this), true);
                // add the debug panel to the game world
                me.game.world.addChild(this, Infinity);
                // mark it as visible
                this.visible = true;
            }
        },

        /**
         * hide the debug panel
         */
        hide : function() {
            if (this.visible) {
                // release the mouse event for the checkboxes
                me.input.releasePointerEvent('pointerdown', this.rect);
                // remove the debug panel from the game world
                me.game.world.removeChild(this);
                // mark it as invisible
                this.visible = false;
            }
        },


        /** @private */
        update : function() {
            if (me.input.isKeyPressed('show')) {
                this.show();
            }
            else if (me.input.isKeyPressed('hide')) {
                this.hide();
            }
            return true;
        },

        /**
         * @private
         */
        getBounds : function() {
            return this.rect;
        },

        /** @private */
        onClick : function(e)  {
            // check the clickable areas
            if (this.area.renderHitBox.containsPoint(e.gameX, e.gameY)) {
                me.debug.renderHitBox = !me.debug.renderHitBox;
            }
            else if (this.area.renderCollisionMap.containsPoint(e.gameX, e.gameY)) {
                var layer = me.game.currentLevel.getLayerByName("collision");
                if (layer) {
                    if (layer.getOpacity() === 0) {
                        layer.setOpacity(1);
                        me.debug.renderCollisionMap = true;
                    } else {
                        layer.setOpacity(0);
                        me.debug.renderCollisionMap = false;
                    }
                }
            } else if (this.area.renderVelocity.containsPoint(e.gameX, e.gameY)) {
                // does nothing for now, since velocity is
                // rendered together with hitboxes (is a global debug flag required?)
                me.debug.renderVelocity = !me.debug.renderVelocity;
            }
            // force repaint
            me.game.repaint();
        },

        /** @private */
        drawMemoryGraph : function (context, endX) {
            if (window.performance && window.performance.memory) {
                var usedHeap  = Number.prototype.round(window.performance.memory.usedJSHeapSize/1048576, 2);
                var totalHeap =  Number.prototype.round(window.performance.memory.totalJSHeapSize/1048576, 2);
                var len = endX - this.memoryPositionX;

                // remove the first item
                this.samples.shift();
                // add a new sample (25 is the height of the graph)
                this.samples[len] = (usedHeap / totalHeap)  * 25;

                // draw the graph
                for (var x = len; x >= 0; x--) {
                    var where = endX - (len - x);
                    context.beginPath();
                    context.strokeStyle = "lightblue";
                    context.moveTo(where, 30 * this.mod);
                    context.lineTo(where, (30 - (this.samples[x] || 0)) * this.mod);
                    context.stroke();
                }
                // display the current value
                this.font.draw(context, "Heap : " + usedHeap + '/' + totalHeap + ' MB', this.memoryPositionX, 5 * this.mod);
            } else {
                // Heap Memory information not available
                this.font.draw(context, "Heap : ??/?? MB", this.memoryPositionX, 5 * this.mod);
            }
        },

        /** @private */
        draw : function(context) {
            context.save();

            // draw the panel
            context.globalAlpha = 0.5;
            context.fillStyle = "black";
            context.fillRect(this.rect.left,  this.rect.top,
                             this.rect.width, this.rect.height);
            context.globalAlpha = 1.0;

            // # entities / draw
            this.font.draw(context, "#objects : " + me.game.world.children.length, 5 * this.mod, 5 * this.mod);
            this.font.draw(context, "#draws   : " + me.game.world.drawCount, 5 * this.mod, 18 * this.mod);

            // debug checkboxes
            this.font.draw(context, "?hitbox   ["+ (me.debug.renderHitBox?"x":" ") +"]",     100 * this.mod, 5 * this.mod);
            this.font.draw(context, "?velocity ["+ (me.debug.renderVelocity?"x":" ") +"]",     100 * this.mod, 18 * this.mod);

            this.font.draw(context, "?dirtyRect  [ ]",    200 * this.mod, 5 * this.mod);
            this.font.draw(context, "?col. layer ["+ (me.debug.renderCollisionMap?"x":" ") +"]", 200 * this.mod, 18 * this.mod);

            // draw the update duration
            this.font.draw(context, "Update : " + this.frameUpdateTime.toFixed(2) + " ms", 310 * this.mod, 5 * this.mod);
            // draw the draw duration
            this.font.draw(context, "Draw   : " + (this.frameDrawTime).toFixed(2) + " ms", 310 * this.mod, 18 * this.mod);

            // draw the memory heap usage
            var endX = this.rect.width - 25;
            this.drawMemoryGraph(context, endX - this.help_str_len);

            // some help string
            this.font.draw(context, this.help_str, endX - this.help_str_len, 18 * this.mod);

            //fps counter
            var fps_str = "" + me.timer.fps + "/"    + me.sys.fps + " fps";
            this.font.draw(context, fps_str, this.rect.width - this.fps_str_len - 5, 5 * this.mod);

            context.restore();

        },

        /** @private */
        onDestroyEvent : function() {
            // hide the panel
            this.hide();
            // unbind keys event
            me.input.unbindKey(me.input.KEY.S);
            me.input.unbindKey(me.input.KEY.H);
            me.event.unsubscribe(this.keyHandler);
            me.event.unsubscribe(this.levelHandler);
        }


    });

    /*---------------------------------------------------------*/
    // END END END
    /*---------------------------------------------------------*/
})(window);

/* Game namespace */
var game = {

	// an object where to store game information
	data : {
		// score
		score : 0
	},
	
	
	// Run on page load.
	"onload" : function () {
		// Initialize the video.
		if (!me.video.init("screen", 960, 640, true, 'auto')) {
			alert("Your browser does not support HTML5 canvas.");
			return;
		}

		// add "#debug" to the URL to enable the debug Panel
		if (document.location.hash === "#debug") {
			window.onReady(function () {
				me.plugin.register.defer(this, debugPanel, "debug");
			});
		}

		me.sys.fps = 30; // probably okay

		// Initialize the audio.
		me.audio.init("mp3,ogg");

		// Set a callback to run when loading is complete.
		me.loader.onload = this.loaded.bind(this);

		// Load the resources.
		me.loader.preload(game.resources);

		// Initialize melonJS and display a loading screen.
		me.state.change(me.state.LOADING);
	},

	// Run on game resources loaded.
	"loaded" : function () {
		me.state.set(me.state.MENU, new game.TitleScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());

		me.pool.register("mainPlayer", game.PlayerEntity);
		// TODO object POOLING?
		
		// TODO temporary.  enable keyboard
		me.input.bindKey(me.input.KEY.LEFT,  "left");
   		me.input.bindKey(me.input.KEY.RIGHT, "right");
   		me.input.bindKey(me.input.KEY.SPACE, "shoot");

		// Start the game.
		me.state.change(me.state.PLAY);
	}
};

game.resources = [

	// mainPlayer: space ship
	{name: "player", type: "image", src: "data/img/player_ship.png"},

	// ships
	{name: "xlarge", type: "image", src: "data/img/xlarge_ship.png"},  // 320 x 160
	{name: "large",  type: "image", src: "data/img/large_ship.png"},   // 64x64
	{name: "medium", type: "image", src: "data/img/medium_ship.png"},  // 32x32
	{name: "small",  type: "image", src: "data/img/small_ship.png"},   // 16x16

	//bullet
	{name: "bullet", type: "image", src: "data/img/bullet_sprite.png"},
	{name: "test", type: "image", src: "data/img/test.png"},
	// background
	{name: "background", type: "image", src: "data/img/background.png"},
	
	// tileset
	{name: "sprites", type:"image", src: "data/sprites.png"},

	// map
	{name: "area51", type: "tmx", src: "data/map/area51.tmx"}
];



/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.ObjectContainer.extend({

	init: function() {
		// call the constructor
		this.parent();
		
		// persistent across level change
		this.isPersistent = true;
		
		// non collidable
		this.collidable = false;
		
		// make sure our object is always draw first
		this.z = Infinity;

		// give a name
		this.name = "HUD";
		
		// add our child score object at the top left corner
		this.addChild(new game.HUD.ScoreItem(5, 5));
	}
});


/** 
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this.parent(new me.Vector2d(x, y), 10, 10); 
		
		// local copy of the global score
		this.score = -1;

		// make sure we use screen coordinates
		this.floating = true;
	},

	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
		if (this.score !== game.data.score) {	
			this.score = game.data.score;
			return true;
		}
		return false;
	},

	/**
	 * draw the score
	 */
	draw : function (context) {
		// draw it baby !
	}

});

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
    		var shot = new game.BulletEntity(this.pos.x, this.pos.y, {
                height: 16,
                image: "test",
                name: "shot",
                spriteheight: 16,
                spritewidth: 32,
                width: 16
            });

            me.game.world.addChild(shot, 9);
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
game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		// load a level
		var PADDING = 32;
		var WIDTH = 960 - (PADDING * 2);
        me.levelDirector.loadLevel("area51");

        // reset the score
		game.data.score = 0;

		var zAxis = 8;

		// TODO object pooling? https://github.com/melonjs/melonJS/wiki/Frequently-Asked-Questions
		// TODO keep track of all of these for removal purposes?
		/*
		 * Draw the Mothership
		 */
		var mothership = new game.Ship(320 - PADDING, 32, {
			height: 160,
			image: "xlarge",
			name: "mothership",
			spriteheight: 160,
			spritewidth: 320,
			width: 320,
			z: zAxis
		});

		me.game.world.addChild(mothership, zAxis);
		zAxis++;
		var numFeatures = 6;
		var sectionWidth = WIDTH/numFeatures;
		var elWidth = 64; // width and height are the same
		
		for (var i = 0; i < numFeatures; i++) {
			var featureShip = new game.Ship((i * sectionWidth) + ((sectionWidth - elWidth) / 2), 32 + 160, {
				height: elWidth,
				image: "large",
				name: "feature" + i,
				spriteheight: elWidth,
				spritewidth: elWidth,
				width: elWidth,
				z: zAxis
			});

			me.game.world.addChild(featureShip, zAxis++);
		}

		zAxis++;


		var numStories = 3 * numFeatures;
		sectionWidth = WIDTH / numStories;
		elWidth = 32;
		
		for (var i = 0; i < numStories; i++) {
			var storyShip = new game.Ship((i * sectionWidth) + ((sectionWidth - elWidth) / 2), 32 + 160 + 64 + 32, {
				height: elWidth,
				image: "medium",
				name: "story" + i,
				spriteheight: elWidth,
				spritewidth: elWidth,
				width: elWidth,
				z: zAxis
			});

			me.game.world.addChild(storyShip, zAxis++);

			// TODO - add as many features as are associated with this story!
		}

		zAxis++;

		var numTasks = 2 * numStories;
		sectionWidth = WIDTH / numTasks;
		elWidth = 16;
		
		for (var i = 0; i < numTasks; i++) {
			var storyShip = new game.Ship((i * sectionWidth) + ((sectionWidth - elWidth) / 2), 32 + 160 + 64 + 32 + 32 + 32, {
				height: elWidth,
				image: "small",
				name: "task" + i,
				spriteheight: elWidth,
				spritewidth: elWidth,
				width: elWidth,
				z: zAxis
			});

			me.game.world.addChild(storyShip, zAxis++);
		}

		zAxis++;

	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {

	}
});

game.TitleScreen = me.ScreenObject.extend({
	/**	
	 *  action to perform on state change
	 */
	onResetEvent: function() {	
		; // TODO
	},
	
	
	/**	
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		; // TODO
	}
});
