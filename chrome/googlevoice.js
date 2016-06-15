chrome.commands.onCommand.addListener(function(command) {

    chrome.windows.getCurrent(function(win) {

        chrome.windows.update(win.id, { focused: true, drawAttention: true })

    })



    chrome.tabs.create({ url: "https://www.google.com/?gws_rd=ssl" }, function(googleTab) {

        chrome.tabs.executeScript(googleTab.id, {
            runAt: "document_end",
            file:  "chrome/googlevoice-content.js"
        });

    });


});
