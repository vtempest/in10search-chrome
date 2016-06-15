//toodo when from google clicked on new page new tab

chrome.runtime.onInstalled.addListener(function(eventInstall) {
    if (eventInstall.reason == "install")
        chrome.tabs.create({ url: chrome.extension.getURL("/config/options.html") }, function(tab) {});


});





//do a xhr from chrome api, with escalated privledges to bypass cors and re-use user's cookies
//then return the page's html in a callback
//requires manifest permission  "*://*/*"
//background.js high-level APIs, logging to Inspect: background in extensions


chrome.runtime.onMessage.addListener(function(request, sender, callback) {


    if (request.action == "swag-stop")
        swag.stop();

    if (request.action == "swag")
        swag.start().onRight = function() {

            // 2s delay between swags
            if (Date.now() - (window.lastSwagTime || 0) < 2000)
                return;


            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                if (tabs[0].url.indexOf("google.com") > -1)
                    chrome.tabs.executeScript(tabs[0].id, { code: "navNext()" });
                else { //nav thru tabs



                }
            })

            //save for later
            window.lastSwagTime = Date.now();
        }

    if (request.action == "openTab")
        chrome.tabs.create({ url: request.url });

});
