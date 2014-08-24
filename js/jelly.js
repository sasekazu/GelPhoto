// ゼリーの輪郭を切る関数
function jellyMesh(imgMg) {
	minlen = imgMg.dw/800*40;
	outline=new Outline();
	cv=new ClosedCurve(minlen);

	var points = 
		[
			[ 494, 130 ] ,
			[ 454, 127 ] ,
			[ 415, 118 ] ,
			[ 374, 117 ] ,
			[ 334, 120 ] ,
			[ 294, 126 ] ,
			[ 274, 161 ] ,
			[ 267, 201 ] ,
			[ 250, 239 ] ,
			[ 227, 272 ] ,
			[ 221, 312 ] ,
			[ 236, 350 ] ,
			[ 272, 369 ] ,
			[ 310, 383 ] ,
			[ 350, 387 ] ,
			[ 390, 387 ] ,
			[ 430, 389 ] ,
			[ 469, 379 ] ,
			[ 508, 367 ] ,
			[ 540, 341 ] ,
			[ 550, 302 ] ,
			[ 539, 262 ] ,
			[ 514, 230 ] ,
			[ 502, 191 ] ,
			[ 500, 151 ] ,
			[ 479, 116 ] 
		];
	
	for(var i = 0; i < points.length; ++i) {
		points[i][0] *= imgMg.dw/800;
		points[i][1] *= imgMg.dw/800;
		points[i][0] += imgMg.dx;
		points[i][1] += imgMg.dy;
	}

	for(var i = 0; i < points.length; ++i) {
		cv.addPoint(points[i]);
	}

	outline.addClosedLine(cv);

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
	param = {young:100, poisson:0.5, density:0.001, thickness:1.0, alpha:0.02, beta:0.01};
	physicsModel = new FEM(mesh.dPos, mesh.tri, param);
	physicsModel.gripRad=minlen;
	state="physics";
	loopFunc = physicsFunc;
	fpsMg = new FPSManager();
	console.log("posNum "+physicsModel.pos.length);
	console.log("triNum "+physicsModel.tri.length);
}