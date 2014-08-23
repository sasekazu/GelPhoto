// JavaScript Document
/// <reference path="~/js/globalVals.js" />
/// <reference path="~/js/myLib/outline.js" />
/// <reference path="~/js/myLib/drawUtil.js" />
/// <reference path="~/js/myLib/drawUtilForFEM.js" />
	
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
					if(!intFlag) {
						outline.addClosedLine(cv);
					}
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
		mesh.meshGen();
		for(var i = 0; i < 20; ++i) {
			mesh.laplacianSmoothing();
			// 描画
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			if(!meshFlag) {
				imgMg.drawImage(context);
			}
			drawMesh(context, mesh);
		}
		// 物理モデルの初期化をメッシュ完成直後に行う
		physicsModel = new FEM(mesh.dPos, mesh.tri, outline);
		physicsModel.gripRad=minlen;
		state="physics";
		loopFunc = physicsFunc;
		console.log("posNum "+physicsModel.pos.length);
		console.log("triNum "+physicsModel.tri.length);
	}
	// 描画
	
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	if(!meshFlag) {
		imgMg.drawImage(context);
	}
	drawMesh(context, mesh);

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
		if(mountFlag) {
			imgMg.drawImage(context);
		}
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
	physicsModel.setBoundary(clickState, mousePos, gravityFlag, selfCldFlag, mountFlag);		
	var timeSetB1 = new Date();
	//console.log("setBoundary " + (timeSetB1-timeSetB0) + " [ms]");

	var timeDyn0 = new Date();
	physicsModel.calcDynamicDeformation(0.1);
	var timeDyn1 = new Date();
	//console.log("calcDynamicDeformation " + (timeDyn1 - timeDyn0) + " [ms]");


	// for vibration int the future
	/*
	var touchForce = physicsModel.getForce();
	var forceIntensity = 0;
	for(var i = 0; i < touchForce.length; i++) {
		forceIntensity += numeric.norm2(touchForce[i]);
	}
	console.log(forceIntensity);
	var fMax = 10000;
	var vibVal = Math.round(forceIntensity/fMax);
	vibratePulse(vibVal);
	*/

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
		if(mountFlag) {
			imgMg.drawImage(context);
		}
		drawFEMwithImage(context, physicsModel, imgMg);
	}
	if(dataFlag){
		drawFEMwithData(context, physicsModel);
	}

}