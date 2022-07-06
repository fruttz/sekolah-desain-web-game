window.addEventListener('load', function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;
    let gameInitialState = true;
    let gameOver = false;
    let score = 0


    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = (this.gameWidth / 2) - (this.width / 2);
            this.y = (this.gameHeight - this.height) - 50;
            this.speed = 0;
        }
        draw(context){
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(input){
            //movement
            this.x += this.speed;

            if (input.keys.indexOf('swipe right') > -1) this.speed = 12;
            else if (input.keys.indexOf('swipe left') > -1) this.speed = -12; 
            else this.speed = 0;

            //boundaries
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
        }
        reset(){
            this.x = (this.gameWidth / 2) - (this.width / 2);
            this.y = (this.gameHeight - this.height) - 50;
            this.speed = 0;
        }
    }

    class Projectile {
        constructor(gameWidth, gameHeight, player){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 10;
            this.height = 10;
            this.x = player.x + player.width / 2;
            this.y = player.y;
            this.speed = 30;
            this.damage = 100;
            this.delete = false;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(){
            //move
            this.y -= this.speed;

            //delete after passing boundary
            if (this.y < (-this.gameHeight + this.height)) this.delete = true;

        }
    }

    let hpArray = [100, 200, 300, 400, 500];
    class Asteroid {
        constructor(gameWidth, gameHeight, hpArray){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.hitpoint = hpArray[Math.floor(Math.random() * hpArray.length)];
            this.width = this.hitpoint;
            this.height = this.hitpoint;
            this.x = ((Math.random() * (this.gameWidth - this.width)));
            this.y = -this.height;
            this.speed = 10;
            this.delete = false;
        }
        draw(context){
            context.fillStyle = 'blue';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(player, projectiles){
            //move
            this.y += this.speed;

            //projectile collision
            for (var i = 0; i < projectiles.length; i++){
                if (projectiles[i].x + projectiles[i].width >= this.x &&
                    projectiles[i].x <= this.x + this.width &&
                    projectiles[i].y + projectiles[i].height >= this.y &&
                    projectiles[i].y <= this.y + this.height){
                        projectiles[i].delete = true;
                        this.hitpoint -= projectiles[i].damage;
                        this.width = this.hitpoint;
                        this.height = this.hitpoint;
                    }
                }

            //delete if hitpoint reaches 0
            if (this.hitpoint === 0) {
                this.delete = true;
                score += 10;
            }
            
            //player collision
            if (player.x + player.width >= this.x &&
                player.x <= this.x + this.width &&
                player.y + player.height >= this.y &&
                player.y <= this.y + this.height) {
                    gameOver = true;
                }
            

            //delete after passing boundary
            if (this.y > this.gameHeight + this.height) this.delete = true;


        }

    }

    class InputHandler {
        constructor(){
            this.keys = [];
            this.swipeTreshold = 20;
            this.touchX = '';
            this.clickX = '';
            this.isClicked = false;

            //mouse controls
            window.addEventListener('mousedown', e => {
                gameInitialState = false;
                this.isClicked = true;
                this.clickX = e.pageX
            });
            window.addEventListener('mousemove', e => {
                if (!this.isClicked) return;
                else {
                    const mouseSwipeDistance = e.pageX - this.clickX;
                    this.swipeTreshold = 30;
                    
                    //swipe left or right
                    if ((mouseSwipeDistance < -this.swipeTreshold) && (this.keys.indexOf('swipe left') === -1)){
                        this.keys.splice(0,this.keys.length);
                        this.keys.push('swipe left');
                        
                    }
                    else if ((mouseSwipeDistance > this.swipeTreshold) && (this.keys.indexOf('swipe right') === -1)){
                        this.keys.splice(0,this.keys.length);
                        this.keys.push('swipe right');
                    }
                }
            });
            window.addEventListener('mouseup', e => {
                this.isClicked = false;
                this.keys.splice(this.keys.indexOf('swipe right'), 1);
                this.keys.splice(this.keys.indexOf('swipe left'), 1);
            });

            //touch controls
            window.addEventListener('touchstart', e => {
                gameInitialState = false;
                this.touchX = e.changedTouches[0].pageX;
                if (gameOver) restartGame();
            });
            window.addEventListener('touchmove', e => {
                const touchSwipeDistance = e.changedTouches[0].pageX - this.touchX;

                //swipe left or right
                if ((touchSwipeDistance < -this.swipeTreshold) && (this.keys.indexOf('swipe left') === -1)){ 
                    this.keys.splice(0,this.keys.length);
                    this.keys.push('swipe left');
                }
                else if ((touchSwipeDistance > this.swipeTreshold) && (this.keys.indexOf('swipe right') === -1)){
                    this.keys.splice(0,this.keys.length);
                    this.keys.push('swipe right');
                }
            });
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('swipe right'), 1);
                this.keys.splice(this.keys.indexOf('swipe left'), 1);
            });

        }
    }

    let projectiles = [];
    let projectileTimer = 0;
    let projectileInterval = 150;
    function shootProjectiles(deltaTime) {
        if (projectileTimer > projectileInterval){
            projectiles.push(new Projectile(canvas.width, canvas.height, player));
            projectileTimer = 0;
        } else {
            projectileTimer += deltaTime;
        }
        projectiles.forEach(projectile => {
            projectile.draw(ctx);
            projectile.update();
        });
        projectiles = projectiles.filter(projectile => !projectile.delete);

    }

    let asteroids = [];
    let asteroidTimer = 0;
    let asteroidInterval = 1500;    
    function spawnAsteroid(deltaTime) {
        if (asteroidTimer > asteroidInterval){
            asteroids.push(new Asteroid(canvas.width, canvas.height, hpArray));
            asteroidTimer = 0;
        } else {
            asteroidTimer += deltaTime;
        }
        asteroids.forEach(asteroid => {
            asteroid.draw(ctx);
            asteroid.update(player, projectiles);
        });
        asteroids = asteroids.filter(asteroid => !asteroid.delete);
    }

    function displayText(context){
        //score text
        context.textAlign = "left";
        context.fillStyle = "white";
        context.font = "bold 40px Monsterrat";
        context.fillText("Score: " + score, 20, 50);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "white";
            context.font = "bold 70px Monsterrat";
            context.fillText("TOUCH ANYWHERE TO START", canvas.width/2, 200);
        }

        //game over text
        if (gameOver){
            context.textAlign = "center";
            context.fillStyle = "white";
            context.font = "bold 70px Monsterrat";
            context.fillText("GAME OVER", canvas.width/2, 200);
            context.fillText("TOUCH TO RESTART", canvas.width/2, 270);
        }
    }

    function restartGame(){
        player.reset();
        asteroids = [];
        projectiles = [];
        score = 0;
        gameInitialState = true;
        gameOver = false;
        animate(0);
    }

    //MAIN GAME
    const player = new Player(canvas.width, canvas.height);
    const input = new InputHandler();
    let lastTime = 0;


    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.draw(ctx);
        player.update(input);
        if (!gameInitialState) {
            shootProjectiles(deltaTime);
            spawnAsteroid(deltaTime);
        }
        displayText(ctx);
        if (!gameOver) requestAnimationFrame(animate)
    }

    animate(0);


});