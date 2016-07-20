//TODO
/********************************************************************/
  //rexognize the key words on the article --  put em in the sidebar then hilight all cocurrances of one

// CONTEXT MENU -- READIBILITY SHORTCUT
chrome.contextMenus.create({
    "title" : "• READ • Readibility •",
    "id": "contextREAD",
    "contexts" : ["page"],
    "onclick" : contextClickREAD
});



function contextClickREAD(info, tab) {


      chrome.tabs.executeScript(tab.id, {
        file:  "libs/jquery.min.js"
    });
      chrome.tabs.executeScript(tab.id, {
        file:  "libs/jqcloud-1.0.4.min.js"
    });
      chrome.tabs.insertCSS(tab.id, {
        file:  "libs/jqcloud.css"
    });






    
    chrome.tabs.executeScript(tab.id, {
        file:  "read/readability.min.js"
    });
    chrome.tabs.executeScript(tab.id, {
        file:  "read/readingmode-content.js"
    });

    chrome.tabs.executeScript(tab.id, {
        file:  "read/readingmode-summary.js"
    });

    chrome.tabs.insertCSS(tab.id, {
        file:  "read/readingmode-style.css"
    });



   


    setTimeout(function(){


            // chrome.contextMenus.update("contextREAD",{title:"eeee"});

    },2000)

}




//TODO https on the defs call - bg

chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    console.log(request.action)


    if (request.action == "textapi") {

        var params = Object.keys((request.data||{})).map(function(k){ return k + "=" + encodeURIComponent(request.data[k]); } ).join('&');


        var xhr = new XMLHttpRequest();
        xhr.onload = function() {


            callback(xhr.responseText);
        };
        xhr.onerror = function(e) {
            console.log(e)
          callback(xhr);
        };
        xhr.open('POST', "https://api.aylien.com/api/v1/concepts" , true);
        
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-AYLIEN-TextAPI-Application-Key', '44ffa5c9e87322f192cfaace03bf9123');
        xhr.setRequestHeader('X-AYLIEN-TextAPI-Application-ID', '8d7894bf');


//&endpoint=summarize&sentences_percentage=25
        xhr.send("url="+encodeURIComponent(request.data.url));
    }




     if (request.action == "read") {

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                 contextClickREAD(0, tabs[0])

                 callback(true)

            })


     }

    
     


     if (request.action == "read-xhr") {

         var xhr = new XMLHttpRequest();
                xhr.open('GET', "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=" + request.term, true);
                xhr.onload = function() {
                    var results = JSON.parse(xhr.responseText).results;
                    var bestResult = results[0]
                    for (var i in results)
                        if (results[i].label == request.term)
                            bestResult = results[i];

                    callback(bestResult)
                    


                };
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.send();


            }   


    if (request.action == "tts") {

        // alert(1)

        var t = request.data;
        var voice = {voiceName: "Google UK English Male",'rate': 3};
        

        //get first word end after 100 chars
        

    
        while (t.length > 100){

            var offset = t.substring(100).search(/\b/);
            var partial = t.substring(0,100+offset)
            t = t.substring(100+offset)

            console.log(partial)

            chrome.tts.speak(partial, voice);


            voice.enqueue = true;

        }


        callback(false);

    } 


     if (request.action == "tts-pause") {


        console.log(2222)

         chrome.tts.isSpeaking(function(isSpeaking){

            console.log(isSpeaking)

            if(isSpeaking)
                chrome.tts.pause()
            else
                chrome.tts.resume()

        })
    }




    if (request.action == "openTab")
        chrome.tabs.create({ url: request.url , active: request.bg ? false : true, selected: request.bg ? false : true });

    
        return true; // prevents the callback from being called too early on return
});




