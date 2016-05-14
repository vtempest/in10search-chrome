



  var nextPages = {urls: [], loadedLastTime: Date.now(), loadedLastIndex: 0, }
  var nextPages 

  for (var i=0;p=document.querySelectorAll("#navcnt .fl")[i];i++)  
      nextPages.urls.push(p.href)

  

   console.log(nextPages)




function ininiteScroll(){
    // detect scroll if at bottom 50px of page
    if ((window.innerHeight + window.scrollY) + 50 >= document.body.offsetHeight) {



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


          } 



    }



}



window.addEventListener("scroll", ininiteScroll, 1)
window.addEventListener("mousewheel", ininiteScroll, 1) //diff is fires even if scrolling over bottom:0
