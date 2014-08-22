﻿// JavaScript Document
/// <reference path="parameters.js" />
/// <reference path="callbacks.js" />


// 加速度センサ値取得イベント
window.addEventListener("devicemotion", function(event1){
	gravity.x = event1.accelerationIncludingGravity.x;
	gravity.y = event1.accelerationIncludingGravity.y;
}, true);
			 


function initCheckBoxEvent() {
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

function initButtonEvent() {
	// リセットボタン
	$("#resetButton").click(function () {
		cv = new ClosedCurve(minlen);
		outline = new Outline();
		state = "drawOutLine";
		loopFunc = drawOutLineFunc;
	});

	// メッシュボタン
	$("#meshButton").click(function () {

		if(outline.closedCurves.length==0) {
			cv=new ClosedCurve(minlen);
			var dx = imgMg.dx;
			var dy = imgMg.dy;
			var dw = imgMg.dw;
			var dh = imgMg.dh;
			cv.addPoint([dx, dy]);
			cv.addPoint([dx, dy+dh]);
			cv.addPoint([dx+dw, dy+dh]);
			cv.addPoint([dx+dw, dy]);
			cv.addPoint([dx, dy]);
			outline.addClosedLine(cv);
		}

		mesh=new DelaunayGen(outline, minlen);
		while(mesh.addPoint()) {
			;
		};
		mesh.meshGen();
		for(var i = 0; i < 20; ++i) {
			mesh.laplacianSmoothing();
		}

		// 物理モデルの初期化をメッシュ完成直後に行う
		//physicsModel = new FEMSparse(mesh.dPos, mesh.tri);
		physicsModel = new FEM(mesh.dPos, mesh.tri, outline);
		physicsModel.gripRad=minlen;

		state="physics";
		loopFunc = physicsFunc;
		console.log("posNum "+physicsModel.pos.length);
		console.log("triNum "+physicsModel.tri.length);
	});

	// 固定領域選択ボタン
	$("#fixButton").click(function () {
		state="fix";
		loopFunc = fixFunc;
	});

	// 固定解除ボタン
	$("#freeButton").click(function () {
		physicsModel.fixNode=[];
	});

	// 変形計算ボタン
	$("#physicsButton").click(function () {
		state = "physics";
		loopFunc = physicsFunc;
	});

	
	//  マウス関連イベント

	// クリックまたはタッチに対する処理
	// 引数はタッチしたキャンパス上の点座標が格納されている配列
	function clickFunc(touches){

		getMousePos(canvas, touches, mousePos);
		if(mousePos == null) {
			return;
		}

		clickState = "Down";

		// ホールドノードの決定
		if(state == "physics") {
			var selected = physicsModel.selectHoldNodes(mousePos);
			// 音声再生
			if(audioFlag && selected) {
				document.getElementById("nyu1").play();
			}
		}
	}
	
	// クリックまたはタッチのムーブに対する処理
	// 引数はタッチしたキャンパス上の点座標が格納されている配列
	function moveFunc(touches){
		mousePos = [];
		var canvasOffset = canvas.offset();
		for(var i=0; i<touches.length; ++i){
			var canvasX = Math.floor(touches[i].pageX-canvasOffset.left);
			var canvasY = Math.floor(touches[i].pageY-canvasOffset.top);
			mousePos.push([canvasX, canvasY]);
		}
	}
	
	function endFunc() {
		clickState = "Up";
	}	
	
	// タブレットのタッチイベント
	cvs.addEventListener('touchstart', function(event) {
		event.preventDefault();
		//マルチタッチの場合、タッチ箇所がリストで取得されます。
		touches = event.touches;
		clickFunc(touches);
	}); 
	
	// タブレットのムーブイベント
	cvs.addEventListener('touchmove', function(event) {
		//マルチタッチの場合、タッチ箇所がリストで取得されます。
		touches = event.touches;
		moveFunc(touches);
	});	

	// タブレットのタッチ終了イベント
	cvs.addEventListener('touchend', function() {
		endFunc();
	});
	
	
	// mouseクリック時のイベントコールバック設定
	$(window).mousedown( function(e){
		touches = [];
		touches[0] = e;
		clickFunc(touches);
	});
	
	
	// mouse移動時のイベントコールバック設定
	$(window).mousemove( function(e){
		//if(clickState == "Up")
		//	return;
		touches = [];
		touches[0] = e;
		moveFunc(touches);
	});
	
	// mouseクリック解除時のイベントコールバック設定
	$(window).mouseup( function(e){
		endFunc();
	});
}



