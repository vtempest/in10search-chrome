//alert()

document.getElementsByTagName("head")[0].innerHTML+=
    '<style>'+
    '#rez{ width: 60%; border:0;height:100%;     z-index: 9999;'+
    '    background: white;position:fixed; top:0; right:0}'+
    '.current{background:lightgray;}'+
    '</style>'


document.body.innerHTML+=
    "<iframe id='rez' sandbox='allow-same-origin allow-scripts'>";


var rs = document.querySelectorAll(".r a");

for (var i =0; i<rs.length;i++){

    var url = rs[i].href;
    var text = rs[i].textContent;

    if (rs[i] && rs[i].dataset!=undefined)
    rs[i].parentNode.parentNode.dataset.url = url;


   // rs[i].href="#"

    //rs[i].setAttribute('onmousedown',"")

    rs[i].parentNode.parentNode.addEventListener("mouseover", function (){

        var prior = document.querySelectorAll('.current')
        for (var i in prior) prior[i].className = 'rc';

        this.className += " current"


             console.log(this.dataset.url)

                var url = this.dataset.url;

                var rez = document.querySelector("#rez");

                rez.src = "https://hkrnews.com/get?url="+url;


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
    
    console.log( )



}


    

