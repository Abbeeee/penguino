//==============================================================================
//	GAME VARIABLES
//==============================================================================

const canvas = document.getElementById('rGame');
const context = canvas.getContext('2d');
const yGround = 250;
var x = 80;
var name = '';
var playerWidth = 30;
var playerHeight = 40;
var obstacles = [];
var speed = 5;
var lastObstacleSpawn = 0;
var obstacleSpawnTime = 1000;
var minSpaceBetweenObstacle = 75;
var gameLoopCounter = 0;
var score = 0;
var counter = 0;
var highscore = [];
var numberOfHighscores = 10;
var alive = true;
var firebaseRef = firebase.database().ref("highscores"); //CREATE REF AND PINPOINTS TO FIREBASE AND HIGHSCORES
window.addEventListener('keydown', keyListener);
window.addEventListener('keyup', resetSizeListener);
canvas.addEventListener('touchstart', touchEvent);
canvas.addEventListener('touchend', touchEventReset);

// The Penguin variables
var shift = 0;
var frameWidth = 30;
var frameHeight = 40;
var totalFrames = 2;
var currentFrame = 0;
var spriteCounter = 0;
var myImage = new Image();
myImage.src = 'images/penguin2.png';
var penguinSlide = new Image();
penguinSlide.src = 'images/penguinSlide2.png';

// Obstacle images variables
var obstacleRock = new Image();
obstacleRock.src = 'images/rock-3-pink.png';
var obstacleRock2 = new Image();
obstacleRock2.src = 'images/rock-2-new.png';
var obstacleCloud = new Image();
obstacleCloud.src = 'images/cloud.png';

// Prevent scrolling for arrow keys
window.addEventListener("keydown", function(e) {
    if([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

// Displays scores from firebase
getScore();


//==============================================================================
//	GROUND & BACKGROUND
//==============================================================================

var ground = {
	x: 0,
	y: yGround,
	imgPath: 'images/ground-new.png',
	imgObject: new Image(),
	animate: function() {
				this.imgObject.src = this.imgPath;
				// Pan Background
				context.drawImage(ground.imgObject, ground.x, ground.y);
				ground.x -= speed;
				// Draw another image at the edge of the first image
			 	context.drawImage(ground.imgObject, ground.x - 595, ground.y);
			 	// If the image scrolls off the screen, reset
			 	if (ground.x <= 0) {
				 	ground.x = 600;
			 	}
		}
};

var background = {
		x: 0,
		y: 0,
		imgPath: 'images/mountains.png',
		imgObject: new Image(),
		animate: function() {
				this.imgObject.src = this.imgPath;
				// Pan Background
				context.drawImage(this.imgObject, this.x, this.y);
				this.x -= 1;
				// Draw another image at the edge of the first image
			 	context.drawImage(this.imgObject, this.x - 599, this.y);
			 	// If the image scrolls off the screen, reset
			 	if (this.x <= 0) {
				 	this.x = 600;
			 	}
		}
};

var background2 = {
		x: 0,
		y: 0,
		imgPath: 'images/clouds.png',
		imgObject: new Image(),
		animate: function() {
				this.imgObject.src = this.imgPath;
				// Pan Background
				context.drawImage(this.imgObject, this.x, this.y);
				this.x -= 0.5;
				// Draw another image at the edge of the first image
			 	context.drawImage(this.imgObject, this.x - 599, this.y);
			 	// If the image scrolls off the screen, reset
			 	if (this.x <= 0) {
				 	this.x = 600;
			 	}
		}
};



//==============================================================================
//	KEY LISTENERS
//==============================================================================

// Touch events
function touchEvent(ev) {
		evX = ev.targetTouches[0].pageX - canvas.offsetLeft;
		ev.preventDefault();
		passive: false;
		if (evX < 300) {
			playerSquare.jump();
		} else if (evX > 300 && playerSquare.height === 40) {
			playerSquare.crouch();
		}
};

// Reset player size (touch)
function touchEventReset(ev) {
		if (playerSquare.height === 20) {
			playerSquare.resetSize();
		}
};

// Keyboard events
function keyListener(event) {
	if (event.keyCode == 38) {
		playerSquare.jump();
	}
	else if (event.keyCode == 40) {
		if (playerSquare.height == 40) {
			playerSquare.crouch();
		}
	}
	else if (event.keyCode == 13 && score == 0) {
		startGame();
	}
};

// Reset player size (keyboard)
function resetSizeListener(event) {
	if (event.keyCode == 40) {
		playerSquare.resetSize();
	}
};



//==============================================================================
//	START & END GAME
//==============================================================================

function startGame(event) {
	name = document.getElementById('nameInput').value;
	var letters = /^[A-Za-z]+$/;
	if (name.match(letters)) {
		document.getElementById("startDiv").style.display = "none";
		playerSquare = new objectCreator(playerWidth, playerHeight, "white", 50, yGround - playerHeight);
		gameLoop();
	} else {
		document.getElementById('nameInput').value = '';
		document.getElementById('nameInput').style.borderBottom = '5px solid #e23333';
		document.getElementById('nameInput').placeholder = 'Enter name here, only A-Z';
	}
};

function gameOver() {
	// Check score placement
	var placement = highscore.length + 1;
	for (var i = 0; i < numberOfHighscores && i < highscore.length; i++) {
		if (score > highscore[i].Score) {
			placement = i + 1;
			break;
		}
	}

	// Checks if highscore is enough to make it to top 10
	if (placement < numberOfHighscores) {
		context.font = '64px VT323';
		context.textAlign = "center";
		context.fillStyle = '#442919';
		context.fillText('NEW HIGH SCORE', 300, 70);

		context.font = 'bold 20px Roboto';
		context.textAlign = "center";
		context.fillStyle = '#442919';
		context.fillText('High score placement: ' + placement, 300, 285);
	} else {
		// Display game over text
		context.font = '72px VT323';
		context.fillStyle = '#442919';
		context.textAlign = "center";
		context.fillText('GAME OVER', 300, 70);
	}

	// Display your score
	context.font = 'bold 20px Roboto';
	context.fillStyle = '#442919';
	context.fillText('Your score: ' + score, 300, 110);

	// Output restart button
	var body = document.getElementById('body');
	var gameOverDiv = document.createElement('div');
	gameOverDiv.setAttribute('id', 'restartDiv');
	var restartButton = document.createElement('button');
	restartButton.setAttribute('id', 'restartButton');
	var textInButton = document.createTextNode('RESTART');
	body.appendChild(gameOverDiv);
	gameOverDiv.appendChild(restartButton);
	restartButton.appendChild(textInButton);
	restartButton.addEventListener('click', restart);

	// Save score as object and push to firebase
	var scoreObject = {
		Name: name,
		Score: score
	}
	firebaseRef.push(scoreObject);

	// Refresh the scoreboard
	getScore();
};


// GET scores from firebase
function getScore() {
	firebaseRef.orderByChild("Score").limitToLast(numberOfHighscores).once("value", function(snapshot){ //PUSH IN LAST 10 CHILDREN = HIHGEST SCORE
		snapshot.forEach(function(child){
			highscore.push(child.val());
		});
		highscore.reverse();
		displayScore();
	});
};


// Create highscore list
function displayScore() {
	document.getElementById('highscore').innerHTML = '';
	for(var i = 0; i < numberOfHighscores; i++){
		var score = highscore[i].Score;
		var name = highscore[i].Name;
		var scoreTable = document.getElementById('scoreTable');
		var ol = document.getElementById('highscore');
		var li = document.createElement('li');
		var strong = document.createElement('span');
		var p = document.createElement('span');
		strong.innerHTML = name;
		p.innerHTML = score;
		li.appendChild(strong);
		li.appendChild(p);
		ol.appendChild(li);
	}
};

// Restart game and reset variables
function restart() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	score = 0;
	obstacles = [];
	alive = true;
	obstacleRate = 10;
	var body = document.getElementById('body');
	var div = document.getElementById('restartDiv');
	body.removeChild(div);
	displayScore();
	startGame();
};

// Functions determing values for spawning obstacles
function randomHeight() {
	var obstacleHeight = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
	return obstacleHeight;
}

function randomWidth() {
	var obstacleWidth = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
	return obstacleWidth;
}


// Gets random number between 50 and whatever randomSpawn(x) is set to in objectspawner further down
function randomSpawn(x) {
	var spawnFrequency = Math.floor(Math.random() * (x - 30 + 1)) + 30;
	return spawnFrequency;
};

// If randomSpawn(x) = counter tick then spawn object
function everyinterval(x) {
	if (counter === x) {
		return true;
	}
	return false;
};



//==============================================================================
//	FUNCTION TO CREATE OBJECTS
//==============================================================================

function objectCreator(width, height, type, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
	this.yVel = 0;
    this.update = function() {
					if (this.y >= yGround - this.height) {
						this.y = yGround - this.height;
					}
					if (type === 'rock') {
						context.drawImage(obstacleRock, this.x, this.y);
					} else if (type === 'rock2') {
						context.drawImage(obstacleRock2, this.x, this.y);
					} else if (type === 'cloud') {
						context.drawImage(obstacleCloud, this.x, this.y);
					}

        	// context.fillStyle = color;
        	// context.fillRect(this.x, this.y, this.width, this.height);
	}
		this.drawPenguin = function() {
						if (this.y >= yGround - this.height) {
								this.y = yGround - this.height;
						};
					  // Draw each frame + place it in the center
						if (this.height >= 40) {
					  context.drawImage(myImage, shift, 0, frameWidth, frameHeight,
					                    this.x, this.y, frameWidth, frameHeight);
						} else {
							context.drawImage(penguinSlide, this.x, this.y);
						}
					  // Change frame each time counter hits 10 (counter resets after)
					  if (spriteCounter == 10) {
							shift += frameWidth;
							currentFrame++;
						}
						// Repeat animation
					  if (currentFrame == totalFrames) {
					    shift = 0;
					    currentFrame = 0;
					  }
		}
		// Jump
		this.jump = function() {
						var jumpForce = -18;
						if (this.y === yGround - this.height) {
							this.yVel = jumpForce;
						};
		}
		// Crouch
		this.crouch = function() {
						this.height = this.height / 2;
						this.width = 50;
						this.x -= 10;

		}
		// Revert to normal
		this.resetSize = function() {
						this.height = playerHeight;
						this.width = playerWidth;
						this.x += 10;
		}
		// Gravity
		this.gravity = function() {
						this.yVel += 1.3;
						this.y = this.y + this.yVel;
		}
		// Collision detection
		this.collideWith = function(obstacle) {
						    if (this.x < obstacle.x + obstacle.width &&
		   						this.x + this.width > obstacle.x &&
		   						this.y < obstacle.y + obstacle.height &&
		   						this.y + this.height > obstacle.y) {
						      return true;
						    }
						    return false;
		}
};



//==============================================================================
//	THE GAME LOOP, while game is active
//==============================================================================

function gameLoop() {

	// Animate as long as no collision occurs
	for (i = 0; i < obstacles.length; i++) {
		if (playerSquare.collideWith(obstacles[i])) {
			gameOver();
			alive = false;
			return;
		}
	}

	// Apply gravity rules on player
	playerSquare.gravity();

	// Clear canvas & output images
	context.clearRect(0, 0, canvas.width, 250);
	background2.animate();
	background.animate();
	ground.animate();


	// Increment score
	score++;
	counter++;
	spriteCounter++;

	// Reset sprite counter
	if (spriteCounter == 11) {
		spriteCounter = 0;
	}

	// Display name
	context.font = 'bold 18px Roboto';
	context.fillStyle = '#442919';
	context.textAlign = 'end';
	context.fillText(name, 590, 20);

	// Display current score
	context.font = 'bold 24px Roboto';
	context.fillStyle = '#442919';
	context.textAlign = 'start';
	context.fillText(score, 5, 25);

	// Increase the speed at certain scores
	switch (score) {
		case 0:
			speed = 5;
			x = 80;
			break;
		case 750:
			speed = 5.5;
			break;
		case 1000:
			speed = 6;
			x = 70;
			break;
		case 1750:
			speed = 6.5;
			break;
		case 2000:
			speed = 7;
			x = 60;
			break;
	}

	// Spawn obstacles in once every 50-100 counter tick
	if (counter == 1 || counter == spawnFrequency && spawnFrequency <= 70 && spawnFrequency > 50) {
		obstacles.push(new objectCreator(35, 30, "rock", 600, 250, ));
		spawnFrequency = randomSpawn(x);
		counter = 2;
	} else if (counter == spawnFrequency && spawnFrequency <= 50) {
		obstacles.push(new objectCreator(30, 30, "rock2", 600, 250));
		spawnFrequency = randomSpawn(x);
		counter = 2;
	} else if (counter == spawnFrequency && spawnFrequency >= 70) {
		obstacles.push(new objectCreator(60, 20, "cloud", 600, 200));
		spawnFrequency = randomSpawn(x);
		counter = 2;
	}

	// Output obstacles in canvas
	for (i = 0; i < obstacles.length; i++) {
		obstacles[i].x -= speed;
		obstacles[i].update();

		// Remove obstacles out of frame
		if (obstacles[i].x < -obstacles[i].width) {
			obstacles.splice(i, 1);
			i--;
		}
	}

	// Output player position
	playerSquare.drawPenguin();

	// Break game loop if NOT alive (obviously)
	if (alive) {
		window.requestAnimationFrame(gameLoop);
	}

};
