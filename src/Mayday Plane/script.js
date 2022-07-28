window.addEventListener('load', function(){
    //INITIAL SETUP
    const game = document.getElementById('game');
    const gameContext = game.getContext('2d');
    const menu = document.getElementById('menu');
    const gameOverUI = document.getElementById('gameoverUI');
    const gameFont = new FontFace('plane', 'url(font/kenvector_future.ttf)')
    gameFont.load();
    menu.style.width = "1024px";
    menu.style.height = "1024px";
    game.width = 768;
    game.height = 1024;
   
    //UI ELEMENTS
    function showMainMenu(){
        menu.style.display = "block";
    }
    function hideMainMenu(){
        menu.style.display = "none";
    }
    function showGameScreen(){
        game.style.display = "block";
    }
    function hideGameScreen(){
        game.style.display = "none";
    }
    function showGameOverUI(){
        gameOverUI.style.display = "block";
    }
    function hideGameOverUI(){
        gameOverUI.style.display = "none";
    }

    //Main Menu
    const playButton = document.getElementById('play');
    const quitButton = document.getElementById('quit');

    playButton.addEventListener('click', function(){
        hideMainMenu();
        showGameScreen();
    });
    quitButton.addEventListener('click', function(){
        close();
    });

    //Game Over
    const restartButton = document.getElementById('restart');
    const exitButton = document.getElementById('exit');

    restartButton.addEventListener('click', function(){
        hideGameOverUI();
        restartGame();
    });
    exitButton.addEventListener('click', function(){
        hideGameOverUI();
        hideGameScreen();
        showMainMenu();
        restartGame();
    });

    //GAME ELEMENTS
    let obstacles = [];
    let score = 0;
    let gameInitialState = true;
    let gameOver = false;
    

    const playerImage = new Image();
    playerImage.src = ("img/player.png");
    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 80;
            this.height = 75;
            this.x = 20;
            this.y = this.gameHeight/2;
            this.image = playerImage;
            this.speed = 5;
        }
        draw(context){
            context.fillStyle = 'black';
            context.drawImage(this.image, this.x, this.y, this.width, this.height)

        }
        update(input){
            //movement
            if (!gameInitialState) this.y += this.speed;

            if ((input.keys.indexOf('click') > -1) || (input.keys.indexOf('touch') > -1)){
                this.speed = -10;
            } else {
                this.speed = 13
            }

            //boundaries
            if (this.y < 0) this.y = 0;
            else if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
                gameOver = true;
                showGameOverUI();
                
            }
        }

        reset(){
            this.x = 20;
            this.y = this.gameHeight/2;
        }

    }

    const obstacleTopImage = new Image();
    const obstacleBottomImage = new Image();
    obstacleTopImage.src = ("img/obstacleDOWN.png");
    obstacleBottomImage.src = ("img/obstacleUP.png");
    class Obstacle {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.top = (Math.random() * this.gameHeight/3) + 100;
            this.bottom = (Math.random() * this.gameHeight/3) + 100;
            this.width = obstacleBottomImage.width;
            this.x = this.gameWidth;
            this.topImage = obstacleTopImage;
            this.bottomImage = obstacleBottomImage;
            this.markedForDelete = false;
        }

        draw(context){
            context.fillStyle = "red";
            context.drawImage(this.topImage, this.x, 0, this.width, this.top);
            context.drawImage(this.bottomImage, this.x, this.gameHeight - this.bottom, this.width, this.bottom)
        }
        update(player){
            //move
            this.x -= 10;

            //delete after passing boundary and add score
            if (this.x < 0 - this.width) {
                score++;
                this.markedForDelete = true;
            }

            //collision detection
            var xOffset = 3;
            var yOffset = 10;

            if (player.x < this.x + this.width &&
                player.x + player.width - xOffset > this.x + this.width/2 &&
                ((player.y + yOffset < 0 + this.top && player.y + player.height > 0) || 
                (player.y + yOffset > this.gameHeight - this.bottom && 
                player.y + player.height + yOffset < this.gameHeight))){
                    gameOver = true;
                    showGameOverUI();
                }
        }
    }

    const backgroundImage = new Image();
    backgroundImage.src = ("img/bg.png");
    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = backgroundImage;
            this.width = 1707;
            this.height = 1024;
            this.x = 0;
            this.y = 0;
            this.speed = 3;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y,);
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
        update(){
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class InputHandler {
        constructor(){
            this.keys = [];

            //mouse controls
            game.addEventListener('mousedown', e => {
                gameInitialState = false;
                if (this.keys.indexOf('click') === -1){
                    this.keys.push('click');
                }
            });
            game.addEventListener('mouseup', e => {
                this.keys.splice(this.keys.indexOf('click'), 1)
            });

            //touch controls
            game.addEventListener('touchstart', e => {
                gameInitialState = false;
                if (this.keys.indexOf('touch') === -1) {
                    this.keys.push('touch');
                }
            });
            game.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('touch', 1));
            });
        }   
    }
    
     function spawnObstacle(deltaTime){
        if (obstacleTimer > obstacleInterval){
            obstacles.push(new Obstacle(game.width, game.height));
            obstacleTimer = 0;
        } else {
            obstacleTimer += deltaTime;
        }
        obstacles.forEach(obstacle => {
            obstacle.draw(gameContext);
            obstacle.update(player);
        });
        obstacles = obstacles.filter(obstacle => !obstacle.markedForDelete);

    }

    function displayText(context){
        //score text
        context.textAlign = "left";
        context.fillStyle = "black";
        context.font = "bold 20px plane";
        context.fillText("Score: " + score, 20, 50);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 30px plane";
            context.fillText("TOUCH ANYWHERE TO START", game.width/2, 200);
        }
    }

    function restartGame(){
        player.reset();
        obstacles = [];
        score = 0;
        gameInitialState = true;
        gameOver = false;
        animate(0);

    }

    //MAIN FUNCTION
    const input = new InputHandler();
    const player = new Player(game.width, game.height);
    const background = new Background(game.width, game.height);
    let lastTime = 0;
    let obstacleTimer = 0;
    let obstacleInterval = 300;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        gameContext.clearRect(0,0,game.width, game.height);
        background.draw(gameContext);
        if (!gameInitialState) {
            background.update();
            spawnObstacle(deltaTime);
        }
        displayText(gameContext);
        player.draw(gameContext);
        player.update(input);
        if (!gameOver) requestAnimationFrame(animate);

    }
    animate(0);
});