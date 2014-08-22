
var gravity = {x:0, y:0}; // 重力加速度[G]
var minlen=40;
var imgSc = 1;
var defaultImg = "jelly.jpg?";


var meshFlag;
var gravityFlag;
var fractureFlag;
var dataFlag;
var selfCldFlag;
var audioFlag;

// チェックボックスのイベント処理初期化関数
function setCheckBoxEvent() {
	meshFlag = $('#meshCheckBox').is(':checked');
	$('#meshCheckBox').change(function(){
		meshFlag = $(this).is(':checked');
	});
	gravityFlag = $('#gravityCheckBox').is(':checked');
	$('#gravityCheckBox').change(function(){
		gravityFlag = $(this).is(':checked');
	});
	fractureFlag = $('#fractureCheckBox').is(':checked');
	$('#fractureCheckBox').change(function(){
		fractureFlag = $(this).is(':checked');
	});
	dataFlag = $('#dataCheckBox').is(':checked');
	$('#dataCheckBox').change(function(){
		dataFlag = $(this).is(':checked');
	});
	selfCldFlag = $('#selfCldCheckBox').is(':checked');
	$('#selfCldCheckBox').change(function(){
		selfCldFlag = $(this).is(':checked');
	});
	audioFlag = $('#audioCheckBox').is(':checked');
	$('#audioCheckBox').change(function(){
		audioFlag = $(this).is(':checked');
	});
}


// 加速度センサ値取得イベント
window.addEventListener("devicemotion", function(event1){
    gravity.x = event1.accelerationIncludingGravity.x;
    gravity.y = event1.accelerationIncludingGravity.y;
}, true);
             
