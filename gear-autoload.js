

//only on web results
if (["All","Videos","News","Shopping","News","Books"].indexOf(document.querySelector(".hdtb-msel").textContent)>-1)
 init()




function init() {


  if (location.protocol=="https:"){
    location.href = location.href.replace("https","http")+"&gws_rd=ssl";
    return;
  }






document.body.innerHTML+= "<div id='rez'></div>";
  
function positionRez() {
    
    var rezWidth = (document.documentElement.clientWidth-document.querySelector(".g").offsetLeft-document.querySelector(".g").offsetWidth)
    var rezTop = Math.max(0, document.querySelector(".sfbg.nojsv").getBoundingClientRect().bottom+1 );

    document.querySelector("#rez").style.width=rezWidth + "px";
    document.querySelector("#rez").style.top=rezTop + "px";

    window.disableMouseover = true;
    window.longDelayHover=true;



};


window.onresize = positionRez;
window.addEventListener("scroll", positionRez, 1)
window.addEventListener("mousewheel", positionRez, 1) 
positionRez()



document.querySelector("#ires")
.addEventListener("mouseover", function (e){

  console.log(e)

  for (var i in e.path)
      if ( e.path[i].className=="g"){
          doMouseOver(e.path[i]);



        break;
      }

}, 0)

document.querySelector("#ires")
.addEventListener("mouseleave", function (e){

  console.log(e)

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

     if (window.disableMouseover == true) {
        window.disableMouseover = false;
        //return;
      }



      //clear prior intent-to-load in300ms timers
      window.clearTimeout(window.loadPageAfterDelayTimeout);


      //start transition to demonstrate "intent to action"
     // g.className += " current"


      //set a intent-to-load page in 300ms timer, to avoid trigger from fast mouse swipes across whole screen
      window.loadPageAfterDelayTimeout = setTimeout(function () {


          window.longDelayHover=false;

        

        var prior = document.querySelectorAll('.current')
        for (var i in prior) if (g!=prior[i]) prior[i].className = 'g';

             g.className += " current"


             // console.log(this.dataset.url)

               var url = g.querySelector('h3 a').href;
               
               var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

                var rez = document.querySelector("#rez");


          try{ //try loading url into iframe's src



              // "" 


                var preloadId =  g.querySelector('h3 a').dataset.preload || '';

                preload = preloadId ? rez.querySelector("#"+preloadId) :0;



              console.log(preloadId)
              console.log(preload)

                if (preload){ //if already loaded
                  if ( rez.querySelector('.show'))
                    rez.querySelector('.show').className='';

                  preload.className='show';

                  
                  g.dataset.preload = "i" + document.querySelectorAll("#rez iframe").length;


                } else{ //create new iframe for target


                  if ( rez.querySelector('.show'))
                  rez.querySelector('.show').className='';



                var targetUrl =  url;



                targetUrl = location.protocol=="https:"?"https:":"http:" + "//hkrnews.com/get?url=" + targetUrl;



                  
                   g.getElementsByTagName('a')[0].dataset.preload = preloadId = "i" + document.querySelectorAll("#rez iframe").length;


                  rez.innerHTML+=("<iframe  sandbox='allow-same-origin __allow-scripts' class='show' src='"+
                    targetUrl +"' id='" + preloadId + "' >")




                                            

                            document.querySelector('#rez .show').addEventListener('load', function() {

                              //console.log(  "Load Time " + (new Date().getTime() - (window.loadTime||0)) + "ms: "+ this.src );

                              try{

                                var rez = document.querySelector("#rez");

                                rez.contentWindow.onkeydown = keyDownHandler;

                                 rez.contentWindow.focus();


                        //  rez.contentWindow.contentWindow.find("Google" ,0,0,0,0,0,1);

                                    //window.find("Google" ,0,0,0,0,1,1);

                               
                              }catch(e){

                                  // disableJS();



                              }

                               

                            }, 0)





                }





         }   catch(e){ // try inserting scrapped html into iframe, html is fetched via cors-bypassing xhr in bg

          console.log(e)



            chrome.runtime.sendMessage({
                method: 'GET',
                action: 'xhttp',
                url: url
            }, function(responseText) {
               console.log(responseText);
              // return;

               var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

               console.log(domain) // "https://hkrnews.com/get?url="+

               responseText=responseText.replace(/<head[^>]*>/i, "<head><base href='" +domain + "/'>")
                        


                $("#rez").contentDocument.body.innerHTML = responseText;

            });



         }


        }, window.longDelayHover ? 700 : g.querySelector('h3 a').dataset.preload ? 0 : 350) //loadPageAfterDelayTimeout 





}




    

//first on laod
 rs[0].dispatchEvent(new Event('mouseover'));




window.onkeydown = keyDownHandler;

function keyDownHandler(e) {
  var key = e.keyCode;
  var cur = document.querySelector(".current");

      var rez = document.querySelector("#rez"); 

  //next
  if ([39,74].indexOf(key)>-1) 
      cur.nextSibling.dispatchEvent(new Event('mouseover'));


  if ([37,75].indexOf(key)>-1) 
    cur.previousSibling.dispatchEvent(new Event('mouseover'));

  
  cur.scrollIntoViewIfNeeded();




  if ([113].indexOf(key)>-1) {

    window.disablejs=!window.disablejs;

    rez.setAttribute('sandbox',"allow-same-origin" + (disablejs ?  "" : " allow-scripts" ));
      
  }


//  .dispatchEvent(new Event('mouseover'));

}

} // end init()


setInterval(function(){
//window.find(aStringToFind, bCaseSensitive, bBackwards, bWrapAround, bWholeWord, bSearchInFrames, bShowDialog);

//document.querySelector("#rez .show").contentWindow.find("Google" ,0,0,0,0,0,1);

//window.find("Google" ,0,0,0,0,1,1);


},3000)