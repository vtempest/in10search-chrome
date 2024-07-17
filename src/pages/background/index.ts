chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

function notifyTabUpdate(updateType, tabId, changeInfo) {
  chrome.runtime.sendMessage({ 
    type: "updateTabLists",
    updateType: updateType,
    tabId: tabId,
    changeInfo: changeInfo
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('Tab updated:', tabId, changeInfo, tab.url);
  
  if (changeInfo.status === 'complete' || changeInfo.title) {
    notifyTabUpdate('updated', tabId, { url: tab.url, title: tab.title });
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab created:', tab.id, tab.url);
  notifyTabUpdate('created', tab.id, { url: tab.url, title: tab.title });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('Tab removed:', tabId);
  notifyTabUpdate('removed', tabId, {});
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log('Switched to tab:', tab.id, tab.url);
    notifyTabUpdate('activated', tab.id, { url: tab.url, title: tab.title });
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log('Tab updated (for side panel):', tabId, info, tab.url);

  await chrome.sidePanel.setOptions({
    tabId,
    path: "src/pages/sidepanel/index.html",
    enabled: true
  });

  notifyTabUpdate('updated', tabId, { url: tab.url, title: tab.title });
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
  var {type, url, bg} = request;

  if (type === "openTab"){
    chrome.tabs.create({ url, active: request.bg ? false : true, selected: request.bg ? false : true });
  } else if (type === "updateTabOrder") {
    updateTabOrder(request.newOrder);
  }

  return true;
});

function updateTabOrder(newOrder) {
  console.log('Updating tab order:', newOrder);
  
  chrome.windows.getCurrent({populate: true}, function(window) {
    const currentTabs = window.tabs;
    const tabIndexMap = new Map(currentTabs.map((tab, index) => [tab.id, index]));
    
    newOrder.forEach((tabId, newIndex) => {
      const currentIndex = tabIndexMap.get(parseInt(tabId));
      if (currentIndex !== undefined && currentIndex !== newIndex) {
        chrome.tabs.move(parseInt(tabId), {index: newIndex}, (tab) => {
          if (chrome.runtime.lastError) {
            console.error(`Error moving tab ${tabId}: ${chrome.runtime.lastError.message}`);
          } else {
            console.log(`Moved tab ${tabId} to index ${newIndex}`);
          }
        });
      }
    });

    // Use setTimeout to send the completion message after a short delay
    setTimeout(() => {
      console.log('Tab reordering complete');
      chrome.runtime.sendMessage({
        type: "tabReorderComplete"
      });
    }, 500); // 500ms delay
  });
}