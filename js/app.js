// Set variables to start game.  If I add levels, I can modify these to make the game
// more challenging.  Use these variable in the rest of the code.
var maxEnemies = 3;
var maxSpeed = 4;
var minSpeed = 1;
var charImage = "";

// This function is called by the dropdown form list to change the player character (which is boy by default).
function favchar() {
    var pickList = document.getElementById("myList");
    charImage = pickList.options[pickList.selectedIndex].text;
    if (charImage != "") {player.image = 'images/' + charImage + '.png'}
    // Move focus away from the picklist to continue game.
    myList.blur();
    };

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    // Create the prototype object
    var obj = Object.create(Enemy.prototype);
    // Each enemy has its own location.
    // Start all our enemies in a random spot - setting the horizonal posiiton
    // relative to canvas:
    obj.x = Math.random()*1000 | 0;
    // Start all our enemies in a random spot - setting the vertical posiiton
    // relative to canvas, but inline with a stone row:
    obj.y = 143 + (((Math.random()*10) % 3) | 0) * 83;
    // Each enemy runs at a different speed.
    // Set this up to be randomly generated:
    obj.speed = Math.random()*10;
    // If bug speed falls outside of the predetermined limits, 
    // reset to the predetermined limits
    if (obj.speed > maxSpeed) {obj.speed = maxSpeed};
    if (obj.speed < minSpeed) {obj.speed = minSpeed};
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    obj.sprite = 'images/enemy-bug.png';
    return obj;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // If enemy is off the canvas - reset enemy's vertical position 
    // and speed and re-enter on left of canvas
    if (this.x > 500) {
        // Set enemy to re-emerge on the left
        this.x = -100;  
        // Reset the enemy speed since it's re-emerging
        this.speed = Math.random()*10;
        if (this.speed < minSpeed) {this.speed = minSpeed};
        if (this.speed > maxSpeed) {this.speed = maxSpeed};
        // Select a random row to start enemy on
        this.y = 143 + (((Math.random()*10) % 3) | 0) * 83;
    } else {
        // Otherwise, just move the enemy along using the dt parameter....
        this.x = this.x + dt*100*this.speed;
    };
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
//----------------------------------
var Hero = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    var obj = Object.create(Hero.prototype);
    // Hero always starts on the bottom of the screen to set initial x and y:
    obj.x = 202;
    obj.y = 459;
    // Hero status of "" means he is in play.
    obj.status = "";
    // Hero's other statistics needed to track hero's progress
    obj.collision = "false";
    // Number of lives
    obj.hearts = 5;
    obj.wins = 0;
    obj.level = 1;
    obj.keys = 0;
    // This tracks the last time our hero moved.  If keyboard buffer fills up during a game pause,
    // use this to prevent our hero from moving after the pause.
    obj.lastmove = 0;
    obj.points = 0;
    // Use this to prevent our hero from occupying the same space as a rock.
    obj.lastDirection = "";
    // The image for our hero will start out being a boy but can be changed
    obj.image = 'images/Boy.png';
    return obj;
};

Hero.prototype.update = function() {
    // Based on x and y, make sure hero doesn't go off the canvas.
    // Keep hero from falling off left or right sides.
    if (this.x < 0) {this.x = 0};
    if (this.x > 500) {this.x = this.x - 101};
    // Keep hero from falling off bottom of canvas
    if (this.y > 459) {this.y = this.y - 83};
    // A hero at the top is a winner!
    // Update player statuses and increase level if more than 4 wins on each level.
    if (this.y <= 70) {
        this.status = "WINNER!!";
        this.wins = this.wins + 1;
        this.points = this.points + 500;
        // For every 5 wins, increase the level
        if ((this.wins%5) === 0) {
            this.level++;
            // increase lives
            this.hearts++;
            // Update player status to be displayed on the canvas
            this.status = "NEW LEVEL...";
            // Now make it harder - increase bug max speed and add another bug to the game!
            maxSpeed++;
            allEnemies.push(Enemy());
        };
    };
};

// Check for collisions with the hero:  If both the x and y locations of our hero an another
// object within a certain range, then a collision has occurred.
Hero.prototype.checkCollisions = function (objectx,objecty,objectId) {
    if (Math.abs(objectx - this.x)<75) {
        if (Math.abs(objecty - this.y)<20) {
            // Collisions happen.
            if (objectId === "enemy") {
                // Player message will be TRY AGAIN and player looses 1 life
                this.status = "TRY AGAIN";
                // Enemies can occupy the same space.  If hero hits a space with
                // more than 1 enemy in it, player will only loose 1 life, not 1 for
                // each enemy.  Track this using .collision variable.
                if (this.collision === "false") {
                    this.hearts = this.hearts - 1;
                    this.collision = "true";
                };
                // If the player has no lives left, game is over.
                if (this.hearts === 0) {this.status = "GAME OVER!!"};
            } else {
                // Collision with a rock or other object that blocks a path?
                if (bonus.otherAction === "blockPath") {
                    if (this.lastDirection === "left") {this.x = this.x + 101};
                    if (this.lastDirection === "right") {this.x = this.x - 101};
                    if (this.lastDirection ===  'up') {this.y = this.y + 83};
                    if (this.lastDirection ===  'down') {this.y = this.y - 83};
                } else {
                    //collision with a non-enemy non-rock
                    this.points = this.points + bonus.pvalue;
                    this.hearts = this.hearts + bonus.hvalue;
                    this.keys = this.keys + bonus.kvalue;
                    // for every 5 keys collected, bump up the level
                    if (this.keys === 5) {
                        this.keys = 0;
                        this.level++;
                        // Update player status to be displayed on the canvas
                        this.status = "NEW LEVEL...";
                        // Now make it harder - increase bug max speed and add another bug to the game!
                        maxSpeed++;
                        allEnemies.push(Enemy());
                    };
                    if (bonus.otherAction === "removeEnemy") {allEnemies.pop(Enemy())};
                    //remove bonus from screen unless its a rock
                    bonus = "";
                };
            };
        };
    };
};

// Draw the enemy on the screen, required method for game
Hero.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, this.y);
};

// Update position of hero on canvas based on keyboard input
Hero.prototype.handleInput = function(pressedKey) {
    var deltime = (Date.now() - this.lastmove) / 1000;
    // If key presses build up in the buffer don't move hero for each
    // key press in the buffer.  Hero must wait a certain time to move.
    // Tested this, and as fast as I could press keys, I couldn't make
    // our hero skip a move during normal play using .02 delta time.
    if (deltime >= .02) {
        if (pressedKey === 'left') {
            this.x = this.x - 101;
            this.lastDirection = "left";
        };
        if (pressedKey === 'right') {this.x = this.x + 101;
            this.lastDirection = "right";
        };
        if (pressedKey === 'up') {this.y = this.y - 83;
            this.lastDirection = "up";
        };
        if (pressedKey === 'down') {this.y = this.y +83;
            this.lastDirection = "down";
        };
        this.lastmove = Date.now();
    };
};

var PointsPlus = function (image,pvalue,hvalue,kvalue,action) {
    var obj = Object.create(PointsPlus.prototype);
    obj.x = 100;   
    obj.y = 100;
    obj.image = image;          //image of the bonus object
    obj.pvalue = pvalue;        //points value for this object
    obj.hvalue = hvalue;        //number of lives this item adds to character
    obj.kvalue = kvalue;        //number of keys this item give to character
    obj.otherAction = action;
    return obj;
};

// Draw the enemy on the screen, required method for game
PointsPlus.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, this.y);
};

PointsPlus.prototype.update = function(){
    //check for collision with our hero and update if one happens
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
//----------------------------------
//----------------------------------
// Using the maxEnemies setting, create an array of enemies that contains the max number
// maxEnemies can be changed based on level or experience
var allEnemies = [];
var i = 0;
for (i = 0; i < maxEnemies; i++) {
    allEnemies.push(Enemy());
};

// Place the player object in a variable called player
var player = Hero();

var bonuses = [];

//  Add lots of stuff to the array - mostly rocks and gems.
//  A single bonus item is randomly selected from this list so
//  we need mostly rocks and gems to choose from or the game is
//  way too easy.

bonuses.push(PointsPlus('images/Gem Blue.png',500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Orange.png',1000,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Green.png',1500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Blue.png',500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Orange.png',1000,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Green.png',1500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Blue.png',500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Orange.png',1000,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Green.png',1500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Blue.png',500,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Orange.png',1000,0,0,'none'));
bonuses.push(PointsPlus('images/Gem Green.png',1500,0,0,'none'));
bonuses.push(PointsPlus('images/Heart.png',2000,1,0,'none'));
bonuses.push(PointsPlus('images/Key.png',0,0,1,'none'));
bonuses.push(PointsPlus('images/Star.png',0,0,0,'removeEnemy'));
bonuses.push(PointsPlus('images/Star.png',0,0,0,'removeEnemy'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));
bonuses.push(PointsPlus('images/Rock.png',0,0,0,'blockPath'));

// Randomly select one bonus item to display
var bonus = bonuses[Math.floor(Math.random()*bonuses.length)];
// Put bonus item on stone path or in water:
// bonus.x = (((Math.random()*10) % 4) | 0) * 101;
//bonus.y = 60 + (((Math.random()*10) % 3) | 0) * 83;

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
