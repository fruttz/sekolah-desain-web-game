window.addEventListener('load', function(){
    //INITIAL SETUP
    const game = document.getElementById('game');
    const ctx = game.getContext('2d');
    const menu = document.getElementById('menu');
    const gameOverUI = document.getElementById('gameoverUI');
    const gameFont = new FontFace('space', 'url(font/dendritic_voltage.ttf)');
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
        bgm.play();
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
        bgm.pause();
    });


    //GAME ELEMENTS
    let gameInitialState = true;
    let gameOver = false;
    let score = 0

    //Audio & SFX
    const bgm = new Audio('audio/bg_music.ogg');
    bgm.volume = 0.3;
    const projectileHitSFX  = new Audio('audio/projectile_hit.ogg');
    const asteroidExplosionSFX = new Audio('audio/asteroid_explosion.ogg');
    const asteroidPassSFX = new Audio('audio/asteroid_pass.ogg');
    const playerExplosionSFX = new Audio('audio/player_explosion.ogg');
    


    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 75;
            this.height = 75;
            this.x = (this.gameWidth / 2) - (this.width / 2);
            this.y = (this.gameHeight - this.height) - 50;
            this.image = document.getElementById('playerImage');
            this.speed = 0;
            this.explosionSFX = playerExplosionSFX;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
        }
        update(input){
            //movement
            this.x += this.speed;

            if (input.keys.indexOf('swipe right') > -1) this.speed = 8;
            else if (input.keys.indexOf('swipe left') > -1) this.speed = -8; 
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
            this.width = 5;
            this.height = 5;
            this.x = player.x + player.width / 2;
            this.y = player.y;
            this.speed = 25;
            this.damage = 75;
            this.delete = false;
            this.SFX = projectileHitSFX;
        }
        draw(context){
            context.fillStyle = "red";
            context.beginPath();
            context.arc(this.x, this.y, this.width, 0, Math.PI*2);
            context.fill();
        }
        update(){
            //move
            this.y -= this.speed;

            //delete after passing boundary
            if (this.y < -this.gameHeight + 10) this.delete = true;

        }
    }
    
    const hpArray = [75, 150, 225, 300, 375];
    class Asteroid {
        constructor(gameWidth, gameHeight, hpArray){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.hitpoint = hpArray[Math.floor(Math.random() * hpArray.length)];
            this.width = this.hitpoint;
            this.height = this.hitpoint;
            this.x = ((Math.random() * (this.gameWidth - this.width)));
            this.y = -this.height;
            this.image = document.getElementById("asteroidImage")
            this.speed = 5;
            this.delete = false;
            this.explosionSFX = asteroidExplosionSFX;
            this.passSFX = asteroidPassSFX;
        }
        draw(context){
            context.strokeStyle = "blue"
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/4, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(player, projectiles){
            //move
            this.y += this.speed;
            this.yHitbox += this.speed;

            //projectile collision
            for (var i = 0; i < projectiles.length; i++){
                if (projectiles[i].x + projectiles[i].width >= this.x &&
                    projectiles[i].x <= this.x + this.width &&
                    projectiles[i].y + projectiles[i].height >= this.y &&
                    projectiles[i].y <= this.y + this.height){
                        projectiles[i].delete = true;
                        projectiles[i].SFX.play();
                        this.hitpoint -= projectiles[i].damage;
                        this.width = this.hitpoint;
                        this.height = this.hitpoint;
                    }
                }

            //delete if hitpoint reaches 0
            if (this.hitpoint === 0) {
                this.delete = true;
                this.explosionSFX.volume = 0.3;
                this.explosionSFX.play();
                score += 10;
            }
            
            //player collision
            var playerX = player.x - this.x;
            var playerY = player.y - this.y;
            var playerDistance = Math.sqrt(playerX**2 + playerY**2);
            if (playerDistance < player.width/4 + this.width/4) {
                    player.explosionSFX.volume = 0.5;
                    player.explosionSFX.play();
                    bgm.volume = 0.1;
                    gameOver = true;
                }
            

            //delete after passing boundary and reduce score
            if (this.y > this.gameHeight + this.height) {
                score -= 30;
                this.delete = true;
                this.passSFX.play();
            }


        }

    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById("backgroundImage");
            this.x = 0;
            this.y = 0;
            this.width = 1024;
            this.height = 1024;
            this.speed = 3;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x, this.y - this.height, this.width, this.height);
        }
        update(){
            this.y += this.speed;
            if (this.y > this.gameHeight) this.y = 0;
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
            game.addEventListener('mousedown', e => {
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
            game.addEventListener('touchstart', e => {
                gameInitialState = false;
                this.touchX = e.changedTouches[0].pageX;
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
    let projectileInterval = 300;
    function shootProjectiles(deltaTime) {
        if (projectileTimer > projectileInterval){
            projectiles.push(new Projectile(game.width, game.height, player));
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
            asteroids.push(new Asteroid(game.width, game.height, hpArray));
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
        context.font = "20px space";
        context.fillText("Score: " + score, 20, 50);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "white";
            context.font = "30px space";
            context.fillText("TOUCH ANYWHERE TO START", game.width/2, 200);
        }

        //game over text
        if (gameOver){
            showGameOverUI();
        }
    }

    function restartGame(){
        player.reset();
        asteroids = [];
        projectiles = [];
        score = 0;
        gameInitialState = true;
        gameOver = false;
        bgm.volume = 0.3;
        animate(0);
    }

    //MAIN GAME
    const player = new Player(game.width, game.height);
    const input = new InputHandler();
    const background = new Background(game.width, game.height);
    let lastTime = 0;


    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp; 
        ctx.clearRect(0, 0, game.width, game.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input);
        if (!gameInitialState) {
            shootProjectiles(deltaTime);
            spawnAsteroid(deltaTime);
        }
        if (score < 0) {
            bgm.volume = 0.1;
            gameOver = true;
        }
        displayText(ctx);
        if (!gameOver) requestAnimationFrame(animate)
    }

    animate(0);


});