// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="NumericJavascript/numeric-1.2.6.min.js" />
/// <reference path="NumericJavascript/outline.js" />
/// <reference path="delaunay.js" />
/// <reference path="fem.js" />
/// <reference path="vibrate.js" />
/// <reference path="drawUtil.js" />
/// <reference path="parameters.js" />
/// <reference path="mouseUtil.js" />
/// <reference path="ImageManager.js" />
/// <reference path="drawUtilForFEM.js" />




$(document).ready(function () {

	// チェックボックスのイベント処理
	setCheckBoxEvent();


	// 2dコンテキストを取得
	var canvas = $("#mViewCanvas");
	var cvs = document.getElementById('mViewCanvas');	// イベント設定用
	var context = canvas.get(0).getContext("2d");
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();

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

	
	// マウスポインタに関する変数
	var clickState = "Up";		// Up, Down
	var mousePos = [];

    // 初期状態はアウトライン作成
    var state = "drawOutLine";

    // アウトライン作成用変数
    var outline = new Outline();
	var cv;
    var drawingFlag = true;    // 書き終わった後にクリックしなおしてから次の描画を始めるためのフラグ

    // メッシュ作成用変数
    var mesh;

    // 変形計算用変数
    var physicsModel;

	// 固定領域選択用変数
    var clickPosf=[];
    var dragFlagf=false;


	/////////////////////////////////
	// 画像の読み込み
	//////////////////////////////////
	var imgMg = new ImageManager(imgSc);

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
	/////////　メインの処理
	/////////////////////////////////////////////////////////
    	
	function mainloop() {

		var time0 = new Date();
	    switch (state) {
        case "drawOutLine":
            drawOutLineFunc();
            break;
        case "generateMesh":
            generateMeshFunc();
            break;
    	case "fix":
    		fixFunc();
	    	break;
        case "physics":
            physicsFunc();
            break;
	    }
	    var time1 = new Date();
		//console.log(time1-time0 + " [ms]");

	    setTimeout(mainloop, 20);
	}
	
	
	/////////////////////////////////////////////////////////
	////////　 アウトライン作成関数
	/////////////////////////////////////////////////////////
	function drawOutLineFunc(){
	    switch (clickState) {
	        case "Down":
	            if (drawingFlag) {
	                cv.addPoint(mousePos[0]);
                    // 閉曲線が完成したときの処理
	                if (cv.closedFlag) {
                        // 曲線同士の交差判定を行う
                        var intFlag = false;
                        for (var i = 0; i < outline.closedCurves.length; i++) {
                            if (outline.closedCurves[i].intersect(cv)) {
                                intFlag = true;
                                break;
                            }
                        }
                        // 交差がなければ輪郭に追加する
                        if(!intFlag)
    	                    outline.addClosedLine(cv);
	                    drawingFlag = false;
                        // 作業用の閉曲線インスタンスを初期化
                        cv = new ClosedCurve(minlen);
	                }
	            }
	            break;
            case "Up":
                drawingFlag = true;
                break;
	    }

        // 描画処理
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		// 全体の写真を描画
		if(!meshFlag) {
			imgMg.drawImage(context);
		}
        // 作成中の曲線の描画
		drawClosedCurve(context, cv);
        // 輪郭全体の描画
		drawOutLine(context, outline);

	}
	
	//////////////////////////////////////////////////////////
	//////  メッシュ生成処理
	//////////////////////////////////////////////////////
	function generateMeshFunc() {
		// 描画
		if (!mesh.addPoint()) {
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			imgMg.drawImage(context);
			drawMesh(context, mesh);
		}
	}

	//////////////////////////////////////////////////////////
	//////  固定領域選択の処理
	//////////////////////////////////////////////////////
	function fixFunc() {
		switch (clickState) {
			case "Down":
				if(!dragFlagf) {
					clickPosf=numeric.clone(mousePos[0]);
				}
				dragFlagf=true;
				break;
			case "Up":
				if(dragFlagf) {
					var sub1, sub2, dot;
					for(var i=0; i<physicsModel.pos.length; ++i) {
						sub1=(physicsModel.pos[i][0]-clickPosf[0])*(physicsModel.pos[i][0]-mousePos[0][0]);
						sub2=(physicsModel.pos[i][1]-clickPosf[1])*(physicsModel.pos[i][1]-mousePos[0][1]);
						if(sub1 <= 0 && sub2 <= 0) {
							physicsModel.fixNode.push(i);
						}
					}
					clickPosf=[];
				}
				dragFlagf=false;
				break;
		}
		// 描画処理
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		// メッシュの描画
		if(meshFlag) { 
			drawFEMS(context, physicsModel);
		}else{
			drawFEMwithImage(context, physicsModel, imgMg);
			drawFEMS(context, physicsModel);
		}

		// 固定点の描画
		var color='rgb(100, 100, 100)';
		context.strokeStyle=color;
		context.fillStyle=color;
		for(var i = 0; i < physicsModel.pos.length; ++i) {
			drawCircle(context, physicsModel.pos[i], 3);

		}

		// 固定点の描画
		var color='rgb(200, 0, 0)';
		context.strokeStyle=color;
		context.fillStyle=color;
		var n;
		for(var i=0; i<physicsModel.fixNode.length; ++i) {
			n=physicsModel.fixNode[i];
			drawCircle(context, physicsModel.pos[n], 3);
		}

		// 選択領域の描画
		context.fillStyle = 'rgb(255, 0, 0)'; 
		context.strokeStyle='rgb(255, 0, 0)'; 
		if(clickPosf.length!=0) {
			drawLine(context, clickPosf, [clickPosf[0], mousePos[0][1]]);
			drawLine(context, [clickPosf[0], mousePos[0][1]], mousePos[0]);
			drawLine(context, mousePos[0], [mousePos[0][0], clickPosf[1]]);
			drawLine(context, [mousePos[0][0], clickPosf[1]], clickPosf);
		}

	}
	//////////////////////////////////////////////////////////
	//////  変形計算の処理
	//////////////////////////////////////////////////////
	var colFlagBuf = false;
	function physicsFunc() {

		// 重力加速度の更新
		// PCでは取得した値が下のようになるので、その場合は更新しない
		// chrome: null, ie, firefox: 0
		if(!
			(
			(gravity.x == 0 && gravity.y == 0) 
			||
			(gravity.x == null && gravity.y == null)
			)
		){
			physicsModel.gravity.x = -gravity.x*30;
			physicsModel.gravity.y =  gravity.y*30;
		}

		var timeSetB0 = new Date();
		physicsModel.setBoundary(clickState, mousePos, gravityFlag, selfCldFlag);		
		var timeSetB1 = new Date();
		//console.log("setBoundary " + (timeSetB1-timeSetB0) + " [ms]");

		var timeDyn0 = new Date();
		physicsModel.calcDynamicDeformation(0.1);
		var timeDyn1 = new Date();
		//console.log("calcDynamicDeformation " + (timeDyn1 - timeDyn0) + " [ms]");

		var touchForce = physicsModel.getForce();
		var forceIntensity = 0;
		for(var i = 0; i < touchForce.length; i++) {
			forceIntensity += numeric.norm2(touchForce[i]);
		}

		// for vibration int the future

		//console.log(forceIntensity);
		//var fMax = 10000;
		//var vibVal = Math.round(forceIntensity/fMax);
		//vibratePulse(vibVal);


		var colFlagNow = physicsModel.modifyPosCld(0, 0, canvasWidth, canvasHeight);

		// 音声再生
		// 壁にぶつかったとき（接触無から接触有に切り替わった時）に再生
		if(audioFlag && colFlagNow && !colFlagBuf) {
			document.getElementById("puyon1").play();
		}
		colFlagBuf = colFlagNow;

        if(fractureFlag) {
	        physicsModel.calcStress();
        	physicsModel.removeElement();
        }

        // 描画処理
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		if(meshFlag){
			drawFEM(context, physicsModel, selfCldFlag);
		} else {
			drawFEMwithImage(context, physicsModel, imgMg);
		}
		if(dataFlag){
			drawFEMwithData(context, physicsModel);
		}

	}
		
	//////////////////////////////////////////////////////////
	//////  イベント処理
	//////////////////////////////////////////////////////
		
	// リセットボタン
	$("#resetButton").click(function () {
		cv = new ClosedCurve(minlen);
        outline = new Outline();
        state = "drawOutLine";
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
	    console.log("posNum "+physicsModel.pos.length);
	    console.log("triNum "+physicsModel.tri.length);
	});

	// 固定領域選択ボタン
	$("#fixButton").click(function () {
		state="fix";
	});

	// 固定解除ボタン
	$("#freeButton").click(function () {
		physicsModel.fixNode=[];
	});

    // 変形計算ボタン
	$("#physicsButton").click(function () {
        state = "physics";
	});

	
	//////////////////////////////////////////////////////////
	//////  マウス関連イベント群
	//////////////////////////////////////////////////////////
	
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
	
	
} );
