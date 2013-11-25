// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="numeric-1.2.6.min.js" />
/// <reference path="outline.js" />
/// <reference path="delaunay.js" />
/// <reference path="fem.js" />


$(document).ready(function () {

	// 2dコンテキストを取得
	var canvas = $("#mViewCanvas");
	var cvs = document.getElementById('mViewCanvas');	// イベント設定用
	var context = canvas.get(0).getContext("2d");
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	
	// マウスポインタに関する変数
	var clickState = "Up";		// Up, Down
	var mousePos = [];

    // 初期状態はアウトライン作成
    var state = "drawOutLine";

    // アウトライン作成用変数
    var outline = new Outline();
    var minlen = 40;
    var minlenfix = 5;
	var cv = new ClosedCurve(minlen);
    var drawingFlag = true;    // 書き終わった後にクリックしなおしてから次の描画を始めるためのフラグ

    // メッシュ作成用変数
    var mesh;

    // 変形計算用変数
    var physicsModel;


	/////////////////////////////////
	// 画像の読み込み
	//////////////////////////////////

	var img = new Image();
	var imgSc;
	var dx;
	var dy;
	var dw;
	var dh;

	$("#uploadFile").change(function () {
		// 選択されたファイルを取得
		var file=this.files[0];
		// 画像ファイル以外は処理中止
		if(!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
		var reader=new FileReader();
		// File APIを使用し、ローカルファイルを読み込む
		reader.onload=function (evt) {
			// 画像がloadされた後に、canvasに描画する
			img.onload=function () {
				imgSc=0.5;
				if(img.height<img.width) {
					dx=0.5*(1-imgSc)*canvasWidth;
					dy=0.5*(canvasHeight-imgSc*img.height/img.width*canvasWidth);
					dw=imgSc*canvasWidth;
					dh=imgSc*canvasWidth*img.height/img.width;
				} else {
					dx=0.5*(canvasWidth-imgSc*img.width/img.height*canvasHeight);
					dy=0.5*(1-imgSc)*canvasHeight;
					dw=imgSc*canvasHeight*img.width/img.height;
					dh=imgSc*canvasHeight;
				}
				// 画像以外の変数の初期化
				state="drawOutLine";
				cv=new ClosedCurve(minlen);
				outline=new Outline();
				mainloop();
			}
			// 画像のURLをソースに設定
			img.src=evt.target.result;
		}
		// ファイルを読み込み、データをBase64でエンコードされたデータURLにして返す
		reader.readAsDataURL(file);
	});

	// 最初の画像を選択
	img.src = "miku.png?" + new Date().getTime();
	/*
	var randnum = Math.floor( Math.random() * 100 );
	switch(randnum%6){
		case 0:
			img.src = "miku.png?" + new Date().getTime();
			break;
		case 1:
			img.src = "bunny.jpg?" + new Date().getTime();
			break;
		case 2:
			img.src = "anpanman.jpg?" + new Date().getTime();
			break;
		case 3:
			img.src = "babapapa.JPG?" + new Date().getTime();
			break;
		case 4:
			img.src = "hrp2.jpg?" + new Date().getTime();
			break;
		case 5:
			img.src = "mumin.gif?" + new Date().getTime();
			break;
	}
			*/

	

	// 画像が読み込まれたときに実行
	img.onload=function () {
		imgSc=0.48;
		if(img.height<img.width) {
			dx=0.5*(1-imgSc)*canvasWidth;
			dy=0.5*(canvasHeight-imgSc*img.height/img.width*canvasWidth);
			dw=imgSc*canvasWidth;
			dh=imgSc*canvasWidth*img.height/img.width;
		} else {
			dx=0.5*(canvasWidth-imgSc*img.width/img.height*canvasHeight);
			dy=0.5*(1-imgSc)*canvasHeight;
			dw=imgSc*canvasHeight*img.width/img.height;
			dh=imgSc*canvasHeight;
		}
		mainloop();
	}


	/////////////////////////////////////////////////////////
	/////////　メインの処理
	/////////////////////////////////////////////////////////
    	
	function mainloop() {

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
		// 画面をリセット
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		// 全体の写真を描画
		context.drawImage(img, dx, dy, dw, dh);

		context.fillStyle = 'rgb(0, 0, 0)'; // 黒
		context.strokeStyle = 'rgb(0, 0, 0)'; // 黒

        // 作成中の曲線の描画
		for (var i = 0; i < cv.lines.length; i++) {
		    drawLine(cv.lines[i].start, cv.lines[i].end);
		    drawCircle(cv.lines[i].start, 2);
		    drawCircle(cv.lines[i].end, 2);
		}
		var color = 'rgb(255,0,0)';
		context.fillStyle = color;
		drawCircle(cv.endpos, 3);

        // 輪郭全体の描画
        context.lineWidth = 4.0;
		var color = 'rgb(0,0,0)';
		context.fillStyle = color;
		for (var c = 0; c < outline.closedCurves.length; c++) {
            var cvtmp = outline.closedCurves[c];
		    for (var i = 0; i < cvtmp.lines.length; i++) {
		        drawLine(cvtmp.lines[i].start, cvtmp.lines[i].end);
		        drawCircle(cvtmp.lines[i].start, 1);
		        drawCircle(cvtmp.lines[i].end, 1);
		    }
		}		
        context.lineWidth = 1.0;

	}
	
	//////////////////////////////////////////////////////////
	//////  メッシュ生成処理
	//////////////////////////////////////////////////////
	function generateMeshFunc() {
		// 描画
		if (!mesh.addPoint()) {
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			context.drawImage(img, dx, dy, dw, dh);
			var color = 'rgb(0,0,0)';
			context.strokeStyle = color;
			for (var i = 0; i < mesh.tri.length; i++) {
				var tri = [mesh.tri[i][0], mesh.tri[i][1], mesh.tri[i][2]];
				drawTriS(mesh.dPos[tri[0]], mesh.dPos[tri[1]], mesh.dPos[tri[2]]);
			}
			return;
		}
	}

	//////////////////////////////////////////////////////////
	//////  固定領域選択の処理
	//////////////////////////////////////////////////////
	function fixFunc() {
		switch (clickState) {
			case "Down":
				if (drawingFlag) {
					cv.addPoint(mousePos[0]);
					// 閉曲線が完成したときの処理
					if (cv.closedFlag) {
						// 固定ノードを追加
						for(var i=0; i<physicsModel.pos.length; i++) {
							if(cv.pointInOrOut(physicsModel.pos[i]))
								physicsModel.fixNode.push(i);
						}
						// 作業用の閉曲線インスタンスを初期化
						cv = new ClosedCurve(minlenfix);
						drawingFlag = false;
					}
				}
				break;
			case "Up":
				drawingFlag = true;
				break;
		}
		// 描画処理
		// 画面をリセット
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		// メッシュの描画
		// 三角形の描画
		var color='rgb(0,0,0)';
		context.strokeStyle=color;
		color='rgb(220,30,30)';
		context.fillStyle=color;
		for(var i=0; i<physicsModel.tri.length; i++) {
			if(physicsModel.removedFlag[i]) continue;
			context.save();

			// 三角形でクリップ
			var tri=[physicsModel.tri[i][0], physicsModel.tri[i][1], physicsModel.tri[i][2]];
			drawTriClip(physicsModel.pos[tri[0]], physicsModel.pos[tri[1]], physicsModel.pos[tri[2]]);
			context.clip();

			var tri1=[
				[physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1], ],
				[physicsModel.initpos[tri[1]][0], physicsModel.initpos[tri[1]][1], ],
				[physicsModel.initpos[tri[2]][0], physicsModel.initpos[tri[2]][1], ],
			];
			var tri2=[
				[physicsModel.pos[tri[0]][0], physicsModel.pos[tri[0]][1], ],
				[physicsModel.pos[tri[1]][0], physicsModel.pos[tri[1]][1], ],
				[physicsModel.pos[tri[2]][0], physicsModel.pos[tri[2]][1], ],
			];

			// 画像の基準座標系に変換
			context.setTransform(1, 0, 0, 1, 0, 0);
			// 三角形基準座標系に並進変換
			context.transform(1, 0, 0, 1, physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1]);
			// 変形に伴うアフィン変換
			var aff=getAffineMat(tri1, tri2);
			context.transform(aff[0], aff[1], aff[2], aff[3], aff[4], aff[5]);
			// 画像の基準座標系に並進変換
			context.transform(1, 0, 0, 1, -physicsModel.initpos[tri[0]][0], -physicsModel.initpos[tri[0]][1]);
			// 画像の描画
			context.drawImage(img, dx, dy, dw, dh);

			context.restore();

            var color = "rgb(255,100,100)";
   			context.fillStyle = color; 
			context.strokeStyle = 'rgb(0, 0, 0)'; 
			drawTriS(physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
		}

		// 固定点の描画
		var color='rgb(100, 100, 100)';
		context.strokeStyle=color;
		context.fillStyle=color;
		for(var i=0; i<physicsModel.pos.length; i++) 
			drawCircle(physicsModel.pos[i], 3);

		// 固定点の描画
		var color='rgb(200, 0, 0)';
		context.strokeStyle=color;
		context.fillStyle=color;
		for(var i=0; i<physicsModel.fixNode.length; i++) {
			var n=physicsModel.fixNode[i];
			drawCircle(physicsModel.pos[n], 3);
		}


		// 作成中の曲線の描画
		context.fillStyle = 'rgb(0, 0, 0)'; // 黒
		context.strokeStyle = 'rgb(0, 0, 0)'; // 黒
		for (var i = 0; i < cv.lines.length; i++) 
			drawLine(cv.lines[i].start, cv.lines[i].end);

	}
	//////////////////////////////////////////////////////////
	//////  変形計算の処理
	//////////////////////////////////////////////////////
	function physicsFunc() {

		var gravityFlag = $('#gravityCheckBox').is(':checked');

		physicsModel.setBoudary(clickState, mousePos, gravityFlag);		
		physicsModel.calcDynamicDeformation(0.1);


        // 描画処理
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0, 0, canvasWidth, canvasHeight);


        // 三角形の描画
		var color = 'rgb(0,0,0)';
		context.strokeStyle = color;
        color = 'rgb(220,30,30)';
		context.fillStyle = color;
		for(var i=0; i<physicsModel.tri.length; i++){
            if(physicsModel.removedFlag[i]) continue;
			context.save();

            // 三角形でクリップ
			var tri = [physicsModel.tri[i][0], physicsModel.tri[i][1], physicsModel.tri[i][2]];
			drawTriClip(physicsModel.pos[tri[0]], physicsModel.pos[tri[1]], physicsModel.pos[tri[2]]);
			context.clip();

			var tri1 = [
				[physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1], ],
				[physicsModel.initpos[tri[1]][0], physicsModel.initpos[tri[1]][1], ],
				[physicsModel.initpos[tri[2]][0], physicsModel.initpos[tri[2]][1], ],
			];
			var tri2 = [
				[physicsModel.pos[tri[0]][0], physicsModel.pos[tri[0]][1], ],
				[physicsModel.pos[tri[1]][0], physicsModel.pos[tri[1]][1], ],
				[physicsModel.pos[tri[2]][0], physicsModel.pos[tri[2]][1], ],
			];


			// 画像の基準座標系に変換
			context.setTransform(1, 0, 0, 1, 0, 0);
			// 三角形基準座標系に並進変換
			context.transform(1, 0, 0, 1, physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1]);
			// 変形に伴うアフィン変換
			var aff = getAffineMat(tri1, tri2);
			context.transform(aff[0], aff[1], aff[2], aff[3], aff[4], aff[5]);
			// 画像の基準座標系に並進変換
			context.transform(1, 0, 0, 1, -physicsModel.initpos[tri[0]][0], -physicsModel.initpos[tri[0]][1]);
			// 画像の描画
			context.drawImage(img, dx, dy, dw, dh);
            
			context.restore();
			/*
            var color = "rgb(255,100,100)";
   			context.fillStyle = color; 
			context.strokeStyle = 'rgb(0, 0, 0)'; 
			drawTri(physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
			drawTriS(physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
			*/
		}		
        
		// マウスのまる
		/*
		var color = 'rgb(255,0,0)';
		context.fillStyle = color; 
		context.strokeStyle = color; 
		for(var i=0; i<mousePos.length; i++)
			drawCircle(mousePos[i], physicsModel.gripRad);
			*/



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
	    for(var i=0; i<20; i++)
	        mesh.laplacianSmoothing();

		// 物理モデルの初期化をメッシュ完成直後に行う
	    physicsModel=new FEM(mesh.dPos, mesh.tri);

	    state="generateMesh";

	});

	// 固定領域選択ボタン
	$("#fixButton").click(function () {
		cv=new ClosedCurve(minlenfix);
		outline=new Outline();
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
		
		mousePos = [];
		
		var canvasOffset = canvas.offset();
		for(var i=0; i<touches.length; i++){
			var canvasX = Math.floor(touches[i].pageX-canvasOffset.left);
			var canvasY = Math.floor(touches[i].pageY-canvasOffset.top);
			if(canvasX < 0 || canvasX > canvasWidth){
				return;
			}
			if(canvasY < 0 || canvasY > canvasHeight){
				return;
			}
			mousePos.push([canvasX, canvasY]);
		}
		clickState = "Down";

        // ホールドノードの決定
        if(state == "physics")
    		physicsModel.selectHoldNodes(mousePos);
	}
	
	// クリックまたはタッチのムーブに対する処理
	// 引数はタッチしたキャンパス上の点座標が格納されている配列
	function moveFunc(touches){
  		mousePos = [];
		var canvasOffset = canvas.offset();
		for(var i=0; i<touches.length; i++){
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
	
	
	
	
	
	//////////////////////////////////////////////////////////
	//////  描画用関数群
	//////////////////////////////////////////////////////////
	
	
		
	// x,y座標軸を描画
	function drawAxis(){
		context.beginPath();
		context.moveTo(0,0);
		context.lineTo(canvasWidth,0);
		context.closePath();
		context.stroke();
		
		context.beginPath();
		context.moveTo(0,0);
		context.lineTo(0,canvasHeight);
		context.closePath();
		context.stroke();
	}
	
	function drawGrid(){
		drawSquareS([-1,-1],[1,-1],[1,1],[-1,1]);
		context.fillStyle = 'rgb(0, 0, 0)'; // 黒
		context.font = "10px 'Arial'";
		context.textAlign = "left";
		p1 = [0,1.0];
		context.fillText("1.0", p1[0], p1[1]);
		p1 = [1.0,0];
		context.fillText("1.0", p1[0], p1[1]);
		p1 = [0,-1.0];
		context.fillText("-1.0", p1[0], p1[1]);
		p1 = [-1.0,0];
		context.fillText("-1.0", p1[0], p1[1]);
	}
	
	// 線を描画する関数
	// 引数は物理座標の２次元ベクトル
	function drawLine(p1, p2){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.stroke();
	}
	
	// 三角形を描画する関数
	// 引数は物理座標の２次元ベクトル
	function drawTri(p1, p2, p3){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.lineTo( p3[0], p3[1]);
		context.closePath();
		context.fill();
	}
	function drawTriS(p1, p2, p3){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.lineTo( p3[0], p3[1]);
		context.closePath();
		context.stroke();
	}


	function drawTriClip(p1, p2, p3){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.lineTo( p3[0], p3[1]);
		context.closePath();
	}
	
	// 四角形を描画する関数
	// 引数は物理座標の2次元ベクトル
	function drawSquare(p1,p2,p3,p4){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.lineTo( p3[0], p3[1]);
		context.lineTo( p4[0], p4[1]);
		context.closePath();
		context.stroke();
		context.fill();
	}
	
	// 四角形を描画する関数
	// 引数は物理座標の2次元ベクトル
	function drawSquareS(p1,p2,p3,p4){
		context.beginPath();
		context.moveTo( p1[0], p1[1]);
		context.lineTo( p2[0], p2[1]);
		context.lineTo( p3[0], p3[1]);
		context.lineTo( p4[0], p4[1]);
		context.closePath();
		context.stroke();
	}
	
	// 円を描画する関数
	// 引数1 x: 物理座標系の位置x
	// 引数2 y: 物理座標系の位置y
	// 引数3 radius: 物理座標系における半径
	function drawCircle(p, radius){
		context.beginPath();
		context.arc( p[0], p[1], radius, 0, 2*Math.PI, true);
		context.stroke();
		context.fill();
	}
	function drawCircleS(p, radius){
		context.beginPath();
		context.arc( p[0], p[1], radius, 0, 2*Math.PI, true);
		context.stroke();
	}

    // 変形前後の三角形からあふぃん変換行列を計算する関数
    // 引数1: 変形前の三角形頂点の位置ベクトル 3 x 2
    // 引数2: 変形後の三角形頂点の位置ベクトル 3 x 2
	function getAffineMat(tri1, tri2) {
		var after = [ 
			[tri2[1][0] - tri2[0][0], tri2[2][0] - tri2[0][0] ],
			[tri2[1][1] - tri2[0][1], tri2[2][1] - tri2[0][1] ]
		]
		var befor = [
			[tri1[1][0] - tri1[0][0], tri1[2][0] - tri1[0][0]],
			[tri1[1][1] - tri1[0][1], tri1[2][1] - tri1[0][1]]
		]
		var befinv = numeric.inv(befor);
		var affmat = numeric.dot(after, befinv);
		var rel = numeric.sub(tri2[0], tri1[0]);
		var aff = [affmat[0][0], affmat[1][0], affmat[0][1], affmat[1][1], rel[0], rel[1]];
		return aff;
	}
	
	
} );

