/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 707;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now();
            dt = (now - lastTime) / 1000;            

        /* Call our checkStatus/update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        checkStatus();
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        player.checkCollisions(bonus.x, bonus.y, "bonus");
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
            player.checkCollisions(enemy.x, enemy.y,"enemy");
        });
        player.update();
    }
    
    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = canvas.height / 101,
            numCols = canvas.width / 101,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
        renderExtras();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        if (bonus != "") {bonus.render()};
        player.render();
    }

    function renderExtras() {
        // Display all the status on the screen 
        ctx.font = "20pt impact";
        ctx.textAlign="left";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.fillStyle = "white";
        ctx.fillText("Lives: " + player.hearts, 10, canvas.height-50);
        ctx.strokeText("Lives: " + player.hearts, 10, canvas.height-50);
        // Display points
        ctx.textAlign="left";
        ctx.fillText("Points: " + player.points, 10, 85);
        ctx.strokeText("Points: " + player.points, 10, 85);
        // Display keys
        ctx.textAlign="right";
        ctx.fillText("Keys: " + player.keys, canvas.width-10, 85);
        ctx.strokeText("Keys: " + player.keys, canvas.width-10, 85);
        // Display number of wins
        ctx.textAlign="right";
        ctx.fillText("Wins: " + player.wins, canvas.width-10, canvas.height-50);
        ctx.strokeText("Wins: " + player.wins, canvas.width-10, canvas.height-50);
        // Display level
        ctx.textAlign="center";
        ctx.fillText("Level: " + (player.level | 0), canvas.width / 2, canvas.height-50);
        ctx.strokeText("Level: " + (player.level | 0), canvas.width / 2, canvas.height-50);
        // Display player message.  If player is in play, message is blank.
        ctx.font = "50pt impact";
        ctx.textAlign="center";
        ctx.fillText(player.status, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(player.status, canvas.width / 2, canvas.height / 2);
        // Put a start under our player if he is moving to a new level
        if (player.status === "NEW LEVEL...") {
            ctx.drawImage(Resources.get("images/Selector.png"), player.x, player.y);
            ctx.drawImage(Resources.get(player.image), player.x, player.y);
        };

    }

    /* This function pauses the game play and resets the player.  It's called by 
     * the checkStatus function when a player has either won or lost.
     */
    function reset(msecs) {
        msecs += new Date().getTime();
        while (new Date() < msecs) { };  //pauses all game action on the screen
        player.x = 202;
        player.y = 459;
        player.status = "";
        player.collision = "false";
        // Set player lastmove time so key presses during pause will not be processed.
        player.lastmove = Date.now();

        // Randomly select one bonus item to display
        bonus = bonuses[Math.floor(Math.random()*bonuses.length)];
        // Put bonus item on stone path or water:
        // (((Math.random()*10) % 5) | 0)  -> generates a whole number
        // between 0 and 4.  Use it to determine column for bonus item.
        bonus.x = (((Math.random()*10) % 5) | 0) * 101;
        // Set the y value of the bonus to a row of water or stones:
        // (((Math.random()*10) % 3) | 0)  -> generates a whole number
        // between 0 and 2.  Use it to determine row for bonus item.
        bonus.y = 60 + (((Math.random()*10) % 3) | 0) * 83;        
    }

    /* This function checks the status of the player and does nothing 
     * while the player is in play (player.status = "")
     */
     function checkStatus() {
        if (player.status === "GAME OVER!!") {
            reset(2000);
            window.location.reload()
        };
        if (player.status != "") {
            reset(2000);            
        };
    };
   
    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/Boy.png',
        'images/Cat-Girl.png',
        'images/Horn-Girl.png',
        'images/Pink-Girl.png',
        'images/Princess.png',
        'images/Selector.png',
        'images/Gem Blue.png',
        'images/Gem Orange.png',
        'images/Gem Green.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Rock.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
