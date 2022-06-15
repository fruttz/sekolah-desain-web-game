var block = document.getElementById("block");
var hole = document.getElementById("hole");
var player = document.getElementById("player");
var jumping = 0;
var score = 0;

hole.addEventListener('animationiteration', () => {
    var random = -((Math.random()*500)+240);
    hole.style.top = random + "px";
    score++;
});

setInterval(function (){
    var playerTop = parseInt(window.getComputedStyle(player).getPropertyValue("top"));
    if(jumping == 0){
        player.style.top = (playerTop + 5) + "px";
    }
    var blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
    var holeTop = parseInt(window.getComputedStyle(hole).getPropertyValue("top"));
    var pTop = -(-800 - playerTop);
    if((playerTop > 760) || ((blockLeft < 40) && (blockLeft > -60) && ((pTop < holeTop) || pTop > holeTop + 200))){
        alert("Game Over. Score: " + (score - 1));
        player.style.top = 160 + "px";
        score = 0;
    }

}, 10);

function jump(){
    jumping = 1;
    let jumpCount = 0;
    var jumpInterval = setInterval(function(){
        var playerTop = parseInt(window.getComputedStyle(player).getPropertyValue("top"));
        if((playerTop > 6) && (jumpCount < 15)){
            player.style.top = (playerTop - 8) + "px";
        }
        if(jumpCount > 20){
            clearInterval(jumpInterval);
            jumping = 0;
            jumpCount = 0;
        }
        jumpCount++;
    }, 10);
}