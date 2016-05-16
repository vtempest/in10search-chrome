var nextPages = {urls: [], loadedLastTime: Date.now(), loadedLastIndex: 0, }

//urls of google results first 10 pages
for (var i=0;p=document.querySelectorAll("#navcnt .fl")[i];i++)  
    nextPages.urls.push(p.href)



function ininiteScroll(){


    // detect scroll if at bottom 50px of page
    if (window.innerHeight + window.scrollY + 50 >= document.body.offsetHeight) {


    	//rate limit! 5s to avoid Google CAPTCHA on detection of anti-scrapping scripts   
        if ( Date.now() - nextPages.loadedLastTime > 5000 ) {

             nextPages.loadedLastTime = Date.now();

         
              var xhr = new XMLHttpRequest();
              xhr.addEventListener("load", function(html){

                  var nextPageDOM = new DOMParser().parseFromString(xhr.responseText, "text/html");
                  

                  //append next 10 results to these 10
                  document.querySelector("#ires").appendChild(  nextPageDOM.querySelector("#ires")  )



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
