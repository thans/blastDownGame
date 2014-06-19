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


		var numStories = 4 * numFeatures;
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
				name: "story" + i,
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
