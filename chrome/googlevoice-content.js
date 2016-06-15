window.clickVoice = setInterval(function() {

    if (document.querySelector(".gsst_a")) { 

    	setTimeout(function(){
    		document.querySelector(".gsst_a").dispatchEvent(new Event("click", { bubbles: true }));
    	},500)
    	
        clearInterval(window.clickVoice);
        document.title = "LISTENING"; 

    } 

   }, 500);
