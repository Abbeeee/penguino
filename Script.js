//==============================================================================
//	VARIABLES
//==============================================================================
const canvas = document.getElementById('rGame');
const context = canvas.getContext('2d');
const yGround = 250;
var x = 80;
var name;
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

// TOUCH EVENTS
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

function touchEventReset(ev) {
		if (playerSquare.height === 20) {
			playerSquare.resetSize();
		}
};

// The Penguin variables
var shift = 0;
var frameWidth = 30;
var frameHeight = 40;
var totalFrames = 2;
var currentFrame = 0;
var spriteCounter = 0;
var myImage = new Image();
myImage.src = 'Images/Penguin2.png';
var penguinSlide = new Image();
penguinSlide.src = 'Images/PenguinSlide2.png';

// Obstacle Images
var obstacleRock = new Image();
obstacleRock.src = 'Images/Rock3.png';
var obstacleRock2 = new Image();
obstacleRock2.src = 'Images/Rock2.png';
var obstacleCloud = new Image();
obstacleCloud.src = 'Images/Cloud.png';

// Prevent scrolling for arrow keys
window.addEventListener("keydown", function(e) {
    if([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

//==============================================================================
//	GROUND & BACKGROUND
//==============================================================================
var ground = {
	x: 0,
	y: yGround,
	imgPath: 'Images/Ground.png',
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
		imgPath: 'Images/Mountains.png',
		imgObject: new Image(),
		animate: function() {
				this.imgObject.src = this.imgPath;
				// Pan Background
				context.drawImage(this.imgObject, this.x, this.y);
				this.x -= 1;
				// Draw another image at the edge of the first image
			 	context.drawImage(this.imgObject, this.x - 595, this.y);
			 	// If the image scrolls off the screen, reset
			 	if (this.x <= 0) {
				 	this.x = 600;
			 	}
		}
};

var background2 = {
		x: 0,
		y: 0,
		imgPath: 'Images/Clouds.png',
		imgObject: new Image(),
		animate: function() {
				this.imgObject.src = this.imgPath;
				// Pan Background
				context.drawImage(this.imgObject, this.x, this.y);
				this.x -= 0.5;
				// Draw another image at the edge of the first image
			 	context.drawImage(this.imgObject, this.x - 595, this.y);
			 	// If the image scrolls off the screen, reset
			 	if (this.x <= 0) {
				 	this.x = 600;
			 	}
		}
};


//DISPLAYS SCORES FROM FIREBASE
getScore();


//==============================================================================
//	KEY LISTENERS
//==============================================================================
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

// RESET PLAYER SIZE
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
	if (name != '') {
		document.getElementById("startDiv").style.display = "none";
		playerSquare = new objectCreator(playerWidth, playerHeight, "white", 50, yGround - playerHeight);
		gameLoop();
	} else {
		document.getElementById('nameInput').style.border = '3px solid red';
		document.getElementById('nameInput').placeholder = 'Please enter name here...';
	}
};

function gameOver() {
	// CHECKS PLACEMENT
	var placement = highscore.length + 1;
	for (var i = 0; i < numberOfHighscores && i < highscore.length; i++) {
		if (score > highscore[i].Score) {
			placement = i + 1;
			break;
		}
	}

	// CHECKS IF PLACEMENT INSIDE HIGHSCORE = HIGHSCORE
	if (placement < numberOfHighscores) {
		context.font = '50px Roboto';
		context.textAlign = "center";
		context.fillStyle = '#5b4003';
		context.fillText('NEW HIGHSCORE', 300, 70);

		context.font = '30px Roboto';
		context.textAlign = "center";
		context.fillStyle = '#5b4003';
		context.fillText('YOU ARE NR: ' + placement, 300, 290);
	}

	// GAME OVER TEXT
	else {
		context.font = 'bold 50px Roboto';
		context.fillStyle = '#5b4003';
		context.textAlign = "center";
		context.fillText('GAME OVER', 300, 70);
	}

	// DISPLAYS SCORE
	context.font = '20px Roboto';
	context.fillStyle = '#5b4003';
	context.fillText('YOUR SCORE: ' + score, 300, 100);

	//CREATE RESTART-BUTTON
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

	// // SAVE AS OBJECT AND PUSH TO FIREBASE
	var scoreObject = {
		Name: name,
		Score: score
	}
	firebaseRef.push(scoreObject);

	// REFRESH SCOREBOARD
	getScore();
};

// GET OBJECT FROM FIREBASE
function getScore() {
	firebaseRef.orderByChild("Score").limitToLast(numberOfHighscores).once("value", function(snapshot){ //PUSH IN LAST 10 CHILDREN = HIHGEST SCORE
		snapshot.forEach(function(child){
			highscore.push(child.val());
		});
		highscore.reverse(); //NEED TO FLIP BECAUSE FIREBSE STORE IN ASCENDING ORDER
		displayScore();
	});
};

// DISPLAY HIGHSCORE FROM ARRAY
function displayScore() {
	document.getElementById('highscore').innerHTML = '';
	for(var i = 0; i < numberOfHighscores; i++){
		var score = highscore[i].Score;
		var name = highscore[i].Name;
		var scoreTable = document.getElementById('scoreTable');
		var ol = document.getElementById('highscore');
		var li = document.createElement('li');
		var strong = document.createElement('strong');
		var p = document.createElement('p');
		strong.innerHTML = name;
		p.innerHTML = score;
		li.appendChild(strong);
		li.appendChild(p);
		ol.appendChild(li);
	}
};

// CLEAR AND RESTART GAME
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
//	FUNCTION TO CREATE OBJECTS / MANIPULATE OBJECTS
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
					};
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
		// JUMP ACTION
		this.jump = function() {
						var jumpForce = -18;
						if (this.y === yGround - this.height) {
							this.yVel = jumpForce;
						};
		}
		// CROUCH ACTION
		this.crouch = function() {
						this.height = this.height / 2;
						this.width = 50;
						this.x -= 10;

		}
		// RESET TO NORMAL SIZE
		this.resetSize = function() {
						this.height = playerHeight;
						this.width = playerWidth;
						this.x += 10;
		}
		// GRAVITY
		this.gravity = function() {
						this.yVel += 1.3;
						this.y = this.y + this.yVel;
		}
		// COLLISION DETECTION
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
//	THE GAME LOOP
//==============================================================================
function gameLoop() {

	// ANIMATE EVERYTHING AS LONG AS NO COLLISION
	for (i = 0; i < obstacles.length; i++) {
		if (playerSquare.collideWith(obstacles[i])) {
			gameOver();
			alive = false;
			return;
		}
	}

	// GRAVITY ON PLAYERSQUARE
	playerSquare.gravity();

	// RESET AND DRAW IMAGES
	context.clearRect(0, 0, canvas.width, 250);
	background2.animate();
	background.animate();
	ground.animate();


	// INCREASE SCORE
	score++;
	counter++;
	spriteCounter++;

	// Reset sprite counter
	if (spriteCounter == 11) {
		spriteCounter = 0;
	}

	// DISPLAYS SCORE
	context.font = '18px Roboto';
	context.fillStyle = '#000';
	context.textAlign = 'start';
	context.fillText('SCORE: '+ score, 5, 23);

	// Increase the speed at score 750 and 1000
	// switch (score) {
	// 	case 0:
	// 		speed = 5;
	// 		x = 80;
	// 		break;
	// 	case 1000:
	// 		speed = 6;
	// 		x = 70;
	// 		break;
	// }

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

	// PRINT OBSTACLE POSITION IN CANVAS AND SET SPEED
	for (i = 0; i < obstacles.length; i++) {
		obstacles[i].x -= speed;
		obstacles[i].update();

		if (obstacles[i].x < -obstacles[i].width) {
			obstacles.splice(i, 1);
			i--;
		}
	}

	// PRINT PLAYER POSITION
	playerSquare.drawPenguin();

	// BREAK LOOP IF ALIVE FALSE
	if (alive) {
		window.requestAnimationFrame(gameLoop);
	}

};
