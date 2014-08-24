
// 定数
var fullscreenFlag = false;	// フルスクリーンにするにはこの値をtrueにし，CSSをフルスクリーン用に変える
var imgSc = 1;
var defaultImg = "jelly.jpg?";


// テキストボックスで設定可能な
// パラメータ
var gravity = {x:0, y:0}; // 重力加速度[G]
var minlen=40;
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


var canvas;	// jquery キャンバスオブジェクト ($(#..)による)
var cvs;	// DOMオブジェクト (getElementByIdによる)
var context;
var canvasWidth;
var canvasHeight;

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
	canvas = $("#mViewCanvas");
	cvs = document.getElementById('mViewCanvas');
	context = canvas.get(0).getContext("2d");
	canvasWidth = canvas.width();
	canvasHeight = canvas.height();
}
