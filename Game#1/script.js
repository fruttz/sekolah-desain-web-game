window.addEventListener('load', function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let coins = [];
    let score = 0;

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = 20;
            this.y = this.gameHeight - this.height;
            this.speed = 0;
        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);

        }
        update(input){
            //movement
            this.y += this.speed;
            if (input.keys.indexOf('s') > -1){
                this.speed = 12;
            } else if (input.keys.indexOf('w') > -1){
                this.speed = -12;
            } else {
                this.speed = 0;
            }

            //boundaries
            if (this.y < 0) this.y = 0;
            else if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

    }

    class Coin {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 30;
            this.height = 30;
            this.x = this.gameWidth;
            this.y = (Math.random() * 740) + this.height;
            this.markedForDelete = false;
        }
        draw(context){
            context.fillStyle = "gold";
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(player){
            //move
            this.x -= 5;

            //delete after passing boundary
            if (this.x < 0 - this.width) this.markedForDelete = true;

            //collision detection
            if (player.x + player.width >= this.x && 
                player.x <= this.x + this.width &&
                player.y + player.height >= this.y &&
                player.y <= this.y + this.height){
                this.markedForDelete = true;
                score++;
                }
        }
    }

    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((e.key === "w" || 
                     e.key === "a" || 
                     e.key === "s" || 
                     e.key === "d") 
                    && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
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
    
    function coinSpawn(deltaTime){
        if (coinTimer > coinInterval){
            coins.push(new Coin(canvas.width, canvas.height));
            coinTimer = 0;
        } else {
            coinTimer += deltaTime;
        }
        coins.forEach(coin => {
            coin.draw(ctx);
            coin.update(player);
        });
        coins = coins.filter(coin => !coin.markedForDelete);

    }

    function displayScore(context){
        context.fillStyle = "black";
        context.font = "40px Monsterrat";
        context.fillText("Score: " + score, 20, 50);
    }


    //MAIN GAME
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height); 
    let lastTime = 0;
    let coinTimer = 0;
    let coinInterval = 500;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        player.draw(ctx);
        player.update(input, coins);
        coinSpawn(deltaTime);
        displayScore(ctx);
        requestAnimationFrame(animate);

    }
    animate(0);
});