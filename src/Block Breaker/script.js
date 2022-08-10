window.addEventListener('load', function(){
    //INITIAL SETUP
    const game = document.getElementById('game');
    const ctx = game.getContext('2d');
    const menu = document.getElementById('menu');
    const gameOverUI = document.getElementById('gameoverUI');
    const winUI = document.getElementById('winUI');
    const gameFont = new FontFace('ball', 'url(font/EmblemaOne-Regular.ttf)');
    gameFont.load()
    menu.style.width = "1080px";
    menu.style.height = "1920px";
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
    function showWinUI(){
        winUI.style.display = "block";
    }
    function hideWinUI(){
        winUI.style.display = "none";
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

    //Win State
    const winRestartButton = document.getElementById('winRestart');
    const winExitButton = document.getElementById('winExit');
    
    winRestartButton.addEventListener('click', function(){
        hideWinUI();
        restartGame();
    });
    winExitButton.addEventListener('click', function(){
        hideWinUI();
        hideGameScreen();
        showMainMenu();
        restartGame();
        bgm.pause();
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
    let winState = false;
    let score = 0;

    //Audio
    const bgm = new Audio('audio/bg_music.ogg');
    bgm.volume = 0.2;
    const impactSFX = new Audio('audio/impact.ogg');

    //Player
    var playerHeight = 30;
    var playerWidth = 150;
    var playerX = (game.width - playerWidth)/2;
    var playerY = (game.height - playerHeight) - 50;
    var playerSpeed = 0;
    const playerImage = new Image();
    playerImage.src = ('img/player.png')
    
    function drawPlayer(){
        ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
    }

    //Ball
    var ballRadius = 20;
    var ballX = playerX + playerWidth / 2;
    var ballY = playerY - ballRadius;
    var ballSpeedX = 8;
    var ballSpeedY = -8;
    const ballImage = new Image();
    ballImage.src = ('img/ball.png')

    function drawBall(){
        ctx.drawImage(ballImage, ballX - ballRadius, ballY - ballRadius, ballRadius*2, ballRadius*2);
    }

    //Bricks
    var brickRow = 6;
    var brickColumn = 30;
    var brickWidth = 100;
    var brickHeight = 25;
    var brickPadding = 10;
    var brickTop = (-game.height) + (brickHeight * 5);
    var brickLeft = 55;
    var brickSpeed = 0.15;
    var bricks = [];
    const brickImage = new Image();
    brickImage.src = ('img/brick.png')

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
                    ctx.drawImage(brickImage, bricks[col][row].x, bricks[col][row].y, brickWidth, brickHeight);
                }
            }
        }
    }

    function brickCollisionDetection() {
        for (var col = 0; col < brickColumn; col++){
            for (var row = 0; row < brickRow; row++){
                var b = bricks[col][row];
                //ball collision
                if (b.delete == false && ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight){
                    impactSFX.play();
                    ballSpeedY = -ballSpeedY;
                    b.delete = true;
                    score ++;
                }
                //player collision
                if (b.delete == false && playerX + playerWidth > b.x && playerX < b.x + brickWidth && playerY + playerHeight > b.y && playerY < b.y + brickHeight){
                    gameOver = true;
                    showGameOverUI();
                }
            }
        }
    }


    //Input Handler
    var keys = [];
    var swipeTreshold = 10;
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

    function displayText(context){
        //score text
        context.textAlign = "left";
        context.fillStyle = "white";
        context.font = "bold 30px ball";
        context.fillText("Score: " + score, 20, game.height - 20);

        //initial game text
        if(gameInitialState){
            context.textAlign = "center";
            context.fillStyle = "white";
            context.font = "bold 30px ball";
            context.fillText("TOUCH ANYWHERE TO START", game.width/2, 200);
        }
    }

    //Restart Game
    function restartGame(){
        playerX = (game.width - playerWidth)/2;
        playerSpeed = 0;
        ballX = playerX + playerWidth / 2;
        ballY = playerY - ballRadius;
        ballSpeedX = 8;
        ballSpeedY = -8;
        brickTop = (-game.height) + (brickHeight * 5);
        brickRow = 6;
        brickColumn = 30;
        for (var col = 0; col < brickColumn; col++){
            bricks[col] = [];
            for (var row = 0; row < brickRow; row++){
                bricks[col][row] = { x: 0, y: 0, delete: false};
            }
        }
        gameInitialState = true;
        gameOver = false;
        winState = false;
        score = 0;
        animate();
    }

    //MAIN FUNCTION
    function animate(){
        ctx.clearRect(0, 0, game.width, game.height);
        drawPlayer();
        drawBall();
        drawBricks();
        displayText(ctx);
        brickCollisionDetection();

        //ANIMATE
        if (!gameInitialState) {

            //ball boundaries
            if (ballX + ballSpeedX > game.width - ballRadius || ballX + ballSpeedX < ballRadius) {
                impactSFX.play();
                ballSpeedX = -ballSpeedX;
            }
            if (ballY + ballSpeedY < ballRadius) {
                impactSFX.play();
                ballSpeedY = -ballSpeedY;
            }
            else if (ballY + ballSpeedY > game.height + ballRadius) {
                gameOver = true;
                showGameOverUI();
            }

            //ball movement
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            //player movement
            playerX += playerSpeed;

            if (keys.indexOf('swipe right') > -1) playerSpeed = 10;
            else if (keys.indexOf('swipe left') > -1) playerSpeed = -10;
            else playerSpeed = 0;

            //player boundaries
            if (playerX < 0) playerX = 0;
            else if (playerX > game.width - playerWidth) playerX = game.width - playerWidth

            //player-ball collision
            if (ballX + ballRadius > playerX && ballX < playerX + playerWidth && ballY + ballRadius > playerY && ballY < playerY + playerHeight) {
                impactSFX.play();
                ballSpeedY = -ballSpeedY;
            }

            //update bricks
            brickTop += brickSpeed;
        }

        //DETECT WIN CONDITION
        if (score == (brickColumn * brickRow)) {
            winState = true;
            showWinUI();
        }

        //ANIMATE ONLY IF NOT GAME OVER OR WIN STATE
        if (!gameOver && !winState) requestAnimationFrame(animate);

        
    }

    animate();
});