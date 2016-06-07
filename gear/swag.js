setTimeout(function() {

    if (!document.querySelector("article")) return;

     document.querySelector("article").innerHTML = ''
    swag.start();

    swag.onRight = function() {
        document.querySelector('#dir').innerHTML = "right ===>>>>>";
        clearTimeout(window.xc)
        window.xc = setTimeout(function() { document.querySelector('#dir').innerHTML = "" }, 1500)


    }

    swag.onLeft = function() {

        document.querySelector('#dir').innerHTML = " <<<<===== left"
        clearTimeout(window.xc)
        window.xc = setTimeout(function() { document.querySelector('#dir').innerHTML = "" }, 1500)


    }


}, 500)



var swag = {
	visible: 0, //debugger show the motion cam on page
    sensitivity: 50, //value from 0 to 100% sensitive
    filteredTotal: 0, //number of changed pixel after filtering
    minTotalChange: 300, //300	//minimum total number of pixels that need to change, before we decide that a gesture is happening
    minDirChange: 6, //minimum number of pixels that need to change to assert a directional change
    state: 0, //States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

    stream: 0,
    video: 0,
    context: 0,
    priorFrame: false,
    priorGesture: {},
    onRight: null,
    onLeft: null
}



swag.start = function() {


    //init 
    var sdiv = document.createElement("div");

    sdiv.innerHTML = '<div id="swagview" style="position:fixed; bottom:0; left:0;"> <video style="display:none" width="300" height="225" ></video>' +
        '<canvas id="out" width="300" height="225"></canvas><div id="dir"></div>  </div>'

    if (swag.visible)	
	    document.body.appendChild(sdiv)


    swag.video = sdiv.querySelector("video");

    // alert(swag.video)

    swag.context = sdiv.querySelector("#out").getContext('2d');




    if (!navigator.webkitGetUserMedia) //firefox 
        navigator.webkitGetUserMedia = navigator.mozGetUserMedia;

    navigator.webkitGetUserMedia({video: 1}, function(stream) {

        swag.stream = stream;

        swag.video.src = window.URL.createObjectURL(stream);

        swag.video.play();

        setInterval(swag.process, 40); //fps

    }, function() {});

    return this
};

swag.stop = function() {
    // debugger
    swag.stream.getTracks()[0].stop();
};

swag.process = function() {

    var video = swag.video,
        context = swag.context,
        priorFrame = swag.priorFrame,
        minDirChange = swag.minDirChange,
        width = video.width,
        height = video.height;

    swag.context.drawImage(video, 0, 0, width, height);

    var currentFrame = context.getImageData(0, 0, width, height);

    skinFilter.apply(currentFrame)



    //calculate the difference map

    var delt = context.createImageData(width, height),
        totalx = 0,
        totaly = 0,
        totald = 0; //total number of changed pixels

    if (!priorFrame) {
        swag.priorFrame = currentFrame;
        return;
    }

    var totaln = delt.width * delt.height,
        pix = totaln * 4,
        maxAssessableColorChange = 256 * 3;

    while ((pix -= 4) >= 0) {
        //find the total change in color for this pixel-set
        var d = Math.abs(currentFrame.data[pix] - priorFrame.data[pix]) +
            Math.abs(currentFrame.data[pix + 1] - priorFrame.data[pix + 1]) +
            Math.abs(currentFrame.data[pix + 2] - priorFrame.data[pix + 2]); //don't do [pix+3] because alpha doesn't change

        if (d > maxAssessableColorChange * Math.abs((swag.sensitivity - 100) / 100)) {

            //if there has been significant change in color, mark the changed pixel
            delt.data[pix] = 0; //R
            delt.data[pix + 1] = 0; //G
            delt.data[pix + 2] = d / 3; //B
            delt.data[pix + 3] = 255; //alpha
            totald += 1;
            totalx += ((pix / 4) % delt.width);
            totaly += (Math.floor((pix / 4) / delt.height));
        } else {

            //otherwise keep it the same color
            // delt.data[pix] = currentFrame.data[pix];
            // delt.data[pix + 1] = currentFrame.data[pix + 1];
            // delt.data[pix + 2] = currentFrame.data[pix + 2];
            // delt.data[pix + 3] = currentFrame.data[pix + 3]; //change to 0 to hide user video
        }
    }


    //draw the diff
    swag.context.putImageData(delt, 0, 0);

    var movement = {
        x: totalx / totald,
        y: totaly / totald,
        d: totald //delta (or total change)
    };
    var filteringFactor = 0.9;

    //filtering
    swag.filteredTotal = (filteringFactor * swag.filteredTotal) + ((1 - filteringFactor) * movement.d);

    var dfilteredTotal = movement.d - swag.filteredTotal,
        good = dfilteredTotal > swag.minTotalChange; //check that total pixel change is grater than threshold

    //console.log(good, dfilteredTotal);
    if (swag.state == 0) {
        if (good) {
            //found a gesture, waiting for next move
            swag.state = 1;
            swag.priorGesture = movement;
        }

    } else if (swag.state == 1) {
        //got next move, do something based on direction
        swag.state = 2;

        var dx = movement.x - swag.priorGesture.x,
            dy = movement.y - swag.priorGesture.y,

            dirx = Math.abs(dy) < Math.abs(dx); //(dx,dy) is on a bowtie

        //console.log(dirx, dx, dy);
        if (dx < -minDirChange && dirx)
            if (swag.onRight) swag.onRight()
            else if (dx > minDirChange && dirx)
            if (swag.onLeft) swag.onLeft()


    } else if (swag.state == 2) {
        //wait for gesture to end
        if (!good) {
            swag.state = 0; //gesture ended
        }

    }



    swag.priorFrame = currentFrame;
}



skinFilter = {
	huemin: 0.0,
	huemax: 0.1,
	satmin: 0.3,
	satmax: 1.0,
	valmin: 0.4,
	valmax: 1.0,
	rgb2hsv: function (r, g, b){
		r = r / 255;
		g = g / 255;
		b = b / 255;

		var max = Math.max(r, g, b),
			min = Math.min(r, g, b),

			h, s, v = max,

			d = max - min;

		if (max === 0) {
			s = 0;
		} else {
			s = d/max;
		}

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch(max){
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
				default:
					break;
			}
			h /= 6;
		}

		return [h, s, v];
	},
	apply: function(currentFrame) {
		var totalPix = currentFrame.width * currentFrame.height,
			indexValue = totalPix * 4,
			countDataBigAry = 0;

		for (var y = 0; y < currentFrame.height; y++)
		{
			for (var x = 0 ; x < currentFrame.width ; x++)
			{
				indexValue = x + y * currentFrame.width;
				var r = currentFrame.data[countDataBigAry],
					g = currentFrame.data[countDataBigAry+1],
					b = currentFrame.data[countDataBigAry+2],
					a = currentFrame.data[countDataBigAry+3],

					hsv = this.rgb2hsv(r,g,b);

				//when the hand is too close (hsv[0] > 0.59 && hsv[0] < 1.0)
				//skin range on HSV values
				if ( ( (hsv[0] > this.huemin && hsv[0] < this.huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0) ) && (hsv[1] > this.satmin && hsv[1] < this.satmax) && (hsv[2] > this.valmin && hsv[2] < this.valmax) ) {
					currentFrame[countDataBigAry]   = r;
					currentFrame[countDataBigAry+1] = g;
					currentFrame[countDataBigAry+2] = b;
					currentFrame[countDataBigAry+3] = a;
				} else {
					currentFrame.data[countDataBigAry]		= 255;
					currentFrame.data[countDataBigAry+1]	= 255;
					currentFrame.data[countDataBigAry+2]	= 255;
					currentFrame.data[countDataBigAry+3]	= 0;
				}
				countDataBigAry = indexValue * 4;
			}
		}
		return currentFrame;
	}
}


// COMPARISON OF THREE COLOUR SPACES IN SKIN DETECTION (2009)
// http://wwwsst.ums.edu.my/data/file/Su7YcHiV9AK5.pdf
// https://github.com/hadimichael/gest.js 
// Copyright (c) 2013, Hadi Michael (http://hadi.io) MIT LICENSE