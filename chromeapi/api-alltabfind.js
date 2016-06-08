//process functions that need higher permission
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type){
        case  "openTab":
            chrome.tabs.create({url: request.url});
            break;
    }
});

