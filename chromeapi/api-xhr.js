//HERE BE DRAGONS!

//toodo when from google clicked on new page new tab

chrome.runtime.onInstalled.addListener(function (eventInstall) {
     if(eventInstall.reason == "install")
         chrome.tabs.create({url: chrome.extension.getURL("/config/options.html")}, function (tab) {
        });
    
   
});




//do a xhr from chrome api, with escalated privledges to bypass cors and re-use user's cookies
//then return the page's html in a callback
//requires manifest permission  "*://*/*"
//background.js high-level APIs, logging to Inspect: background in extensions


chrome.runtime.onMessage.addListener(function(request, sender, callback) {


    if (request.action == "ms") 
    navigator.webkitGetUserMedia({audio: true, video: true}, function(ms) {
        console.log(ms)

        callback(ms)

    }, function(e) {
    });


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




// chrome.webRequest.onBeforeRequest.addListener(function(req){
    


//      if(req.url.startsWith("http:")){


//         console.log("wwwwwwwwwwww")
//         console.log(req.url)


//      }
//         // req.url="https"+req.url.substr(4);


// //redirectUrl:req.url
//     // return;
// }, {urls: ["<all_urls>"]}, ['blocking', 'requestBody']);



/*****                  REQUEST                   *****/
chrome.webRequest.onBeforeSendHeaders.addListener(function(req){

console.groupCollapsed("REQ " + req.url);
console.log(JSON.stringify(req, null, 2))
console.groupEnd();

 
 //req.url.startsWith("http:")

 if (!req.tabId<1) return {};
    
    chrome.tabs.get(req.tabId, function(tab){

        console.log(tab.url)
        //make sure this request is coming from our app on google search page
        if (tab.url.search(/https:\/\/.+\.google\.com/i)>-1 
            && tab.url.indexOf("google.com/url?")==-1 ){

                var domain = "*";
                for(var i in req.requestHeaders)
                    if(req.requestHeaders[i].name == 'Origin'){
                        domain = req.requestHeaders[i].value;
                        break;
                    }


                localStorage.setItem(req.requestId, domain)

            

             return {requestHeaders:req.requestHeaders}; 
        } else{
            return ;
        }



    })




}, {urls: ["<all_urls>"]}, ['blocking', 'requestHeaders']);




/*****                  RESPONSE                   *****/
chrome.webRequest.onHeadersReceived.addListener(function(res){

    var domain = localStorage.getItem(res.requestId);

    //direct click of google search > rez in same tab

    console.log(!!domain)
    if (!domain )
        return; //only process requests from this app  
    

    // localStorage.removeItem(res.requestId);

    var isSetCSP=0;



    for(var i in res.responseHeaders){
        if(res.responseHeaders[i].name.toLowerCase() == 'access-control-allow-origin')
            res.responseHeaders[i].value = domain; 
        
        else if(res.responseHeaders[i].name.toLowerCase() == 'allow')
            res.responseHeaders[i].value = 'POST, GET, OPTIONS, PUT, DELETE';


         else if(res.responseHeaders[i].name.toLowerCase() == 'x-frame-options')
            res.responseHeaders[i].value ='';

        else if(res.responseHeaders[i].name == 'Content-Security-Policy'){
            res.responseHeaders[i].value = 'upgrade-insecure-requests; frame-ancestors www.google.com';
            isSetCSP=1;
        }
        

    }



    if(!isSetCSP)
        res.responseHeaders.push({name:"Content-Security-Policy", 
            value: 'upgrade-insecure-requests; frame-ancestors www.google.com ' })


    console.groupCollapsed("%cRESPONSE " + res.url, "color:green;");
    console.log("%c"+JSON.stringify(res,0,1),'background:   rgb(220,255,220)')
    console.groupEnd();


        

    return {responseHeaders:res.responseHeaders};
}, {urls: ["<all_urls>"]}, ['blocking', 'responseHeaders']);
