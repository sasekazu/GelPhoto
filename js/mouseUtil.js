
// キャンバス上のマウス位置を取得する関数
// 第1引数：jqueryのcanvasオブジェクト
// 第2引数：クリックまたはタッチのイベントコンテキスト
// 第3引数：マウス位置を出力する配列
function getMousePos(canvasObj, touchesEvent, mousePos) {
	mousePos = [];
	var canvasOffset = canvasObj.offset();
	for(var i=0; i<touchesEvent.length; ++i){
		var canvasX = Math.floor(touchesEvent[i].pageX-canvasOffset.left);
		var canvasY = Math.floor(touchesEvent[i].pageY-canvasOffset.top);
		if(canvasX < 0 || canvasX > canvasObj.width()){
			mousePos = null;
			return;
		}
		if(canvasY < 0 || canvasY > canvasObj.height()){
			mousePos = null;
			return;
		}
		mousePos.push([canvasX, canvasY]);
	}
	return mousePos;
}