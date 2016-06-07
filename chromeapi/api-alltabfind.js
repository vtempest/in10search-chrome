//process functions that need higher permission
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type){
        case  "openTab":
            chrome.tabs.create({url: request.url});
            break;
    }
});


chrome.commands.onCommand.addListener(function(command) {


  // chrome.windows.getAll({ populate: true }, function(winArray) {
  //       for (var w in winArray) 
  //          chrome.tabs.getAllInWindow(winArray[w].id,
  //               function(tabs) {
  //                   for (var i in tabs) 
                     
  //                         console.log(tabs[i].id, tabs[i].title)


                    
  //               }
  //           );
  // })

  chrome.windows.getCurrent(function(win){

      // chrome.windows.update(win.id, {focused:false, drawAttention:true} )

  })



   	 chrome.tabs.create({url: "https://www.google.com/?gws_rd=ssl"}, function(googleTab){

	   	    chrome.tabs.executeScript(googleTab.id, {
	   	    	runAt: "document_end",
	      		code: 'window.clickVoice = setInterval(function(){'+
    					 ' if (document.querySelector(".gsst_a")) {'+
               'document.querySelector(".gsst_a").dispatchEvent(new Event("click", {bubbles: true}));'+
               'clearInterval(window.clickVoice);'+
               'document.title = "LISTENING"; '+
    				 	 '}},500);'
	 	   });

   	 });

   	 
});		