
chrome.commands.onCommand.addListener(function(command) {

  chrome.windows.getCurrent(function(win){

       chrome.windows.update(win.id, {focused:true, drawAttention:true} )

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