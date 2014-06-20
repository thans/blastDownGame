game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		// load a level
		var CANVAS_WIDTH = 960;
		var PADDING = 32;
		var WIDTH = CANVAS_WIDTH - (PADDING * 2);

		var MOTHERSHIP = {
			width: 320,
			height: 160
		};

		var FEATURE_SHIP = {
			width: 64,
			height: 64
		};

		var STORY_SHIP = {
			width: 32,
			height: 32
		};

		var TASK_SHIP = {
			width: 16,
			height: 16
		};

        me.levelDirector.loadLevel("area51");

        // reset the score
		game.data.score = 0;

		var zAxis = 8;

		// TODO object pooling? https://github.com/melonjs/melonJS/wiki/Frequently-Asked-Questions
		// TODO keep track of all of these for removal purposes?
		/*
		 * Draw the Mothership
		 */
		var mothership = me.pool.pull("enemyShip", WIDTH / 2 - MOTHERSHIP.width / 2, 32, {
			height: MOTHERSHIP.height,
			image: "xlarge",
			name: "mothership",
			spriteheight: MOTHERSHIP.height,
			spritewidth: MOTHERSHIP.width,
			width: MOTHERSHIP.width,
			z: zAxis
		});

		me.game.world.addChild(mothership, zAxis);
		zAxis++;
		var numFeatures = Math.floor(Math.random() * 9 + 1);
		var sectionWidth = WIDTH/numFeatures;
		console.log("section width " + sectionWidth);
		
		for (var i = 0; i < numFeatures; i++) {
			var xPosition = (i * sectionWidth) + ((sectionWidth) / 2) - (FEATURE_SHIP.width / 2);
			var yPosition = 32 + 160;
			var featureShip = me.pool.pull("enemyShip", xPosition, yPosition, {
				height: FEATURE_SHIP.height,
				image: "large",
				name: "feature" + i,
				spriteheight: FEATURE_SHIP.height,
				spritewidth: FEATURE_SHIP.width,
				width: FEATURE_SHIP.width,
				z: zAxis
			});
			console.log(xPosition);

			me.game.world.addChild(featureShip, zAxis++);
			var numStories = Math.floor(Math.random() * 12 + 1);
			var storiesPerLine = Math.floor(sectionWidth / STORY_SHIP.width);
			var lines = Math.floor(numStories / storiesPerLine) + 1;
			for (var j = 0; j < numStories; j++) {
				var storyX, storyY;
				var storiesOnThisLine = storiesPerLine;
				if (Math.floor(j / storiesPerLine + 1) == lines) {
					storiesOnThisLine = numStories % storiesPerLine;
				}
				console.log(storiesOnThisLine);
				storyY = 32 + 160 + 64 + 32 + Math.floor(j / storiesPerLine) * (STORY_SHIP.height);
				storyX = (i * sectionWidth) + (j % storiesPerLine) * ((sectionWidth) / (storiesOnThisLine + 1)) + sectionWidth / (storiesOnThisLine + 1) - (STORY_SHIP.width / 2);
				//storyX = (i * sectionWidth) + (j % storiesPerLine) * ((sectionWidth) / (numStories + 1)) + sectionWidth / (numStories + 1) - (STORY_SHIP.width / 2);
				/*
				if ((j - 1) + storiesPerLine > numStories && numStories % storiesPerLine != 0) {
					// fewer than storiesPerLine ships on this line
					
					storyX = (i * sectionWidth) + (j % storiesPerLine) * (sectionWidth / (numStories % storiesPerLine + 1)) - STORY_SHIP.width;
					console.log('sectionWidth', sectionWidth);
					console.log('storyX', storyX);
					console.log('left edge', (i*sectionWidth));
				} else {
					storyX = (i * sectionWidth) + ((j % storiesPerLine) * STORY_SHIP.width);
				}
				*/
				
				// if (sectionWidth < numStories * STORY_SHIP.width) {
				// 	// going to have to spread out vertically as well

				// }
				// (j * sectionWidth) + ((sectionWidth - STORY_SHIP.width) / 2), 32 + 160 + 64 + 32
				var storyShip = me.pool.pull("enemyShip", storyX, storyY, {
					height: STORY_SHIP.height,
					image: "medium",
					name: "story" + j,
					spriteheight: STORY_SHIP.height,
					spritewidth: STORY_SHIP.width,
					width: STORY_SHIP.width,
					z: zAxis,
					health: 2
				});

				me.game.world.addChild(storyShip, zAxis++);
			}
		}

		zAxis++;

 /*
		var numStories = 3 * numFeatures;
		sectionWidth = WIDTH / numStories;
		
		

		zAxis++;

		var numTasks = 2 * numStories;
		sectionWidth = WIDTH / numTasks;
		
		for (var i = 0; i < numTasks; i++) {
			var storyShip = me.pool.pull("enemyShip", (i * sectionWidth) + ((sectionWidth - TASK_SHIP.width) / 2), 32 + 160 + 64 + 32 + 32 + 32, {
				height: TASK_SHIP.height,
				image: "small",
				name: "task" + i,
				spriteheight: TASK_SHIP.height,
				spritewidth: TASK_SHIP.width,
				width: TASK_SHIP.width,
				z: zAxis,
				health: 1
			});

			me.game.world.addChild(storyShip, zAxis++);
		}

		zAxis++;
		*/

	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {

	}
});
