window.addEventListener('load', function(){
    //INITIAL SETUP
    const game = document.getElementById('game');
    const ctx = game.getContext('2d');
    const menu = document.getElementById('menu');
    const gameOverUI = document.getElementById('gameoverUI');
    menu.style.width = "1080px";
    menu.style.height = "1920px";
    game.width = 1080;
    game.height = 1920;

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
    let gameInitialState = true;
    let gameOver = false;

    //Player
    var playerHeight = 50;
    var playerWidth = 300;
    var playerX = (game.width - playerWidth)/2;
    var playerY = (game.height - playerHeight) - 50;
    var playerSpeed = 0;
    
    function drawPlayer(){
        ctx.fillStyle = "#0095DD";
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
    }

    //Ball
    var ballRadius = 50;
    var ballX = playerX + playerWidth / 2;
    var ballY = playerY - ballRadius;
    var ballSpeedX = 10;
    var ballSpeedY = -10;

    function drawBall(){
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
    }

    //Bricks
    var brickRow = 5;
    var brickColumn = 30;
    var brickWidth = 200;
    var brickHeight = 50;
    var brickPadding = 10;
    var brickTop = (-game.height) + (brickHeight * 5);
    var brickLeft = 25;
    var brickSpeed = 0.25;
    var bricks = [];

    for (var col = 0; col < brickColumn; col++){
        bricks[col] = [];
        for (var row = 0; row < brickRow; row++){
            bricks[col][row] = { x: 0, y: 0, delete: false};
        }
    }

    function drawBricks(){
        for (var col = 0; col < brickColumn; col++){
            for (var row = 0; row < brickRow; row++){
                if (!bricks[col][row].delete) {
                    var brickX = (row * (brickWidth + brickPadding)) + brickLeft;
                    var brickY = (col * (brickHeight + brickPadding)) + brickTop;
                    bricks[col][row].x = brickX;
                    bricks[col][row].y = brickY;
                    ctx.fillStyle = "#0095DD";
                    ctx.fillRect(bricks[col][row].x, bricks[col][row].y, brickWidth, brickHeight);
                }
            }
        }
    }

    function collisionDetection() {
        for (var col = 0; col < brickColumn; col++){
            for (var row = 0; row < brickRow; row++){
                var b = bricks[col][row];
                if (b.delete == false && ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight){
                    ballSpeedY = -ballSpeedY;
                    b.delete = true;
                }
            }
        }
    }


    //Input Handler
    var keys = [];
    var swipeTreshold = 20;
    var touchX = '';
    var clickX = '';
    var isClicked = false;

    //mouse controls
    game.addEventListener('mousedown', e => {
        gameInitialState = false;
        isClicked = true;
        clickX = e.pageX;
    });
    window.addEventListener('mouseover', e => {
        if(!isClicked) return;
        else {
            const mouseSwipeDistance = e.pageX - clickX;
            
            //swipe left or right
            if ((mouseSwipeDistance < -swipeTreshold) && (keys.indexOf('swipe left') === -1)){
                keys.splice(0, keys.length);
                keys.push('swipe left');
                
            }
            else if ((mouseSwipeDistance > swipeTreshold) && (keys.indexOf('swipe right') === -1)){
                keys.splice(0, keys.length);
                keys.push('swipe right');
            }
        }

    });
    window.addEventListener('mouseup', e => {
        isClicked = false;
        keys.splice(keys.indexOf('swipe right'), 1);
        keys.splice(keys.indexOf('swipe left'), 1);
    });

    //touch controls
    game.addEventListener('touchstart', e => {
        gameInitialState = false;
        touchX = e.changedTouches[0].pageX;
    });
    window.addEventListener('touchmove', e => {
        const touchSwipeDistance = e.changedTouches[0].pageX - touchX;

        //swipe left or right
        if ((touchSwipeDistance < -swipeTreshold) && (keys.indexOf('swipe left') === -1)){ 
            keys.splice(0,keys.length);
            keys.push('swipe left');
        }
        else if ((touchSwipeDistance > swipeTreshold) && (keys.indexOf('swipe right') === -1)){
            keys.splice(0,keys.length);
            keys.push('swipe right');
        }
    });
    window.addEventListener('touchend', e => {
        keys.splice(keys.indexOf('swipe right'), 1);
        keys.splice(keys.indexOf('swipe left'), 1);
    });

    //Restart Game
    function restartGame(){
        playerX = (game.width - playerWidth)/2;
        playerSpeed = 0;
        ballX = playerX + playerWidth / 2;
        ballY = playerY - ballRadius;
        ballSpeedX = 10;
        ballSpeedY = -10;
        brickTop = (-game.height) + (brickHeight * 5);
        brickRow = 5;
        brickColumn = 30;
        for (var col = 0; col < brickColumn; col++){
            bricks[col] = [];
            for (var row = 0; row < brickRow; row++){
                bricks[col][row] = { x: 0, y: 0, delete: false};
            }
        }
        gameInitialState = true;
        gameOver = false;
        animate();
    }

    //MAIN FUNCTION
    function animate(){
        ctx.clearRect(0, 0, game.width, game.height);
        drawBall();
        drawPlayer();
        drawBricks();
        collisionDetection();

        if (!gameInitialState) {
            //ball boundaries
            if (ballX + ballSpeedX > game.width - ballRadius || ballX + ballSpeedX < ballRadius) ballSpeedX = -ballSpeedX;
            if (ballY + ballSpeedY < ballRadius) ballSpeedY = -ballSpeedY;
            else if (ballY + ballSpeedY > game.height + ballRadius) {
                gameOver = true;
                showGameOverUI();
            }

            //ball movement
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            //player movement
            playerX += playerSpeed;

            if (keys.indexOf('swipe right') > -1) playerSpeed = 15;
            else if (keys.indexOf('swipe left') > -1) playerSpeed = -15;
            else playerSpeed = 0;

            //player boundaries
            if (playerX < 0) playerX = 0;
            else if (playerX > game.width - playerWidth) playerX = game.width - playerWidth

            //player-ball collision
            if (ballX > playerX && ballX < playerX + playerWidth && ballY > playerY && ballY < playerY + playerHeight) ballSpeedY = -ballSpeedY;

            //update bricks
            brickTop += brickSpeed;
        }

        if (!gameOver) requestAnimationFrame(animate);
    }

    animate();
});