window.addEventListener('load', function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    //PLAYER
    var playerHeight = 50;
    var playerWidth = 300;
    var playerX = (canvas.width - playerWidth)/2;
    var playerY = (canvas.height - playerHeight) - 50;
    var playerSpeed = 0;
    
    function drawPlayer(){
        ctx.fillStyle = "#0095DD";
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
    }

    //BALL
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

    //BRICKS
    var brickRow = 5;
    var brickColumn = 30;
    var brickWidth = 200;
    var brickHeight = 50;
    var brickPadding = 10;
    var brickTop = (-canvas.height) + (brickHeight * 5);
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


    //INPUT HANDLER
    var keys = [];
    var swipeTreshold = 20;
    var touchX = '';
    var clickX = '';
    var isClicked = false;

    //mouse controls
    window.addEventListener('mousedown', e => {
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
    window.addEventListener('touchstart', e => {
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

    //MAIN GAME
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall();
        drawPlayer();
        drawBricks();
        collisionDetection();

        //ball boundaries
        if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) ballSpeedX = -ballSpeedX;
        if (ballY + ballSpeedY < ballRadius) ballSpeedY = -ballSpeedY;

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
        else if (playerX > canvas.width - playerWidth) playerX = canvas.width - playerWidth

        //player-ball collision
        if (ballX > playerX && ballX < playerX + playerWidth && ballY > playerY && ballY < playerY + playerHeight) ballSpeedY = -ballSpeedY;

        //update bricks
        brickTop += brickSpeed;



    }

    this.setInterval(animate, 10);
});