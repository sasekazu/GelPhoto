

function FPSManager() {
	this.timeLastUpdate = new Date;
	this.timePre = new Date;
	this.fpsForDisplay = 0;
	this.fpsBuf = [];
	this.BUFSIZE = 20;
}


FPSManager.prototype.flush = function () {
	var timeNow = new Date;
	var fps = 1.0/(timeNow -this.timePre)*1000.0;
	this.timePre = timeNow;
	this.fpsBuf.push(fps);
	while(this.fpsBuf.length > this.BUFSIZE) {
		this.fpsBuf.shift();
	}

	if(timeNow - this.timeLastUpdate > 1000) {
		var sum = 0;
		for(var i = 0; i < this.fpsBuf.length; ++i) {
			sum += this.fpsBuf[i];
		}
		this.fpsForDisplay = sum/this.fpsBuf.length;
		this.timeLastUpdate = timeNow;
	}
}


FPSManager.prototype.getFPS = function(){
//	return Math.round(this.fpsForDisplay);
	return Math.round(this.fpsBuf[0]);
}