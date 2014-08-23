// ゼリーの輪郭を切る関数
function jellyMesh() {
	minlen = 40;
	outline=new Outline();
	cv=new ClosedCurve(minlen);


	cv.addPoint([ 494, 130 ] );
	cv.addPoint([ 454, 127 ] );
	cv.addPoint([ 415, 118 ] );
	cv.addPoint([ 374, 117 ] );
	cv.addPoint([ 334, 120 ] );
	cv.addPoint([ 294, 126 ] );
	cv.addPoint([ 274, 161 ] );
	cv.addPoint([ 267, 201 ] );
	cv.addPoint([ 250, 239 ] );
	cv.addPoint([ 227, 272 ] );
	cv.addPoint([ 221, 312 ] );
	cv.addPoint([ 236, 350 ] );
	cv.addPoint([ 272, 369 ] );
	cv.addPoint([ 310, 383 ] );
	cv.addPoint([ 350, 387 ] );
	cv.addPoint([ 390, 387 ] );
	cv.addPoint([ 430, 389 ] );
	cv.addPoint([ 469, 379 ] );
	cv.addPoint([ 508, 367 ] );
	cv.addPoint([ 540, 341 ] );
	cv.addPoint([ 550, 302 ] );
	cv.addPoint([ 539, 262 ] );
	cv.addPoint([ 514, 230 ] );
	cv.addPoint([ 502, 191 ] );
	cv.addPoint([ 500, 151 ] );
	cv.addPoint([ 479, 116 ] );


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
	console.log("posNum "+physicsModel.pos.length);
	console.log("triNum "+physicsModel.tri.length);
}