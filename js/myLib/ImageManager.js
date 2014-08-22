function ImageManager(imgSc) {
	this.img = new Image();
	this.dx = 0;
	this.dy = 0;
	this.dw = 0;
	this.dh = 0;
	this.imgSc = imgSc;
}


ImageManager.prototype.calcDrawParam = function (canvasObj) {
	var canvasWidth = canvasObj.width();
	var canvasHeight = canvasObj.height();
	if(this.img.height<this.img.width) {
		this.dx=0.5*(1-this.imgSc)*canvasWidth;
		this.dy=0.5*(canvasHeight-this.imgSc*this.img.height/this.img.width*canvasWidth);
		this.dw=this.imgSc*canvasWidth;
		this.dh=this.imgSc*canvasWidth*this.img.height/this.img.width;
	} else {
		this.dx=0.5*(canvasWidth-this.imgSc*this.img.width/this.img.height*canvasHeight);
		this.dy=0.5*(1-this.imgSc)*canvasHeight;
		this.dw=this.imgSc*canvasHeight*this.img.width/this.img.height;
		this.dh=this.imgSc*canvasHeight;
	}
}

ImageManager.prototype.readImg = function(filename){
	this.img.src = filename;
}

ImageManager.prototype.drawImage = function (context) {
	context.drawImage(this.img, this.dx, this.dy, this.dw, this.dh);
}