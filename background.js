//do a xhr from chrome api, with escalated privledges to bypass cors and re-use user's cookies
//then return the page's html in a callback
//requires manifest permission  "http://*/", "https://*/"
//background.js high-level APIs, logging to Inspect: background in extensions


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhr") {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            callback(xhr.responseText);
        };
        xhr.onerror = function() {
            console.log(xhr)
           callback(xhr);
        };
        xhr.open('GET', request.url, true);
        //TODO pdfs
        //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();
        return true; // prevents the callback from being called too early on return
    }
});


chrome.webNavigation.onBeforeNavigate.addListener(function(e){
    //handle navigation occuring within iframe 
    e.url = 'http://hkrnews.com';
    
    // console.log(e)

    chrome.webNavigation.getFrame({tabId:e.tabId, frameId: e.frameId, processId:e.processId},function(rFrame){

       // console.log(rFrame)

    })


})