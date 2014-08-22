// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="NumericJavascript/numeric-1.2.6.min.js" />
/// <reference path="NumericJavascript/outline.js" />
/// <reference path="delaunay.js" />
/// <reference path="fem.js" />
/// <reference path="vibrate.js" />
/// <reference path="drawUtil.js" />
/// <reference path="parameters.js" />
/// <reference path="globalVals.js" />
/// <reference path="callbacks.js" />
/// <reference path="eventes.js" />
/// <reference path="mouseUtil.js" />
/// <reference path="ImageManager.js" />
/// <reference path="drawUtilForFEM.js" />


$(document).ready(function () {

	// キャンバスのコンテキスト取得
	initCanvas();
	// イベント処理の追加
	initCheckBoxEvent();
	initButtonEvent();
	
	state = "drawOutLine";
	loopFunc = drawOutLineFunc;

	// 基本的にwindow sizeは変えないことにする
	// タブレット版は変えたほうが良いかも
	/*
	$(window).resize(resizeCanvas);
	function resizeCanvas(){
		canvas.attr("width", $(window).get(0).innerWidth*0.9);
		canvas.attr("height", $(window).get(0).innerHeight*0.7);
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();
	};
	resizeCanvas();	
	*/


	/////////////////////////////////
	// 画像の読み込み
	// 読み込み完了後、mainloopに遷移
	//////////////////////////////////
	imgMg = new ImageManager(imgSc);
	$("#uploadFile").change(function () {
		// 選択されたファイルを取得
		var file=this.files[0];
		// 画像ファイル以外は処理中止
		if(!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
		var reader=new FileReader();
		// File APIを使用し、ローカルファイルを読み込む
		reader.onload=function (evt) {
			// 画像がloadされた後に、canvasに描画する
			imgMg.img.onload=function () {
				imgMg.calcDrawParam(canvas);
				// 画像以外の変数の初期化
				state="drawOutLine";
				cv=new ClosedCurve(minlen);
				outline=new Outline();
				mainloop();
			}
			// 画像のURLをソースに設定
			imgMg.readImage(evt.target.result);
		}
		// ファイルを読み込み、データをBase64でエンコードされたデータURLにして返す
		reader.readAsDataURL(file);
	});
	// 最初の画像を選択
	imgMg.readImage(defaultImg  + new Date().getTime());

	// 画像が読み込まれたときに実行
	imgMg.img.onload=function () {
		imgMg.calcDrawParam(canvas);
		cv=new ClosedCurve(minlen);
		outline=new Outline();
		mainloop();
	}

	// 画像が読み込めない時も実行
	imgMg.img.onerror=function(){
		alert("画像が読み込めません");
		// メッシュ表示モードにする
		$("#meshCheckBox").attr("checked", true);
		cv = new ClosedCurve(minlen);
		outline = new Outline();
		mainloop();
	}


	/////////////////////////////////////////////////////////
	//　メインの処理
	//  無限ループ
	/////////////////////////////////////////////////////////
	function mainloop() {
		loopFunc();
	    setTimeout(mainloop, 20);
	}
	
		
} );
