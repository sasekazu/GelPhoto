function AudioManager(){
	////////////////////////////////
	// 1. AudioContextの生成
	try {
		var context = new AudioContext();    // for FireFox
	} catch(e) {
		context = new webkitAudioContext();    // for Chrome, Opera, Safari
	}

	////////////////////////////////
	// 2. OscillatorNodeの生成（音源）
	var osc = context.createOscillator();
	osc.type = 'sine';
	osc.frequency.value = 400;

	////////////////////////////////
	// 3. GainNodeの生成（音量調整）
	this.gain = context.createGain();
	this.gain.gain.value = 0;

	////////////////////////////////
	// 4. 各ノードを接続
	osc.connect(this.gain);
	this.gain.connect(context.destination);

	////////////////////////////////
	// 5. 音声信号の再生（start(when)）
	osc.start(0);
}

AudioManager.prototype.start = function(amplitude){
	this.gain.gain.value = amplitude;
}