
var gravity = {x:0, y:0}; // 重力加速度[G]
var minlen=40;
var imgSc = 1;
var defaultImg = "jelly.jpg?";



// 加速度センサ値取得イベント
window.addEventListener("devicemotion", function(event1){
    gravity.x = event1.accelerationIncludingGravity.x;
    gravity.y = event1.accelerationIncludingGravity.y;
}, true);
             
