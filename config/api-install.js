//toodo when from google clicked on new page new tab

chrome.runtime.onInstalled.addListener(function(eventInstall) {
    if (eventInstall.reason == "install")
        chrome.tabs.create({ url: chrome.extension.getURL("/config/options.html") }, function(tab) {});


});

