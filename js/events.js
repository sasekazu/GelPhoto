// JavaScript Document
/// <reference path="~/js/myLib/outline.js" />
/// <reference path="~/js/callbacks.js" />
/// <reference path="~/js/myLib/mouseUtil.js" />



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

function initRadioEvent() {
	mountFlag = ($('input[name="mode"]:checked').val() == "mount");
	$( 'input[name="mode"]:radio' ).change( function() {  
		mountFlag = ($(this).val() == "mount");
		if(mountFlag) {
			// マウントモードに切り替えたとき重力をオフ
			$('#gravityCheckBox').prop('checked', false);
			gravityFlag = false;

			/*
			$("#youngTx").val("10");
			$("#poissonTx").val("0.5");
			$("#densityTx").val("0.001");
			$("#thicknessTx").val("1.0");
			$("#alphaTx").val("0.01");
			$("#betaTx").val("0.01");

			var param = {
				young : Number($("#youngTx").val()),
				poisson : Number($("#poissonTx").val()),
				alpha : Number($("#alphaTx").val()),
				beta : Number($("#betaTx").val()),
				density : Number($("#densityTx").val()),
				thickness : Number($("#thicknessTx").val()),
				gripRad : minlen
			};
			physicsModel.applyParams(param);
			*/

		} else {
			// ポップモードに切り替えたとき重力をオン
			$('#gravityCheckBox').prop('checked', true);
			gravityFlag = true;

			/*
			$("#youngTx").val("100");
			$("#poissonTx").val("0.5");
			$("#densityTx").val("0.001");
			$("#thicknessTx").val("1.0");
			$("#alphaTx").val("0.01");
			$("#betaTx").val("0.01");

			var param = {
				young : Number($("#youngTx").val()),
				poisson : Number($("#poissonTx").val()),
				alpha : Number($("#alphaTx").val()),
				beta : Number($("#betaTx").val()),
				density : Number($("#densityTx").val()),
				thickness : Number($("#thicknessTx").val()),
				gripRad : minlen
			};
			physicsModel.applyParams(param);
			*/

		}
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

		loopFunc = generateMeshFunc;

		/*
		while(mesh.addPoint()) {
			;
		};
		mesh.meshGen();
		for(var i = 0; i < 20; ++i) {
			mesh.laplacianSmoothing();
		}

		// 物理モデルの初期化をメッシュ完成直後に行う
		physicsModel = new FEM(mesh.dPos, mesh.tri, outline);
		physicsModel.gripRad=minlen;

		state="physics";
		loopFunc = physicsFunc;
		console.log("posNum "+physicsModel.pos.length);
		console.log("triNum "+physicsModel.tri.length);
		*/
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

	// 適用メッシュボタン
	$("#applyMeshButton").click(function (){
		minlen = Number($("#meshTx").val());
		outline=new Outline();
		cv=new ClosedCurve(minlen);
		state = "drawOutLine";
		loopFunc = drawOutLineFunc;
	});
	
	// 適用ボタン
	$("#applyButton").click(function(){
		var param = {
			young : Number($("#youngTx").val()),
			poisson : Number($("#poissonTx").val()),
			alpha : Number($("#alphaTx").val()),
			beta : Number($("#betaTx").val()),
			density : Number($("#densityTx").val()),
			thickness : Number($("#thicknessTx").val()),
			gripRad : minlen
		};
		physicsModel = new FEM(mesh.dPos, mesh.tri, param);
	});
	
	//  マウス関連イベント

	// クリックまたはタッチに対する処理
	// 引数はタッチしたキャンパス上の点座標が格納されている配列
	function clickFunc(touches){

		var tmp = getMousePos(canvas, touches);
		if(tmp === null) {
			return;
		}
		mousePos = tmp;

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




