var canvas, context;
var size = 700;
var height = size, width = size;
var center = [Math.floor(width/2), Math.floor(height/2)];
var pixelSize = 2;
var wavelength = 35;
var period = 20;
var momentsCount = 10000;
var sources;
var startTime = 0, curTime = startTime;
var diff = 0;
var radius = 4;
var step = 1;
var S;
var sourcesCount, maximumSources = 25;
var interval = 50;

var running = true, showSources = true;

function init() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;

	context.fillStyle="white";
	context.fillRect(0,0,width,height);

	var select = document.getElementById('select');
	for (var i = 1; i<=maximumSources; ++i) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		select.appendChild(opt);
	}
	select.options[3].selected = true;

	changeSources();

	image = context.getImageData(0, 0, width, height);
	run();
}

function createSources (n) {
	sourcesCount = n;
	sources = new Array(sourcesCount);
	if (sourcesCount == 1) {
		sources[0] = [width/2, height/2];
	}
	else
	{
		var R = size/4, alpha;

		for (var i = sourcesCount-1; i>=0; --i) {
			alpha = 2*Math.PI*i/sourcesCount;
			sources[i] = [center[0] + Math.round(R*Math.sin(alpha)), center[1] - Math.round(R*Math.cos(alpha))];
		}
	}
	S = calculateSinuses(period, momentsCount);
	D = calculateDistances(sources);
}

function drawSources (sources, radius) {
	var pixels = image.data;
	for (var i = sources.length - 1; i >= 0; i--) {
		index = 4*(width*sources[i][1] + sources[i][0] - radius);
		for (var j = 4*(2*radius-1); j>=0; j -= 4) {
			pixels[index + j] = 255.0;
	        pixels[index + j + 1] = 0;
	        pixels[index + j + 2] = 0;
	        pixels[index + j + 3] = pixels[index + j + 3];
		}

		index = 4*(width*(sources[i][1] - radius) + sources[i][0]);
		for (var j = 4*width*(2*radius-1); j>=0; j -= 4*width) {
			pixels[index + j] = 255.0;
	        pixels[index + j + 1] = 0;
	        pixels[index + j + 2] = 0;
	        pixels[index + j + 3] = pixels[index + j + 3];
		}
	}
}

function run() {
    var pixels = image.data;

	var shift = (curTime-startTime)%period/period*momentsCount;
	var index = 0, d, moment;
    for (var y = height - 1; y >= 0; y--) {		
		for (var x = width - 1; x >= 0; x--) {
			var val = 0.0;
			for (var i = sources.length - 1; i >= 0; i--) {
				moment = D[y][x][i] - shift;
				moment = moment >=0 ? moment : moment + momentsCount; 
		    	val += S[moment];
	    	}

	    	pixels[index] = val;
	        pixels[index + 1] = val;
	        pixels[index + 2] = val;
	        pixels[index + 3] = pixels[index + 3];
	        index += 4;
		}
	}
	if (showSources)
		drawSources(sources, radius);		 
    context.putImageData(image, 0, 0);  
	curTime += step;
	if (running)
		setTimeout(run, interval);
}

function calculateSinuses(period, momentsCount) {
	S = new Array(momentsCount);
	var arg = 0, step = 2*Math.PI/momentsCount;
	for(var i = momentsCount-1; i>=0; --i, arg += step) {
		S[i] = (Math.sin(arg)+1)*Math.round((255.0-diff)/(2*sources.length));
	}
	return S;
}

function calculateDistances(sources) {
	var D = new Array(height);
	for (var y = height - 1; y >= 0; y--) {					
		D[y] = new Array(width);
		for (var x = width - 1; x >= 0; x--) {
			D[y][x] = new Array(sources.length);
			for (var i = sources.length - 1; i >= 0; i--) {
				D[y][x][i] = Math.round(distance([x, height-y], sources[i])%period/period*momentsCount);
			}
		}				
	}
	return D;
}

function distance(a, b) {
	return Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]));
}

function changeSources () {
	var select = document.getElementById("select");
	var selectedValue = select.options[select.selectedIndex].value;
	createSources(parseInt(selectedValue, 10));
}

function toggleRunning() {
	running = !running;
	var button = document.getElementById('runButton');
	if (running) {
		button.value = "Pause";
	}
	else {
		button.value = "Run";
	}
	setTimeout(run, interval);
}

function setShowSources() {
	var checkbox = document.getElementById('checkbox');
	showSources = checkbox.checked;
}