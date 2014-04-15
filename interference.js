var context;
var size = 500;
var height = size, width = size;
var center = [Math.floor(width/2), Math.floor(height/2)];
var period = 20;
var momentsCount = 10000;
var radius = 5;
var sources;
var t = 0;
var dt = 1;
var sourcesCount, maximumSources = 20;
var interval = 100;
var fields;

var running = true, showSources = true;

function init() {
	var canvas = document.getElementById('canvas');
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext('2d');
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

	setSources();

	image = context.getImageData(0, 0, width, height);
	run();
}

function createSources (n) {
	sourcesCount = n;
	sources = new Array(sourcesCount);
	if (sourcesCount == 1) {
		sources[0] = new Source(width/2, height/2, period, momentsCount, radius, sourcesCount);
	}
	else
	{
		var R = size/4, alpha;

		for (var i = sourcesCount-1; i>=0; --i) {
			alpha = 2*Math.PI*i/sourcesCount;
			sources[i] = new Source(center[0] + Math.round(R*Math.sin(alpha)),
				center[1] - Math.round(R*Math.cos(alpha)), period, momentsCount, radius, sourcesCount);
		}
	}

	fields = new Array(sourcesCount);
	for (var i = sources.length - 1; i >= 0; i--) {
		fields[i] = new Array(height);
	    for (var y = height - 1; y >= 0; y--) {
	    	fields[i][y] = new Array(width);
		}
	}
}

function run() {
    var pixels = image.data;
	
	var index = 0;
	for (var i = sources.length - 1; i >= 0; i--) {
		sources[i].setField(fields[i], t);
	}
    for (var y = height - 1; y >= 0; y--) {		
		for (var x = width - 1; x >= 0; x--) {
			var val = 0.0;
			for (var i = sources.length - 1; i >= 0; i--) {
		    	val += fields[i][y][x];
	    	}

	    	pixels[index] = val;
	        pixels[index + 1] = val;
	        pixels[index + 2] = val;
	        pixels[index + 3] = pixels[index + 3];
	        index += 4;
		}
	}
	if (showSources)
		for (var i = sources.length - 1; i >= 0; i--)
			sources[i].draw(image);
    context.putImageData(image, 0, 0);  
	t += dt;
	if (running)
		setTimeout(run, interval);
}

function setSources () {
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


function Source(x, y, period, momentsCount, radius, sourcesCount) {
	var self = this;

	this.x = x;
	this.y = y;
	this.period = period;
	this.momentsCount = momentsCount;
	this.sourcesCount = sourcesCount;

	this.radius = radius;

	this.D = calculateDistance();
	this.S = calculateSin();

	function calculateDistance() {
		var D = new Array(height);
		for (var y = height - 1; y >= 0; y--) {					
			D[y] = new Array(width);
			for (var x = width - 1; x >= 0; x--) {
				D[y][x] = Math.round(distance([x, height-y], [self.x, self.y])%period/period*momentsCount);
			}				
		}
		return D;

		function distance(a, b) {
			return Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]));
		}
	}

	function calculateSin() {
		var S = new Array(self.momentsCount);
		var arg = 0, step = 2*Math.PI/self.momentsCount;
		for(var i = self.momentsCount-1; i>=0; --i, arg += step) {
			S[i] = Math.floor(255.0*(Math.sin(arg)+1)/(2*self.sourcesCount));
		}
		return S;
	}

	this.draw = function(image) {
		var pixels = image.data;
		index = 4*(width*y + x - radius);
		for (var j = 4*(2*radius-1); j>=0; j -= 4) {
			pixels[index + j] = 255.0;
	        pixels[index + j + 1] = 0;
	        pixels[index + j + 2] = 0;
	        pixels[index + j + 3] = pixels[index + j + 3];
		}

		index = 4*(width*(y - radius) + x);
		for (var j = 4*width*(2*radius-1); j>=0; j -= 4*width) {
			pixels[index + j] = 255.0;
	        pixels[index + j + 1] = 0;
	        pixels[index + j + 2] = 0;
	        pixels[index + j + 3] = pixels[index + j + 3];
		}
	}

	this.setField = function(f, t) {
		var shift = t%period/period*momentsCount;
		var moment;
		for (var y = height - 1; y >= 0; y--) {		
			for (var x = width - 1; x >= 0; x--) {
				moment = this.D[y][x] - shift;
				moment = moment >=0 ? moment : moment + momentsCount;
				f[y][x] = this.S[moment]
			}
		}
	}
}
