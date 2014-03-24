
navigator.vibrate = navigator.vibrate ||
	navigator.webkitVibrate ||
	navigator.mozVibrate ||
	navigator.msVibrate;


function vibratePulse(pulse) {
	var pulseArray = [];
	var cycle = 50; // [ms]
	for(var i = 0; i < 50; i++) {
		pulseArray.push(pulse);
		pulseArray.push(50-pulse);
	}
	navigator.vibrate(pulse);
}

