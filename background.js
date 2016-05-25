//Here be dragons!


//do a xhr from chrome api, with escalated privledges to bypass cors and re-use user's cookies
//then return the page's html in a callback
//requires manifest permission  "http://*/", "https://*/"
//background.js high-level APIs, logging to Inspect: background in extensions


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhr") {

        if (request.url.endsWith('pdf'))
             return callback("pdf");

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {

             console.log(xhr.status)
            callback(xhr.responseText);
        };
        xhr.onerror = function(e) {
            console.log(e)
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
    
    // console.log(e)

    chrome.webNavigation.getFrame({tabId:e.tabId, frameId: e.frameId, processId:e.processId},function(rFrame){

       // console.log(rFrame)

    })


})

//bypass cors
//TODO only from google/search
chrome.webRequest.onHeadersReceived.addListener(function(details){

    

    var domain = localStorage[details.requestId] || "*";



    for(var i in details.responseHeaders){
        if(details.responseHeaders[i].name.toLowerCase() == 'access-control-allow-origin'){
            details.responseHeaders[i].value = domain; //'http://www.google.com';
        }
        
        else if(details.responseHeaders[i].name.toLowerCase() == 'allow')
            details.responseHeaders[i].value = 'POST, GET, OPTIONS, PUT, DELETE';


         else if(details.responseHeaders[i].name.toLowerCase() == 'x-frame-options')
            details.responseHeaders[i].value = '';


        else if(details.responseHeaders[i].name == 'Content-Security-Policy')
            details.responseHeaders[i].value = 'frame-ancestors www.google.com';
        


       

    }


     // console.log("REPLY" + JSON.stringify(details))

        

    return {responseHeaders:details.responseHeaders};
}, {urls: ["<all_urls>"]}, ['blocking', 'responseHeaders']);





chrome.webRequest.onBeforeSendHeaders.addListener(function(details){


   for(var i in details.requestHeaders)
        if(details.requestHeaders[i].name == 'Origin'){
            localStorage[details.requestId] = details.requestHeaders[i].value;
            break;
        }

 //console.log(JSON.stringify(details.requestHeaders))

    return {responseHeaders:details.responseHeaders};
}, {urls: ["<all_urls>"]}, ['blocking', 'requestHeaders']);



