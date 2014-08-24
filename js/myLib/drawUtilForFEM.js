/// <reference path="outline.js" />
/// <reference path="fem.js" />
/// <reference path="drawUtil.js" />
/// <reference path="ImageManager.js" />

function drawClosedCurve(context, cv) {
	context.fillStyle = 'rgb(0, 0, 0)'; // 黒
	context.strokeStyle = 'rgb(0, 0, 0)'; // 黒
	for (var i = 0; i < cv.lines.length; ++i) {
		drawLine(context, cv.lines[i].start, cv.lines[i].end);
		drawCircle(context, cv.lines[i].start, 2);
		drawCircle(context, cv.lines[i].end, 2);
	}
	var color = 'rgb(255,0,0)';
	context.fillStyle = color;
	drawCircle(context, cv.endpos, 3);
}


function drawOutLine(context, outline) {
	context.lineWidth = 4.0;
	var color = 'rgb(0,0,0)';
	context.fillStyle = color;
	for (var c = 0; c < outline.closedCurves.length; c++) {
		var cvtmp = outline.closedCurves[c];
		for (var i = 0; i < cvtmp.lines.length; ++i) {
			drawLine(context, cvtmp.lines[i].start, cvtmp.lines[i].end);
			drawCircle(context, cvtmp.lines[i].start, 1);
			drawCircle(context, cvtmp.lines[i].end, 1);
		}
	}		
	context.lineWidth = 1.0;
}


function drawMesh(context, mesh) {
	var color = 'rgb(0,0,0)';
	context.strokeStyle = color;
	context.fillStyle='pink';
	context.globalAlpha = 0.7;
	for (var i = 0; i < mesh.tri.length; ++i) {
		var tri = [mesh.tri[i][0], mesh.tri[i][1], mesh.tri[i][2]];
		if(mesh.triInOut[i]) {
			drawTri(context, mesh.dPos[tri[0]], mesh.dPos[tri[1]], mesh.dPos[tri[2]]);
		}
		drawTriS(context, mesh.dPos[tri[0]], mesh.dPos[tri[1]], mesh.dPos[tri[2]]);
	}
	context.globalAlpha = 1.0;
}


function drawFEMS(context, physicsModel) {
	for(var i=0; i<physicsModel.tri.length; ++i) {
		var color = "rgb(255,100,100)";
		context.fillStyle = color; 
		context.strokeStyle = 'rgb(0, 0, 0)'; 
		drawTriS(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
	}
}


function drawFEM(context, physicsModel, selfCldFlag) {
	// メッシュの描画
	context.strokeStyle = 'black';
	context.fillStyle = 'pink';
	for(var i = 0, len = physicsModel.tri.length; i < len; ++i) {
		if(physicsModel.removedFlag[i]) continue;
		drawTriS(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
		drawTri(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
	}
	if(selfCldFlag) {
		// 表面エッジの描画
		context.lineWidth = 3;
		context.strokeStyle = 'black';
		for(var i = 0, len = physicsModel.surEdge.length; i < len; ++i) {
			drawLine(context, physicsModel.pos[physicsModel.surEdge[i][0]], physicsModel.pos[physicsModel.surEdge[i][1]])
		}
		context.lineWidth = 1;
	}
}

function drawFEMwithImage(context, physicsModel, imgMg) {
	var color='rgb(0,0,0)';
	context.strokeStyle=color;
	color='rgb(220,30,30)';
	context.fillStyle=color;
	for(var i=0; i<physicsModel.tri.length; ++i) {
		if(physicsModel.removedFlag[i]) {
			continue;
		}

		// 三角形でクリップ
		var tri=[physicsModel.tri[i][0], physicsModel.tri[i][1], physicsModel.tri[i][2]];

		var tri1=[
			[physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1] ],
			[physicsModel.initpos[tri[1]][0], physicsModel.initpos[tri[1]][1] ],
			[physicsModel.initpos[tri[2]][0], physicsModel.initpos[tri[2]][1] ]
		];
		var tri2=[
			[physicsModel.pos[tri[0]][0], physicsModel.pos[tri[0]][1] ],
			[physicsModel.pos[tri[1]][0], physicsModel.pos[tri[1]][1] ],
			[physicsModel.pos[tri[2]][0], physicsModel.pos[tri[2]][1] ]
		];

		var aff = getAffineMat(tri1, tri2);
		// 裏返っていないときのみ描画する
		// 裏返り判定はアフィン変換の線形変換部の行列式の符号を見る。負なら裏返り。
		if(aff[0]*aff[3]-aff[1]*aff[2]>=0){
			context.save();
			drawTriClip(context, physicsModel.pos[tri[0]], physicsModel.pos[tri[1]], physicsModel.pos[tri[2]]);
			context.clip();
			// 画像の基準座標系に変換
			context.setTransform(1, 0, 0, 1, 0, 0);
			// 三角形基準座標系に並進変換
			context.transform(1, 0, 0, 1, physicsModel.initpos[tri[0]][0], physicsModel.initpos[tri[0]][1]);
			// 変形に伴うアフィン変換
			context.transform(aff[0], aff[1], aff[2], aff[3], aff[4], aff[5]);
			// 画像の基準座標系に並進変換
			context.transform(1, 0, 0, 1, -physicsModel.initpos[tri[0]][0], -physicsModel.initpos[tri[0]][1]);
			// 画像の描画
			imgMg.drawImage(context);
			context.restore();
		}


	}
}


function drawFEMwithData(context, physicsModel) {
	// メッシュの描画
	context.strokeStyle = 'black';
	for(var i = 0, len = physicsModel.tri.length; i < len; ++i) {
		if(physicsModel.removedFlag[i]) continue;
		if(physicsModel.colTriFlag[i] === 1) {
			context.fillStyle = 'gray';
			drawTri(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
		} else if(physicsModel.colTriFlag[i] === 2) {
			context.fillStyle = 'coral';
			drawTri(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
		}
		drawTriS(context, physicsModel.pos[physicsModel.tri[i][0]], physicsModel.pos[physicsModel.tri[i][1]], physicsModel.pos[physicsModel.tri[i][2]]);
	}


	// 表面ノードの描画
	context.strokeStyle = 'rgb(0, 0, 0)';
	for(var i = 0, len = physicsModel.surNode.length; i < len; ++i) {
		if(physicsModel.colNdFlag[physicsModel.surNode[i]] === 0)
			context.fillStyle = "blue";
		else if(physicsModel.colNdFlag[physicsModel.surNode[i]] === 1)
			context.fillStyle = "red";
		else
			context.fillStyle = "magenta";
		drawCircle(context, physicsModel.pos[physicsModel.surNode[i]], 3);
	}

	// 表面法線ベクトルの描画
	context.strokeStyle = 'green';
	var edgeCenter;
	var nmEnd;
	var edg1, edg2;
	for(var i = 0, len = physicsModel.normal.length; i < len; ++i) {
		var scl = 20;
		edg1 = physicsModel.surEdge[i][0];
		edg2 = physicsModel.surEdge[i][1];
		edgeCenter = numeric.add(physicsModel.pos[edg1], physicsModel.pos[edg2]);
		edgeCenter = numeric.mul(0.5, edgeCenter);
		nmEnd = numeric.mul(scl, physicsModel.normal[i]);
		nmEnd = numeric.add(edgeCenter, nmEnd);
		drawLine(context, edgeCenter, nmEnd);
	}

	// 頂点法線ベクトルの描画
	context.strokeStyle = 'lightseagreen';
	var ndNmStr;
	var ndNmEnd;
	for(var i = 0, len = physicsModel.surNode.length; i < len; ++i) {
		var scl = 20;
		ndNmStr = physicsModel.pos[physicsModel.surNode[i]];
		ndNmEnd = numeric.mul(scl, physicsModel.ndNormal[i])
		ndNmEnd = numeric.add(ndNmStr, ndNmEnd);
		drawLine(context, ndNmStr, ndNmEnd);
	}

	// 外力ベクトルの描画
	context.strokeStyle = 'red';
	var fEnd;
	var force = [0, 0];
	for(var i = 0, len = physicsModel.posNum; i < len; ++i) {
		var scl = 10;
		force[0] = physicsModel.f[2 * i + 0];
		force[1] = physicsModel.f[2 * i + 1];
		force = numeric.mul(0.05, force);
		fEnd = numeric.add(physicsModel.pos[i], force);
		drawLine(context, physicsModel.pos[i], fEnd);
	}

	// タッチ部分における外力ベクトルの描画
	context.lineWidth = 3;
	context.strokeStyle = 'darkblue';
	var touchForce = physicsModel.getForce();
	var tForce = [0,0];
	for(var i = 0; i < touchForce.length; i++) {
		tForce = numeric.mul(-0.05, touchForce[i]);
		drawLine(context, mousePos[i], numeric.add(mousePos[i], tForce));
	}
	context.lineWidth = 1;
}


function drawFPS(context, fps) {
	context.fillStyle = 'black'; 
	context.font = "20px 'Arial'";
	context.textAlign = "left";
	context.fillText(fps + " fps", 30, 30);
}