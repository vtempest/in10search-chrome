

// right click context menu
chrome.contextMenus.create({
    "title" : "Go to Reading Mode",
    "contexts" : ["all"],
    "onclick" : selectionOnClick
});

function selectionOnClick(info, tab) {


    
    console.log(info)
    console.log(tab)


    
    chrome.tabs.executeScript(tab.id, {
        file:  "oreo/readability.min.js"
    });
    chrome.tabs.executeScript(tab.id, {
        file:  "oreo/readingmode-content.js"
    });

    chrome.tabs.insertCSS(tab.id, {
        file:  "oreo/readingmode-style.css"
    });



}



//TODO https on the defs call - bg


chrome.runtime.onMessage.addListener(function(request, sender, callback) {


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
        return true; // prevents the callback from being called too early on return
    }
});




chrome.runtime.onMessage.addListener(function(request, sender, callback) {



    if (request.action == "tts") {


         chrome.tts.isSpeaking(function(isSpeaking){

            if(isSpeaking)
                chrome.tts.pause()
            else
                chrome.tts.resume()

        })

        
        chrome.tts.speak(request.data.substring(0,100), {voiceName: "Google UK English Male"});


    
        for (var i = 100; i < request.data.length; i+=100)
             chrome.tts.speak(request.data.substring(i,i+100), {voiceName: "Google UK English Male", enqueue: true });








        callback(false);

    } 

    if (request.action == "tts-pause") {


       



    } 
});




