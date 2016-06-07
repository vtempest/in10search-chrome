localStorage['alex']=24

window.addConfig = function(id, label, checked) {
	

    window.config.innerHTML += '<label class="uiToggle"><input id="' + id + '" type="checkbox" ' +
        (checked ? ' checked="checked" ' : '') + 
        '><i class="uiToggle-slide"></i><i class="uiToggle-ball"></i>' + label + '</label>';
    
    setTimeout(function(){ //timeout required or else only last elem's event gets sets
	    //persist settings forever
	    window[id].addEventListener("change", function(){
	    	var opts = {};
	    	opts[id] = this.checked;
	    	chrome.storage.sync.set(opts);
		},1)

		window[id].parentNode.addEventListener("mouseover", function(){

			helpInfo.textContent = help[id];

			helpInfo.style.color = window[id].checked ?  "#4285F5" : "#939393";

		},1)
	
    },1)
}

 chrome.storage.sync.get({
	    enableAutoload: 1,
	    enableHoverMode: 1,
	    enablePulsateQuery: 1,
	    enableInfiniteScroll: 1,
	    enableSolarizedColor: false
	}, function(opts) {


		addConfig('enableAutoload', 'Enable Autoload', opts.enableAutoload);
		addConfig('enableHoverMode', 'Hover Mode', opts.enableHoverMode);
		addConfig('enablePulsateQuery', 'Pulsate Query', opts.enablePulsateQuery);
		addConfig('enableInfiniteScroll', 'Infinite Scroll', opts.enableInfiniteScroll)
		addConfig('enableSolarizedColor', 'Solarize', opts.enableSolarizedColor)


	});


var help = {};
help['enableAutoload']="Disable all enhancements to Google search results, but can enable anytime from the results page.";
help['enableHoverMode']="Only mouse over the result item to load page in iframe, instead of clicking on the snippet text.";
help['enablePulsateQuery']="Blink in yellow and highlight the first search result location on the target page.";
help['enableInfiniteScroll']="Instead of pagination, keep auto loading the next 10 results.";
help['enableSolarizedColor']="Invert colors on results page for a dark nighttime mode, except for images.";



helpInfo.textContent = help['default'] = "Search GEAR enhances Google web results, to load the target website for each result on the right side of the page."

config.addEventListener("mouseleave", function(e) {

    helpInfo.textContent = help['default'];
    helpInfo.style.color = "#4285F5";	

}, 0)
