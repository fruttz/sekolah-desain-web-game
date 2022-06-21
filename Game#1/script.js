window.addEventListener('load', function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;
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

            if ((input.keys.indexOf('w') > -1) || (input.keys.indexOf('touch') > -1)){
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
                ((player.y < 0 + this.top && player.y + player.height) || 
                player.y > this.gameHeight - this.bottom && 
                player.y + player.height < this.gameHeight)){
                    gameOver = true;
                }
        }
    }

    class InputHandler {
        constructor(){
            this.keys = [];

            //key controls
            window.addEventListener('keydown', e => {
                if ((e.key === "w" || 
                     e.key === "a" || 
                     e.key === "s" || 
                     e.key === "d") 
                    && this.keys.indexOf(e.key) === -1){
                        gameInitialState = false;
                        this.keys.push(e.key);
                        if (gameOver) restartGame()
                }
            });
            window.addEventListener('keyup', e => {
                if ((e.key === "w" || 
                     e.key === "a" || 
                     e.key === "s" || 
                     e.key === "d") ){
                        this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });

            //touch controls
            window.addEventListener('touchstart', e => {
                gameInitialState = false;
                if (this.keys.indexOf('touch') === -1) {
                    this.keys.push('touch');
                    if (gameOver) restartGame();
                }
            });
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('touch', -1));
            });

            
        }   
    }
    
     function spawnObstacle(deltaTime){
        if (obstacleTimer > obstacleInterval){
            obstacles.push(new Obstacle(canvas.width, canvas.height));
            obstacleTimer = 0;
        } else {
            obstacleTimer += deltaTime;
        }
        obstacles.forEach(obstacle => {
            obstacle.draw(ctx);
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
            context.fillText("TOUCH ANYWHERE TO START", canvas.width/2, 200);
        }

        //game over text
        if (gameOver){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 70px Monsterrat";
            context.fillText("GAME OVER", canvas.width/2, 200);
            context.fillText("TOUCH TO RESTART", canvas.width/2, 270);
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


    //MAIN GAME
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    let lastTime = 0;
    let obstacleTimer = 0;
    let obstacleInterval = 300;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        player.draw(ctx);
        player.update(input);
        if (!gameInitialState) spawnObstacle(deltaTime);
        displayText(ctx);
        if (!gameOver) requestAnimationFrame(animate);

    }
    animate(0);
});