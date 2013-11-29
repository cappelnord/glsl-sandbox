GLSLAudio= {}

GLSLAudio.start = function (getArrayFunc) {
	var that = {};
	var stack = [];
	var sink;
	
	that.do16Bit = true;
	that.isPlaying = false;
	
	that.updateOnNextFrame = false;
	
	that.sampleRate = 44100;
	
	that.play = function() {
		that.isPlaying = true;
		that.update();
	};
	
	that.pause = function() {
		that.isPlaying = false;
		var i;
		for(i = 0; i < stack.length; i++) {
			stack[i].fadeOut(0.2);
		};
	};
	
	that.update = function(fadeTime) {
		if(that.isPlaying) {
			fadeTime = fadeTime || 0.5;
			var obj = GLSLAudio.buffer(that, getArrayFunc(), fadeTime);
			
			var i;
			for(i = 0; i < stack.length; i++) {
				if(!stack[i].isFadingOut) {
					stack[i].fadeOut();
				}
			}
			stack.push(obj);
		}
	}
	
	var audio_callback = function(buffer, channelCount) {
		var cleanupStack = [];
		var i;
		for(i = 0; i < stack.length; i++) {
			stack[i].render(buffer);
			if(!stack[i].isPlaying) {
				cleanupStack.push(stack[i]);
			}
		}
		for(i = 0; i < cleanupStack.length; i++) {
			var index = stack.indexOf(cleanupStack[i]);
			stack.splice(index, 1);
		}
	}
	
	try {
		sink = Sink(audio_callback, 2, 4096 * 8, that.sampleRate);
	} catch (e) {
		console.log(e);
		return undefined;
	}

	return that;
}

GLSLAudio.buffer = function (host, audioArray, fadeTime) {
	var that = {};
	that.isPlaying = true;
	that.isFadingOut = false;
	
	var level = 0.0;
	var deltaLevel = 1 / host.sampleRate / fadeTime;
	
	var curFrame = 0;
	var maxFrame = audioArray.length / 4;
	
	var do16Bit = host.do16Bit;
	
	var overlapFade = 0.9;
	
	var volumeFunc = function(value) {
		// return value; // linear
		return Math.sin(value * (Math.PI / 2.0));
	};
	
	var get_float_sample = function(array, frame, channel) {
		if(do16Bit) {
			return ((array[frame*4+(channel*2)] * 256) + array[frame*4+(channel*2)+1]) / 32768.0 - 1.0;
		} else {
			return array[frame*4+channel] / 127.0 - 1.0;
		}
	}
	
	that.fadeOut = function (fadeTime) {
		fadeTime = fadeTime || 0.3;
		deltaLevel = -1 / host.sampleRate / fadeTime;
		that.isFadingOut = true;
	};
	
	that.render = function (buffer) {
		for(var i = 0; i < buffer.length; i=i+2) {
			level += deltaLevel;
			if(level >= 1.0) {
				level = 1.0;
				deltaLevel = 0.0;
			}
			if(level <= 0.0) {
				level = 0.0;
				deltaLevel = 0.0;
				that.isPlaying = false;
			}
			var volume = volumeFunc(level) * 0.8;
			
			if(that.isPlaying) {
				buffer[i] = buffer[i] + get_float_sample(audioArray, curFrame, 0) * volume;
				buffer[i+1] = buffer[i+1] +	 get_float_sample(audioArray, curFrame, 1) * volume;
			}
			
			curFrame++;
			if(curFrame >= maxFrame) {
				curFrame = 0;
			}
		}
		
		if(!that.isFadingOut && (maxFrame - (overlapFade * host.sampleRate)) <= curFrame) {
			host.updateOnNextFrame = true;
		}
	}
	return that;
}