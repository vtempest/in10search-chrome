

//listen for tab navigation changes, record opener tab id
//chrome.webNavigation

chrome.webRequest.onBeforeSendHeaders.addListener(function(req) {


        console.log(req.tabId)

    if (req.tabId < 1) return {};

    chrome.tabs.get(req.tabId, function(tab) {

        console.log(tab.url)
        console.log(tab.openerTabId)




    })


   


}, { urls: ["<all_urls>"] }, [ 'requestHeaders']);



//record how long on each site
chrome.tabs.onActivated.addListener(function(info){


	console.log(Date.now() + " " + info.tabId)


})


