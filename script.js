jQuery(document).ready(function($){

	window.StartPutukan = (function(){
		return	window.requestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				function(callback){
					window.setTimeout(callback, 1000 / 60);
				};
	})();


	var canvas = document.getElementById("myCanv"),
		canvas2d = canvas.getContext('2d'),
		canvasHeight = window.innerHeight,
		canvasWidth = window.innerWidth,
		paputoks = [],
		particles = [],
		kulay = 120,
		limitClickTick = 0,
		limitTotal =10,
		timeLaunchAuto = 15,
		timeLaunchTick = 0,
		mousedown = false,
		mouseY,
		mouseX;

	
	PutukanNa();

	
	function setCanvas(){
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
	}

	function randomShit(min, max){
		return Math.random() *(max - min) + min;
	}

	function computeDistance( p1y, p1x, p2y, p2x){
		var yDistance = p1y - p2y,
			xDistance = p1x - p2x;
		return Math.sqrt( Math.pow( xDistance, 2) + Math.pow( yDistance, 2));	

	}

	//left
	function Paputok(sx, sy, tx, ty){
		//actual coor
		this.y = sy;
		this.x = sx;
		// start of coordinates
		this.sy = sy;
		this.sx = sx;
		//target by cursor
		this.ty = ty;
		this.tx = tx;
		//distance to targeted from starting point
		this.targetDistance = computeDistance(sx, sy, tx, ty);
		this.targetDistanceTraveled = 0;
		//past coordinates
		this.coordinates = [];
		this.coordinatesCount = 3;
		//will populate initial coordinates
		while( this.coordinatesCount--){
			this.coordinates.push([this.x, this.y]);
		}
		this.angle = Math.atan2( ty - sy, tx - sx);
		this.speed = 10;
		this.accel = 1;
		this.brightness = randomShit( 40, 70);
		//will circle targeted point
		this.radius = 1.5;

	}

	Paputok.prototype.update = function (index){
		//will remove last item in the array
		this.coordinates.pop();
		//will add coordinates in the array
		this.coordinates.unshift([this.x, this.y]);

		//will speed up the firework
		this.speed *= this.accel;

		//current velocities
		var vx = Math.cos(this.angle) * this.speed,
			vy = Math.sin(this.angle) * this.speed;
		//how far will the paputok velocity applied
		this.distanceTraveled = computeDistance(this.sy, this.sx, this.y + vy, this.x + vx);

		//check if the destination is reached
		if(this.distanceTraveled >= this.targetDistance){
			createParticles(this.tx, this.ty);
			//will remove the paputok
			paputoks.splice(index, 1);

		} else {
			//keep travel
			this.x += vx;
			this.y += vy;

		}	 
	}

	Paputok.prototype.draw = function(){
		canvas2d.beginPath();
		//move last coordinate set and then draw x and y
		canvas2d.moveTo(this.coordinates[this.coordinates.length -1][0], this.coordinates[this.coordinates.length -1][1]);
		canvas2d.lineTo(this.x, this.y);
		canvas2d.strokeStyle = 'hsl(' + kulay + ', 100%, ' + this.brightness + '%)';
		canvas2d.stroke();

		//if you did target a certain point
		canvas2d.beginPath();
		canvas2d.arc(this.x, this.y, this.radius, 0.5, Math.PI * 3);
		canvas2d.stroke();

	}

	function Particle( x, y){
		this.x = x;
		this.y = y;
		//track past coordinates
		this.coordinates = [];
		this.coordinatesCount = 10;
		while(this.coordinatesCount--){
			this.coordinates.push([this.x, this.y]);
		}
		this.angle = randomShit(0, Math.PI * 2);
		this.speed = randomShit(1, 10);
		this.friction = 0.95;
		this.gravity = 1;
		this.kulay = randomShit( kulay - 20, kulay + 20);
		this.brightness = 50;
		this.alpha = 1;
		this.decay = randomShit(0.015 , 0.03);
		this.radius = 1.5


	}

	Particle.prototype.update = function(index){

		this.coordinates.pop();
		this.coordinates.unshift([this.x, this.y]);
		this.speed *= this.friction;
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed + this.gravity;
		this.alpha -= this.decay;

		if(this.alpha <= this.decay){
			particles.splice(index, 1);
		}
	}

	Particle.prototype.draw = function(index){
		canvas2d.beginPath();
		canvas2d.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
		canvas2d.lineTo(this.x, this.y);
		canvas2d.strokeStyle = 'hsla(' + this.kulay + '100%, ' + this.brightness + '%, ' + this.alpha + ')';
		canvas2d.stroke();

	}

	function createParticles(x, y){
		var particleCount = 35;
		while(particleCount--){
			particles.push(new Particle(x ,y));
		}
	}


	function PutukanNa(){
		setCanvas();
		//run endlessly
		StartPutukan(PutukanNa);
		//so that paputok will be different as time passes by
		kulay +=  6;
		//will clear firework via opacity
		canvas2d.globalCompositeOperation = 'destination-out';
		//trails
		canvas2d.fillStyle = 'rgba(0, 7, 0, 7)';
		canvas2d.fillRect(0, 0, canvasWidth, canvasHeight);
		//changes the firework
		canvas2d.globalCompositeOperation = 'lighter';

		//loop every firework
		var m = paputoks.length;
		while(m--){
			paputoks[m].draw();
			paputoks[m].update(m);
		}

		var mp = particles.length;
		while(mp--){
			particles[mp].draw();
			particles[mp].update(mp);
		}

		//lauch paputok automatically
		if(timeLaunchTick >= timeLaunchAuto){
			paputoks.push(new Paputok(canvasWidth /2 , canvasHeight, randomShit(0, canvasWidth), randomShit(0, canvasHeight / 2)));
			timeLaunchTick = 0;
		} else{
			timeLaunchTick++;
		}

	}



});