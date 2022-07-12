window.addEventListener('load', function(){
    //UI ELEMENTS
    const menu = document.getElementById('menu');
    menu.style.width = "1080px";
    menu.style.height = "1920px";

    //Main Menu
    const playButton = document.getElementById('play');
    const quitButton = document.getElementById('quit');

    playButton.addEventListener('click', function(){
        menu.style.display = "none";
        game.style.display = "block";
    });
    quitButton.addEventListener('click', function(){
        close();
    });




    //GAME ELEMENTS
    const game = document.getElementById('game');
    const gameContext = game.getContext('2d');
    game.width = 1080;
    game.height = 1920;
    let obstacles = [];
    let score = 0;
    let gameInitialState = true;
    let gameOver = false;
    

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = 20;
            this.y = this.gameHeight/2;
            this.speed = 10;
        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);

        }
        update(input){
            //movement
            if (!gameInitialState) this.y += this.speed;

            if ((input.keys.indexOf('click') > -1) || (input.keys.indexOf('touch') > -1)){
                this.speed = -20;
            } else {
                this.speed = 18
            }

            //boundaries
            if (this.y < 0) this.y = 0;
            else if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
                gameOver = true;
            }
        }

        reset(){
            this.x = 20;
            this.y = this.gameHeight/2;
        }

    }

    class Obstacle {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.top = (Math.random() * this.gameHeight/3) + 200;
            this.bottom = (Math.random() * this.gameHeight/3) + 200;
            this.width = 100;
            this.x = this.gameWidth;
            this.markedForDelete = false;
        }

        draw(context){
            context.fillStyle = "red";
            context.fillRect(this.x, 0, this.width, this.top);
            context.fillRect(this.x, this.gameHeight - this.bottom, this.width, this.bottom);
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
            if (player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                ((player.y < 0 + this.top && player.y + player.height > 0) || 
                (player.y + player.height > this.gameHeight - this.bottom && 
                player.y + player.height < this.gameHeight))){
                    gameOver = true;
                }
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
                    if (gameOver) restartGame();
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
                    if (gameOver) restartGame();
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
        context.font = "bold 40px Monsterrat";
        context.fillText("Score: " + score, 20, 50);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 70px Monsterrat";
            context.fillText("TOUCH ANYWHERE TO START", game.width/2, 200);
        }

        //game over text
        if (gameOver){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 70px Monsterrat";
            context.fillText("GAME OVER", game.width/2, 200);
            context.fillText("TOUCH TO RESTART", game.width/2, 270);
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
    let lastTime = 0;
    let obstacleTimer = 0;
    let obstacleInterval = 300;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        gameContext.clearRect(0,0,game.width, game.height);
        player.draw(gameContext);
        player.update(input);
        if (!gameInitialState) spawnObstacle(deltaTime);
        displayText(gameContext);
        if (!gameOver) requestAnimationFrame(animate);

    }
    animate(0);
});