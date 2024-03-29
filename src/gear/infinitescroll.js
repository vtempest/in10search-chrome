
document.addEventListener("DOMContentLoaded", function(){

  var nextPages = {urls: [], loadedLastTime: Date.now(), loadedLastIndex: 0, }

//pull settings from account sync
if (chrome.storage.sync)
chrome.storage.sync.get({
    enableAutoload: 1,
    enableHoverMode: 1,
    enablePulsateQuery: 1,
    enableInfiniteScroll: 1,
    enableSolarizedColor: 0,
    enableSwag: 0
}, function(options) {
    for (var i in options)
        localStorage[i] = options[i];
});
//urls of google results first 10 pages
for (var i=0;p=document.querySelectorAll("#navcnt .fl")[i];i++)
      nextPages.urls.push(p.href)

//TODO if you instant - tpye a new query it still uses the old one's pages

function ininiteScroll(){


    if (window.enableInfiniteScroll && !window.enableInfiniteScroll.checked || !window.enableAutoload.checked) {
        $("#foot").style.display = "block";
         return;
    }



   
    // detect scroll if at bottom 50px of page
    if (window.innerHeight + window.scrollY + 50 >= document.body.offsetHeight) {


    	//rate limit! 5s to avoid Google CAPTCHA on detection of anti-scrapping scripts   
        if ( Date.now() - nextPages.loadedLastTime > 5000 ) {

             nextPages.loadedLastTime = Date.now();

         
              var xhr = new XMLHttpRequest();
              xhr.addEventListener("load", function(html){

                  var nextPageDOM = new DOMParser().parseFromString(xhr.responseText, "text/html");
                  

                  //append next 10 results to these 10
                  var nextGs = nextPageDOM.querySelectorAll("#ires .g");
                  var gContainer =  document.querySelector(".g").parentNode;

                  for(var g in nextGs)
                    gContainer.appendChild(  nextGs[g]  )



              });
              xhr.open("GET", nextPages.urls[++nextPages.loadedLastIndex]); //request next page 
              xhr.send();


          } else { //if under 5s rate limit, show loading cursor

            $("html").style.cursor = "wait";

            //console.log(5000 + nextPages.loadedLastTime - Date.now() )

            setTimeout(function(){
               //reset cursor, meant to indicate intentional lag of 5s rate limiter
              $("html").style.cursor = "default";
              ininiteScroll();
            }, 5000 + nextPages.loadedLastTime - Date.now() );


          }



    }




  }



  window.addEventListener("scroll", ininiteScroll, 1)
  window.addEventListener("mousewheel", ininiteScroll, 1) //diff is fires even if scrolling over bottom:0


})