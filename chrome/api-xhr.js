/*     HERE BE DRAGONS!

             |\___/|
            (,\  /,)\
            /     /  \
           (@_^_@)/   \
            W//W_/     \
          (//) |        \
        (/ /) _|_ /   )  \
      (// /) '/,_ _ _/  (~^-.
    (( // )) ,-{        _    `.
   (( /// ))  '/\      /      |
   (( ///))     `.   {       }
    ((/ ))    .----~-.\   \-'
             ///.----..>   \
              ///-._ _  _ _}
*/


chrome.runtime.onMessage.addListener(function(request, sender, callback) {


    if (request.action == "xhr") {

        if (request.url.endsWith('pdf'))
             return callback("pdf");

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {

             console.log(xhr)
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






/*****                  REQUEST                   *****/
chrome.webRequest.onBeforeSendHeaders.addListener(function(req) {

    console.groupCollapsed("REQ " + req.url);
    console.log(JSON.stringify(req, null, 2))
    console.groupEnd();


    //req.url.startsWith("http:")

    if (!req.tabId < 1) return {};

    chrome.tabs.get(req.tabId, function(tab) {

        console.log(tab.url)
            //make sure this request is coming from our app on google search page
        if (tab.url.search(/https:\/\/.+\.google\.com/i) > -1 && tab.url.indexOf("google.com/url?") == -1) {

            var domain = "*";
            for (var i in req.requestHeaders)
                if (req.requestHeaders[i].name == 'Origin') {
                    domain = req.requestHeaders[i].value;
                    break;
                }


            localStorage.setItem(req.requestId, domain)



            return { requestHeaders: req.requestHeaders };
        } else {
            return;
        }



    })




}, { urls: ["<all_urls>"] }, ['blocking', 'requestHeaders']);




/*****                  RESPONSE                   *****/
chrome.webRequest.onHeadersReceived.addListener(function(res) {

    var domain = localStorage.getItem(res.requestId);

    //direct click of google search > rez in same tab

    console.log(!!domain)
    if (!domain)
        return; //only process requests from this app  


    // localStorage.removeItem(res.requestId);

    var isSetCSP = 0;



    for (var i in res.responseHeaders) {
        if (res.responseHeaders[i].name == 'Access-Control-Allow-Origin')
            res.responseHeaders[i].value = domain;

        else if (res.responseHeaders[i].name == 'Allow')
            res.responseHeaders[i].value = 'POST, GET, OPTIONS, PUT, DELETE';


        else if (res.responseHeaders[i].name.toLowerCase() == 'x-frame-options')
            res.responseHeaders[i].value = '';



    }



    console.groupCollapsed("%cRESPONSE " + res.url, "color:green;");
    console.log("%c" + JSON.stringify(res, 0, 1), 'background:   rgb(220,255,220)')
    console.groupEnd();




    return { responseHeaders: res.responseHeaders };
}, { urls: ["<all_urls>"] }, ['blocking', 'responseHeaders']);
