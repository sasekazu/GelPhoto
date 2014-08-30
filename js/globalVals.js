
// 定数
var fullscreenFlag = false;	// フルスクリーンにするにはこの値をtrueにし，CSSをフルスクリーン用に変える
var imgSc = 1;
var defaultImg = "jelly.jpg?";


// テキストボックスで設定可能な
// パラメータ
var gravity = {x:0, y:0}; // 重力加速度[G]
var minlen;
var young;
var poisson;
var alpha;
var beta;


// 状態管理用フラグ
var imgFlag;
var gravityFlag;
var fractureFlag;
var dataFlag;
var selfCldFlag;
var audioFlag;
var mountFlag;
var state;
var loopFunc;
var fpsMg;

// canvas
var canvas;	// jquery キャンバスオブジェクト ($(#..)による)
var cvs;	// DOMオブジェクト (getElementByIdによる)
var context;
var canvasWidth;
var canvasHeight;

// video
var video;

// マウスポインタに関する変数
var clickState = "Up";		// Up, Down
var mousePos = [];


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


// 画像読み込み用変数
var imgMg;

function initCanvas() {
	canvas = $("#myCanvas");
	cvs = document.getElementById('myCanvas');
	context = canvas.get(0).getContext("2d");
	canvasWidth = canvas.width();
	canvasHeight = canvas.height();
}




function initVideo() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
	video = document.getElementById('myVideo');
	var localStream = null;
	navigator.getUserMedia(
		{video: true, audio: false},
	 
	 function(stream) { // for success case
		console.log(stream);
		video.src = window.URL.createObjectURL(stream);
	 },
	 function(err) { // for error case
		console.log(err);
	 }
	);
}




// for draw video

function drawVideo(){
	try{
		context.drawImage(video, 0, 0, canvas.width(), canvas.height());
	}catch(e){
		if (e.name == "NS_ERROR_NOT_AVAILABLE") {
			// Wait a bit before trying again; you may wish to change the
			// length of this delay.
			setTimeout(drawVideo, 0);
		} else {
			throw e;
		}
	}	
}



function drawFEMwithVideo(context, physicsModel, video, width, height) {
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
			drawVideo();
			context.restore();
		}
	}
}

