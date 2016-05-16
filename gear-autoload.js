//util$
function $(s){ e=document.querySelectorAll(s); return e.length==1? e[0] : e; };


//only on specific pages of web results
if (["All","Videos","News","Shopping","News","Books"].indexOf($(".hdtb-msel").textContent)>-1)
 init()




function init() {

  //force http to avoid mixed content block of http iframes inside https
  if (location.protocol=="https:"){
    location.href = location.href.replace("https","http")+"&gws_rd=ssl";
    return;
  }



//#rez  container for iframes, and takes up half the page fixed position
var rez = document.createElement('div');
rez.id = 'rez';
document.body.appendChild(rez);


  
function positionRez() {
    var rezWidth = (document.documentElement.clientWidth-$(".g")[0].clientWidth)
    var rezTop = Math.max(0, $(".sfbg.nojsv").getBoundingClientRect().bottom+1 );

    $("#rez").style.width=rezWidth + "px";
    $("#rez").style.top=rezTop + "px";

   // during scrolling, make the intentional lag of mouse hover slightly longer
    window.longDelayHover=true;



};


window.addEventListener("resize", positionRez, 1)
window.addEventListener("scroll", positionRez, 1)
positionRez()


//listen to mouse over on container of .g then detect if on .g, 
//to avoid having to bind listeners to new .g when those get added

$("#ires").addEventListener("mouseover", function (e){

    //if no-hover mode
    if (window.disableMouseover)return; 

  for (var i in e.path)
      if ( e.path[i].className=="g"){
          doMouseOver(e.path[i]);

        break;
      }

}, 0)

$("#ires").addEventListener("click", function (e){

  for (var i in e.path)
      if ( e.path[i].className=="g"){
          doMouseOver(e.path[i]);

        break;
      }

}, 0)


$("#ires").addEventListener("mouseleave", function (e){


  for (var i in e.path)
      if ( e.path[i].className=="g"){
        doMouseLeave();

        break;
      }

},0)


//clear intent-to-load timer if user leaves mouse from g in <300ms

function doMouseLeave(g){

      window.clearTimeout(window.loadPageAfterDelayTimeout);

} 



function doMouseOver(g){

      



      //clear prior intent-to-load in300ms timers
      window.clearTimeout(window.loadPageAfterDelayTimeout);


      //start transition to demonstrate "intent to action"
     // g.className += " current"


      //set a intent-to-load page in 300ms timer, to avoid trigger from fast mouse swipes across whole screen
      window.loadPageAfterDelayTimeout = setTimeout(function () {


          window.longDelayHover=false;

         var prior = $('.current');

          if(prior.length)

              $('.current').forEach(function(cur){
                if (g!=cur) 
                  cur.className = 'g';
              })
          else
            prior.className = 'g'

             g.className += " current"


             // console.log(this.dataset.url)

               var url = g.querySelector('h3 a').href;
               
               var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

                var rez = $("#rez");




          // try inserting scrapped html into iframe, html is fetched via cors-bypassing xhr in bg

          //try loading url into iframe's src
            


                var preloadId =  g.querySelector('h3 a').dataset.preload || '';

                preload = preloadId ? rez.querySelector("#"+preloadId) :0;



                if (preload){ //if already loaded then show that iframe
                  if ( rez.querySelector('.show'))
                    rez.querySelector('.show').className='';

                  preload.className='show';

                  
                  g.dataset.preload = "i" + $("#rez iframe").length;


                } else{ //create new iframe for target


                  if ( rez.querySelector('.show'))
                      rez.querySelector('.show').className='';



                    //set preloadid token into .g link for later recall                 
                   g.getElementsByTagName('a')[0].dataset.preload = preloadId = "i" + $("#rez").childNodes.length;




                    //get target page's html via a bypass cors xhr executed from background.js
                    chrome.runtime.sendMessage({action: 'xhr', url: url}, function(responseText) {
                    
                        var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

                        //allow relative resource paths to load using the target's domain
                        responseText=responseText.replace(/<head[^>]*>/i, "<head><base href='" +domain + "/'>")
                                
                        //could also set iframe src to be served thru hkrnews.com proxy which spoofs headers
                        //var targetUrl = (location.protocol=="https:"?"https:":"http:") + "//hkrnews.com/get?url=" + url;


                        //create a blank iframe with unique id 
                        var rFrame = document.createElement('iframe');
                        rFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
                        rFrame.id = preloadId
                        rez.appendChild(rFrame)
                        //set blank iframe html to be the xhr html
                        rFrame.contentDocument.querySelector("html").innerHTML = responseText;
                        
                        rFrame.className='show';
                        


                        //apply scripts to iframe result
                        rFrame.addEventListener('load', function() {

              

                            this.contentWindow.onkeydown = keyDownHandler;

                             this.focus();


                             //  rez.contentWindow.contentWindow.find("Google" ,0,0,0,0,0,1);

                                //window.find("Google" ,0,0,0,0,1,1);

                                                 
                        }, 0)




                    });



                                            



                } // end if create new iframe






        }, window.longDelayHover ? 700 : g.querySelector('h3 a').dataset.preload ? 0 : 350) //loadPageAfterDelayTimeout 


}



//first on load 
$(".g")[0].dispatchEvent(new Event('mouseover', {'bubbles': true} ));



window.onkeydown = keyDownHandler;

function keyDownHandler(e) {
  var key = e.keyCode;
  var cur = $(".current");


  //get index of current
  var gs = $(".g");

  for (i=0;g=gs[i++];)
    if (g==cur)    
      break;


  //next
  if ([39,74].indexOf(key)>-1) 
      gs[i+1].dispatchEvent(new Event('mouseover', {'bubbles': true}));


  if ([37,75].indexOf(key)>-1) 
    gs[i-1].dispatchEvent(new Event('mouseover', {'bubbles': true}));

  
  cur.scrollIntoViewIfNeeded();


  if(key==192) //toggle between onmouseover and onclick  modes
    window.disableMouseover=!window.disableMouseover;

  if ([113].indexOf(key)>-1) {

    window.disablejs=!window.disablejs;

    rez.setAttribute('sandbox',"allow-same-origin" + (disablejs ?  "" : " allow-scripts" ));
      
  }



}

} // end init()
