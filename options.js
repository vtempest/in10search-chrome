
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

