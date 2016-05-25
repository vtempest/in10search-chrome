
//pull settings from account sync
chrome.storage.sync.get({
    	enableAutoload: 1,
	    enableHoverMode: 1,
	    enablePulsateQuery: 1,
	    enableInfiniteScroll: 1,
	    enableSolarizedColor: false
	}, function(options) {
		localStorage = options;

	});

//before dom content loaded, to reduce twitch
if (localStorage['enableAutoload']!="true"){
	document.querySelector('html').classList.add("disableAutoloadApp"); //remove the css restylings
} else { //if app enabled

	//force http to avoid mixed content CSP block of http iframes on https google
	 if (location.protocol == "https:" && localStorage['enableAutoload']=="true") 
	     location.href = location.href.replace("https", "http") + "&gws_rd=ssl";
	   
}




//util$
function $(s) {
    var e = document.querySelectorAll(s);
    return e.length == 1 ? e[0] : e; 
};

NodeList.prototype.forEach = Array.prototype.forEach;




function xhr(url, cb){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload =  cb(xhr.responseText)
    xhr.onerror = function() {
        console.log(xhr)
    };
    xhr.send();
}



document.addEventListener("DOMContentLoaded", function(){

setTimeout(function(){
    document.querySelector("html").style.opacity = 1;

},30)

//only on specific pages of web results
if (["All", "Videos", "News", "Shopping", "News", "Books"].indexOf($(".hdtb-msel").textContent) == -1)
    return;



//SETTINGS
$("#searchform form").innerHTML += '<div id="config"></div>';

window.addConfig = function(id, label, checked, onchange) {

    $("#config").innerHTML += '<label class="uiToggle"><input id="' + id + '" type="checkbox" ' +
        (localStorage[id] == "true" || localStorage[id]==undefined && checked ? ' checked="checked" ' : '') + 
        '><i class="uiToggle-slide"></i><i class="uiToggle-ball"></i>' + label + '</label>';
    
    setTimeout(function(){ //timeout required or else only last elem's event gets sets
	    //persist settings forever
	    window[id].addEventListener("change", function(){
	    	localStorage[id] = this.checked;
			var options={};
			options[id] = this.checked;
	    	chrome.storage.sync.set(options);
	  		if (onchange) onchange()
		},1)


		//reinit settings to apply on load, except reload functions
		 if (id!="enableAutoload" && window[id])
		 	window[id].dispatchEvent(new Event('change')); 

    },1)

}


addConfig('enableAutoload', 'Enable Autoload', 1, function(){
	setTimeout(function(){
        location.reload();
    }, 500);
});

//if extension disabled, quit after setting the enable switch
if (localStorage['enableAutoload']!="true")	return;


addConfig('enableHoverMode', 'Hover Mode', 1);
addConfig('enablePulsateQuery', 'Pulsate Query', 1);
addConfig('enableInfiniteScroll', 'Infinite Scroll', 1, function() {
    $("#foot").style.display = window.enableInfiniteScroll.checked ? "none" : "block";
    //TODO move cur page up 
});

addConfig('enableSolarizedColor', 'Solarize', 0, function() {
	if (window.enableSolarizedColor.checked){
		document.body.classList.add("solar");
		if ($(".show").contentDocument) $(".show").contentDocument.body.classList.add("solar");
	}	else {
		document.body.classList.remove("solar");
		if ($(".show").contentDocument) $(".show").contentDocument.body.classList.remove("solar");
	}
});

//move google's settings button
window.searchform.appendChild(window.ab_ctls)





//#rez container for iframes, and takes up half the page fixed position
var rez = document.createElement('div');
rez.id = 'rez';
rez.innerHTML = "<div class='loader'>Loading...</div>";
document.body.appendChild(rez);

function positionRez() {
    if (!window.rez || !window.config || !$(".g")[0]) return;

	var rezWidth = document.body.clientWidth - $(".g")[0].clientWidth;
    var rezTop = Math.max(0, $(".sfbg.nojsv").getBoundingClientRect().bottom + 1);

    
    $("#rez").style.width = rezWidth + "px";
    $("#rez").style.top = rezTop + "px";

    //config bar
    var configWidth = document.body.clientWidth - $("#searchform form").clientWidth - $("#gbw>div>div").clientWidth + 20;
    window.config.style.width = configWidth + "px";
 
    // during scrolling, make the intentional lag of mouse hover slightly longer
    window.longDelayHover = true;

};


//listen to mouse over on container of .g then detect if on .g, 
//to avoid having to bind listeners to new .g when those get added

$("body").addEventListener("mouseover", function(e) {

    //if no-hover mode
    if (window.enableHoverMode && !window.enableHoverMode.checked) return;

    for (var i in e.path)
        if (e.path[i].classList &&  Array.prototype.indexOf.call(e.path[i].classList,"g")>-1 ) {
            doMouseOver(e.path[i]);

            break;
        }

}, 0)

$("body").addEventListener("click", function(e) {
    for (var i in e.path)
        if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList,"g")>-1 ) {
            doMouseOver(e.path[i]);

            break;
        }
}, 0)

$("body").addEventListener("mouseout", function(e) {

    for (var i in e.path)
        if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList,"g")>-1 ) {
            doMouseOut();

            break;
        }
}, 0)

//TODO youtube autoplay suprpression


//clear intent-to-load timer if user leaves mouse from g in <300ms
function doMouseOut(g) {
    window.clearTimeout(window.loadPageAfterDelayTimeout);
}


function doMouseOver(g) {

    //clear prior intent-to-load  timers
    window.clearTimeout(window.loadPageAfterDelayTimeout);


    //start transition to demonstrate "intent to action"
    // g.className += " current"


    //set a intent-to-load page in 300ms timer, to avoid trigger from fast mouse swipes across whole screen
    window.loadPageAfterDelayTimeout = setTimeout(function() {

            //clear flag to delay mouseover intent longer, set when scrolling
            window.longDelayHover = false;


            //hide prior rFrames
            document.querySelectorAll('.current').forEach(function(cur){
                if (g != cur)
                    cur.className = 'g';
            })
                
            if (document.querySelector('.show'))
                  document.querySelector('.show').className = '';



                //highlight current .g
                g.className += " current"




                var url = g.querySelector('h3 a,a').href;

                var rez = document.querySelector("#rez");
                if (!rez) return;



                //use preloadId to check if rFrame already loaded then show it

                if (preloadId = g.querySelector('h3 a,a').dataset.preload) {

                    if (rez.querySelector("#" + preloadId)){
                        rez.querySelector("#" + preloadId).style.opacity = 0;
                    
                        rez.querySelector("#" + preloadId).className = 'show';
                        onFrameShow()
                    }

                } else { //create new iframe for target 

                     //set preloadid token into .g link for later recall                 
                    g.querySelectorAll('a')[0].dataset.preload = preloadId = "i" + $("#rez").childNodes.length;



                    xhrFrame(url, preloadId, function(rFrame){

                        //show iframe
                        rFrame.className = 'show';
                        rFrame.style.opacity = 0;

                        //apply scripts to target page dom in the iframe
                        setTimeout(onFrameShow, 130)

                    })
                   
                    

                }; // end create new iframe


                //TODO timeout for preloaded
            }, window.longDelayHover ? 700 : g.querySelector('h3 a,a').dataset.preload ? 50 : 350) //loadPageAfterDelayTimeout 


}


function xhrFrame(url, preloadId, callback){
    //TODO pdf.js

   

    //get target page's html via a bypass cors xhr executed from background.j, inserting scrapped html into iframe
    chrome.runtime.sendMessage({ action: 'xhr', url: url }, function(responseText) {

        if (responseText && responseText.error)
        console.log(responseText.error)

    
    
        var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

        //allow relative resource paths to load using the target's domain
         responseText = responseText && responseText.replace(/<head[^>]*>/i, "<head><base href='" + domain + "/'>"+
             "<style>.solar img{ -webkit-filter: invert(100%) !important; transition: 1.5s; }</style>");

        //error fallback: set iframe src to be served thru hkrnews.com proxy which spoofs headers
        //var targetUrl = (location.protocol=="https:"?"https:":"http:") + "//hkrnews.com/get?url=" + url;


        //create a blank iframe with unique id 
        var rFrame = document.createElement('iframe');

        if (!url.endsWith('pdf'))
            rFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
        
        rFrame.id = preloadId;
        
        

        rez.appendChild(rFrame);
        rFrame.addEventListener("load", function(e){
            console.log(e)
            //this is for redirects on a[href] by user in iframe

        },0)


        //  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

         // var observer = new MutationObserver(onFrameShow);

        //  observer.observe(rFrame.contentDocument.querySelector("html"), { childList: true, subtree: true });


        // if (url.endsWith('pdf'))
        //     alert(responseText.length)

        //set blank iframe html to be the xhr html
        if (url.indexOf("youtube")>-1 || url.indexOf("google.com")>-1 || url.endsWith('pdf')  ) //|| !responseText)
            rFrame.src=url;

        else
        
           rFrame.contentDocument.querySelector("html").innerHTML = responseText;

        callback(rFrame)

        

    }); //end xhr
    
}


//apply scripts to target page dom in the iframe
function onFrameShow() {

    //TODO with timeout not always done
    // $("#rez .show").onload =function() {

    if ($(".show").style)
        $(".show").style.opacity = 1;


    //match solarize except images  

    if( $(".show").contentDocument){

    	if (document.body.classList.contains("solar") )
    		$(".show").contentDocument.body.classList.add("solar");
    	 else 
    	 	$(".show").contentDocument.body.classList.remove("solar");
    }


    //highlight on result page, the subtext from .g result, first phrase/sentence
    var g = document.querySelector('.current');
    if (!g) return;

    var queryTextNode = g.querySelectorAll(".st")[0] ? g.querySelectorAll(".st")[0].cloneNode(1) : false;
    if (queryTextNode && queryTextNode.querySelector(".f"))
        queryTextNode.removeChild(queryTextNode.querySelector(".f"))
    var queryText = queryTextNode? queryTextNode.textContent.replace(/\.\.\.(.?)+/, '').trim() : false;


    //execute commands in the window context of iframe
    var rWindow = $("#rez .show").contentWindow;
    if (!rWindow) return;


    if (rWindow.getSelection().rangeCount) rWindow.getSelection().collapseToStart();
    //window.find(aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog);
    var found = rWindow.find(queryText, 0, 0, 0, 0, 1, 1);


    //searching first subtext phrase can fail if iframe has it as multiline, so find just bold word
    if (!found) {
        var queryBoldWord = g.querySelectorAll("em")[0];
        if (queryBoldWord)
            var found = rWindow.find(queryBoldWord.textContent, 0, 0, 0, 0, 1, 1);
    }

    //scroll to position selection to middle
    if(!$(".show").contentWindow.getSelection().isCollapsed){
        //position highlighted to top
        $(".show").contentWindow.getSelection().anchorNode.parentNode.scrollIntoView(1);
        
        //position highlighted to middle
        $(".show").contentWindow.document.body.scrollTop-=$(".show").contentWindow.innerHeight/2-30

    }

    if (found && window.enablePulsateQuery.checked) {
    	
        var throbTimesToPulsate = 2;


        function throb() {
            var selNode = rWindow.getSelection().anchorNode.parentNode;
            selNode.style.backgroundColor = "#a2c2fa";

            setTimeout(function() {

                selNode.style.backgroundColor = "";

                if (--throbTimesToPulsate)
                    setTimeout(function() {
                        throb();

                    }, 400)

            }, 500)
        }

        throb()

    }



    //TODO
    //enable keyEvents to bubble up to main page
    rWindow.onkeydown = keyDownHandler;

    rWindow.focus();




}; //end onFrameShow








//IFRAME resizable
window.dragSidebar = false;
ires.addEventListener('mousemove',function(e){
  if(this.clientWidth - e.offsetX < 10)
      $("body").style['cursor']='e-resize';
  else if(!dragSidebar)
       $("body").style['cursor']='';
},1)

ires.addEventListener('mouseout',function(e){
    if(!dragSidebar)
        $("body").style['cursor']='';
},1)

ires.addEventListener('mousedown',function(e){
  var start = e.offsetX;
  if(ires.clientWidth - start > 20)
    return;


  dragSidebar = true;

  document.body.addEventListener('mousemove',function(e){
     e.preventDefault();
  },1)
  window.addEventListener('mouseup',function(e){

        console.log(e.pageX)
    $("body").removeEventListener('mousemove',1);

    $("body").removeEventListener('mouseup',1);

    if (dragSidebar){

        dragSidebar = false;
        
        $("#ires").style['max-width']=e.pageX+'px';
        positionRez()
    }
  },1)


   $("#rez .show").contentWindow.addEventListener('mouseup',function(e){

        console.log(e.pageX)
    $("#rez .show").contentWindow.removeEventListener('mousemove',1);

    $("#rez .show").contentWindow.removeEventListener('mouseup',1);

    if (dragSidebar){

        dragSidebar = false;
        
        $("#ires").style['max-width']=e.pageX+ $("#rez .show").getBoundingClientRect().left +  'px';
        positionRez()
    }
  },1)
  


},1);







//KEYBOARD SHORTCUTS
window.onkeypress = keyDownHandler;

function keyDownHandler(e) {
    var key = e.keyCode;
    var cur = $(".current");

    if (e.target.nodeName == "INPUT")
    	return;


    //get index of current
    var gs = $(".g");

    for (i = 0; g = gs[i++];)
        if (g == cur)
            break;


    //next
    if ([39, 74, 9].indexOf(key) > -1) {
        gs[i].dispatchEvent(new Event('click', { 'bubbles': true }));
        gs[i].scrollIntoViewIfNeeded()
    }

    if ([37, 75].indexOf(key) > -1) {
        gs[i - 2].dispatchEvent(new Event('click', { 'bubbles': true }));
        gs[i - 2].scrollIntoViewIfNeeded();
    }


    //settings ctrl+f1 toggles
    if (e.altKey && e.ctrlKey && key >= 49 && key < 55) {
    	var checkbox = window.config.childNodes[key-49];
    	if (checkbox){
    		checkbox = checkbox.querySelector("input");
        	checkbox.checked = !checkbox.checked;
        	checkbox.dispatchEvent(new Event('change'));

	    	e.stopPropagation();	
    	}
	
    }


    if ([113].indexOf(key) > -1) {

        window.disablejs = !window.disablejs;

     //   rez.setAttribute('sandbox', "allow-same-origin" + (disablejs ? "" : " allow-scripts"));

    }



    if (key == 13 ) { //should window lose focus?

        window.open(document.querySelector(".current a").href, "_blank");
    }

}





//FIRST LOAD


//load first result link in iframe
$(".g")[0].dispatchEvent(new Event('click', { 'bubbles': true }));



//preload frames for background cache
setTimeout(function(){

    
    var gs = $(".g");

    for(var i=1;i<4;i++){

        //set preloadid token into .g link for later recall                 
        var url = gs[i].querySelector('h3 a,a').href;

        if (url.indexOf('youtube.com')==-1){

             gs[i].querySelectorAll('a')[0].dataset.preload = preloadId = "i" + ($("#rez").childNodes.length-1+i);
       


            xhrFrame(url, preloadId, function(rFrame){

               // rFrame.style.opacity = 0;
               // rFrame.style.visibility="visible";


                //apply scripts to target frame, useful in pre-cache for scroll position
                onFrameShow();

            })


        }




    }


}, 2000)


//listeners
window.addEventListener("resize", positionRez, 1)
window.addEventListener("scroll", positionRez, 1)
positionRez()
setTimeout(positionRez, 1000) //after new dom elements are loaded

}) //end dom loaded
