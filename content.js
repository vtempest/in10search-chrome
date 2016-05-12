//only on web results
if (document.querySelector(".hdtb-msel").textContent=="All") init()


function init() {

  var $ = document.querySelector;

if (location.protocol=="https:"){
  location.href = location.href.replace("https","http")+"&gws_rd=ssl";
  return;
}


document.getElementsByTagName("head")[0].innerHTML+=
    '<style>'+
    '#rez{ width: 60%; border:0;height:100%;     z-index: 9999;'+
    '    background: white;position:fixed; top:0; right:0}'+
    '.current{background:aliceblue;}'+
    '</style>'


document.body.innerHTML+=
    "<iframe id='rez' sandbox='allow-same-origin allow-scripts'>";


var rs = document.querySelectorAll(".g");

for (var i =0; i<rs.length;i++){

    var url = rs[i].getElementsByTagName('a')[0].href;

    if (rs[i] && rs[i].dataset!=undefined)
    rs[i].dataset.url = url;


   // rs[i].href="#"

    //rs[i].setAttribute('onmousedown',"")

    rs[i].addEventListener("mouseover", function (){

        var prior = document.querySelectorAll('.current')
        for (var i in prior) prior[i].className = 'g';

        this.className += " current"


             console.log(this.dataset.url)

                var url = this.dataset.url;

                var rez = document.querySelector("#rez");

                var targetUrl =  location.protocol +"//hkrnews.com/get?url="+url;

                if (rez.src != targetUrl)
                  rez.src = targetUrl

            this.focus();
            var _this = this;
            setTimeout(function(){
            _this.focus();
            },1000)
        chrome.runtime.sendMessage({
            method: 'GET',
            action: 'xhttp',
            url: url
        }, function(responseText) {
           // alert(responseText);
           return;

           var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

           console.log(domain)

           responseText=responseText
           .replace(/<head[^>]*>/i, "<head><base  target='_blank' href='" + "https://hkrnews.com/get?url="+domain + "/'>")
                    

          //      console.log(responseText)

                document.querySelector("#rez")
                    .contentDocument.body
                    .innerHTML = responseText;

        });







    }, false);
    



}


    

//first on laod
 rs[0].dispatchEvent(new Event('mouseover'));




  window.onkeydown = function (e) {
  var key = e.keyCode;

  //next
  if ([39,74].indexOf(key)>-1) 
      document.querySelector(".current").nextSibling.dispatchEvent(new Event('mouseover'));


  if ([37,75].indexOf(key)>-1) 
    document.querySelector(".current").previousSibling.dispatchEvent(new Event('mouseover'));

     document.querySelector(".current").scrollIntoViewIfNeeded();

}

}