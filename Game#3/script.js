window.addEventListener('load', function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;


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

            if (input.keys.indexOf('d') > -1) this.speed = 12;
            else if (input.keys.indexOf('a') > -1) this.speed = -12; 
            else this.speed = 0;

            //boundaries
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
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
            this.damage = 50;
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

    let hpArray = [50, 100, 150, 200, 250];
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
        update(projectiles){
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
            if (this.hitpoint === 0) this.delete = true;

            //delete after passing boundary
            if (this.y > this.gameHeight + this.height) this.delete = true;


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
            asteroid.update(projectiles);
        });
        asteroids = asteroids.filter(asteroid => !asteroid.delete);
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
        shootProjectiles(deltaTime);
        spawnAsteroid(deltaTime);
        requestAnimationFrame(animate)
    }

    animate(0);


});