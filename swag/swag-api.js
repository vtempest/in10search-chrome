

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

});
