

chrome.contextMenus.create({
    "title" : "• Wiki Define • %s",
    "id": "contextOKGO",
    "contexts" : ["selection"],
    "onclick" : contextClickOKGO
});



chrome.runtime.onMessage.addListener(function(request, sender, callback) {


     if (request.action == "word-key") {

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                 contextClickOKGO(request, tabs[0])

                 callback(true)

            })


     }

     return false

})


function contextClickOKGO(info, tab) {

        var term = info.selectionText;


         var xhr = new XMLHttpRequest();
                xhr.open('GET', "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=" + term, true);
                xhr.onload = function() {

                    console.log(xhr.responseText)
                    var results = JSON.parse(xhr.responseText).results;
                    var bestResult = results[0]
                    for (var i in results)
                        if (results[i].label.toLowerCase() == term.toLowerCase())
                            bestResult = results[i];

                    if (!bestResult)
                        bestResult = results[0];



                     
                        var uri_term = bestResult.uri && bestResult.uri.substring(bestResult.uri.lastIndexOf('/'))

                        desc = bestResult.description + " <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki"  + uri_term + "\"></a>";
                        
                        chrome.tts.speak(desc, {voiceName: "Google UK English Male",'rate': 3.0})
                        
                        chrome.tabs.executeScript(tab.id, {code:  "window.worddefine = \"" + escape(desc) + "\";"     });

                         chrome.tabs.executeScript(tab.id, {
                            file:  "word/word-cardview.js"
                        });

                          chrome.tabs.insertCSS(tab.id, {
                            file:  "word/word-style.css"
                        });

                    


                };
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.send();





}





//google kg



/*

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {


            // alert( xhr.responseText)

            // alert(tab.id)
                                   

            chrome.tabs.insertCSS(tab.id, {
                file:  "read/readingmode-style.css"
            });

                var desc =  JSON.parse(xhr.responseText).itemListElement[0].result.detailedDescription.articleBody.replace(/\n/,'');

                // alert(JSON.stringify(desc))

                
                chrome.tabs.executeScript(tab.id, {
                    code:  "if(window.define2) document.body.removeChild(define2);document.body.insertAdjacentHTML('beforeend','<div class=\"\" "+
                    " id=\"define2\">"+desc+"</div>'); setTimeout(function(){define2.className=\"min\";},1); setTimeout(function(){define2.className=\"\";},6000) "
                });


        };

        xhr.open('GET', "https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyDgdM5CpdzE3dLHD877L8fB3PyxVpV7pY4&limit=1&query="+term , true);
        

        xhr.send();
    */
    


// "window.okgo=" +JSON.strigify(xhr.responseText) + "; alert(JSON.stringify(okgo)) ; document.body.innerHTML += '<div id=\"define\">" +
//                         JSON.stringify(xhr.responseText) + "</div>"
