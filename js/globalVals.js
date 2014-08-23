
// パラメータ
var gravity = {x:0, y:0}; // 重力加速度[G]
var minlen=40;
var imgSc = 1;
var defaultImg = "jelly.jpg?";


// 状態管理用フラグ
var meshFlag;
var gravityFlag;
var fractureFlag;
var dataFlag;
var selfCldFlag;
var audioFlag;
var mountFlag;


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

// 状態管理用変数
var state;
var loopFunc;

function initCanvas() {
	canvas = $("#mViewCanvas");
	cvs = document.getElementById('mViewCanvas');
	context = canvas.get(0).getContext("2d");
	canvasWidth = canvas.width();
	canvasHeight = canvas.height();
}
