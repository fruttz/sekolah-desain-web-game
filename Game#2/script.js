window.addEventListener('load', function() {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height= 500;
    const scale = 20;
    const rows = canvas.height / scale;
    const columns = canvas.width / scale;
    const gameSpeed = 4;
    let score = 0;
    let gameInitialState = true;
    let gameOver = false;

    class Snake {
        constructor(gameWidth, gameHeight){
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;
            this.headX = 100;
            this.headY = this.gameHeight/2;
            this.width = scale;
            this.height = scale;
            this.speedX = 0;
            this.speedY = 0;
            this.tails = [];
            this.totalTail = 0;
            this.currentDirection = "";
        }
        draw(context){
            //head
            context.fillStyle = "green";
            context.fillRect(this.headX, this.headY, this.width, this.height);

            //tails
            for (var i = 0; i < this.tails.length; i++){
                context.fillStyle = "green";
                context.fillRect(this.tails[i].tailX, this.tails[i].tailY, scale, scale);
            }
            
        }
        update(input){
            //MOVEMENT
            for (var i =  0 ; i < this.tails.length - 1;  i++){
                this.tails[i] = this.tails[i + 1];
            }
            this.tails[this.totalTail - 1] = {tailX: this.headX, tailY: this.headY};

            if (!gameInitialState){
                this.headX += this.speedX ;
                this.headY += this.speedY ;
            }
            
            if (input.keys.indexOf('w') > -1 && this.curentDirection != "down"){
                this.speedX = 0;
                this.speedY = -gameSpeed;
                this.curentDirection = "up";
            } else if (input.keys.indexOf('s') > -1 && this.curentDirection != "up"){
                this.speedX = 0;
                this.speedY = gameSpeed;
                this.curentDirection = "down";
            } else if (input.keys.indexOf('a') > -1 && this.curentDirection != "right"){
                this.speedX = -gameSpeed;
                this.speedY = 0;
                this.curentDirection = "left";
            } else if (input.keys.indexOf('d') > -1 && this.curentDirection != "left"){
                this.speedX = gameSpeed;
                this.speedY = 0;
                this.curentDirection = "right";
            }

            //COLLISION DETECTION

            //collision with canvas boundary
            if (this.headX >= (this.gameWidth - this.width) || this.headX < 0 || this.headY >= (this.gameHeight - this.height) || this.headY < 0){
                gameOver = true;
            }

            //collision with tail
            for (var i = 0; i < this.tails.length; i++){
                if (Math.floor(this.headX) == Math.floor(this.tails[i].tailX) && Math.floor(this.headY) == Math.floor(this.tails[i].tailY)) {
                    gameOver = true;
                } 
            }
        }
        reset(){
            this.headX = 100;
            this.headY = this.gameHeight/2;
            this.speedX = 0;
            this.speedY = 0;
            this.tails = [];
            this.totalTail = 0;
            this.currentDirection = "";
        }

    }

    class Fruit {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = scale;
            this.height = scale;
            this.min = scale/10;
            this.max = rows - this.min;
            this.x = Math.floor((Math.random() * (this.max - this.min) + this.min) * scale);
            this.y = Math.floor((Math.random() * (this.max - this.min) + this.min) * scale);
        }
        draw(context){
            context.fillStyle = "red";
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(player){
            //check if snake touches fruit
            if (player.headX + player.width >= this.x && 
                player.headX <= this.x + this.width &&
                player.headY + player.height >= this.y &&
                player.headY <= this.y + this.height){
                    for (var i = 0; i < 10; i++){
                        player.tails.unshift({tailX: player.headX, tailY: player.headY});
                        player.totalTail ++;
                    }
                    score ++; 
                    this.x = Math.floor((Math.random() * (this.max - this.min) + this.min) * scale);
                    this.y = Math.floor((Math.random() * (this.max - this.min) + this.min) * scale);
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
                        if (gameOver) restartGame();
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
        }
    }

    function restartGame(){
        snake.reset();
        score = 0;
        gameInitialState = true;
        gameOver = false;
        animate(0);

    }

    function displayText(context){
        //score text
        context.textAlign = "left";
        context.fillStyle = "black";
        context.font = "bold 16px Monsterrat";
        context.fillText("Score: " + score, 20, 50);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 20px Monsterrat";
            context.fillText("TOUCH ANYWHERE TO START", canvas.width/2, 200);
        }

        //game over text
        if (gameOver){
            context.textAlign = "center";
            context.fillStyle = "black";
            context.font = "bold 20px Monsterrat";
            context.fillText("GAME OVER", canvas.width/2, 200);
            context.fillText("TOUCH TO RESTART", canvas.width/2, 220);
        }

    }

    //MAIN GAME
    const snake = new Snake(canvas.width, canvas.height);
    const input = new InputHandler();
    const fruit = new Fruit(canvas.width, canvas.height);

    function animate(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        if (!gameInitialState) fruit.draw(ctx);
        fruit.update(snake);
        snake.draw(ctx);
        snake.update(input);
        displayText(ctx);
        if (!gameOver) requestAnimationFrame(animate);
    }

    animate();

});