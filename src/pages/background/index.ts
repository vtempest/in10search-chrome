

// open the side panel by clicking on the toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));




// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId, tab.url);
  }
});

// Listen for tab switches
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log('Switched to tab:', tab.id, tab.url);
  });
});

// // Listen for navigation events
// chrome.webNavigation.onCompleted.addListener((details) => {
//   console.log('Navigation completed:', details.tabId, details.url);
// });


chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log(tab.url)

    await chrome.sidePanel.setOptions({
      tabId,
      path: "src/pages/sidepanel/index.html",
      enabled: true
    });

});


chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({title: 'Search Selection', id: 'in10context', contexts: ['selection']});
 
});




chrome.contextMenus.onClicked.addListener((info, tab) => {

  var {selectionText} = info;

  chrome.tabs.create({  
    url: "https://duckduckgo.com/?q=%5C" + selectionText
  });


});


chrome.runtime.onMessage.addListener(function(request, sender, callback) {

  if (request.action == "openTab")
      chrome.tabs.create({ url: request.url , active: request.bg ? false : true, selected: request.bg ? false : true });

    return true; // prevents the callback from being called too early on return
});

// */