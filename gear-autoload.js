(function() { //iife

    //util$
    function $(s) {
        var e = document.querySelectorAll(s);
        return e.length == 1 ? e[0] : e; };


    //only on specific pages of web results
    if (["All", "Videos", "News", "Shopping", "News", "Books"].indexOf($(".hdtb-msel").textContent) == -1)
        return;



    //force http to avoid mixed content CSP block of http iframes on https google
    if (location.protocol == "https:") {
        location.href = location.href.replace("https", "http") + "&gws_rd=ssl";
        return;
    }


    //#rez container for iframes, and takes up half the page fixed position
    var rez = document.createElement('div');
    rez.id = 'rez';
    document.body.appendChild(rez);

    function positionRez() {
        var rezWidth = (document.documentElement.clientWidth - $(".g")[0].clientWidth)
        var rezTop = Math.max(0, $(".sfbg.nojsv").getBoundingClientRect().bottom + 1);

        if (!$("#rez").style) return;

        $("#rez").style.width = rezWidth + "px";
        $("#rez").style.top = rezTop + "px";

        // during scrolling, make the intentional lag of mouse hover slightly longer
        window.longDelayHover = true;

    };


    window.addEventListener("resize", positionRez, 1)
    window.addEventListener("scroll", positionRez, 1)
    positionRez()


    //listen to mouse over on container of .g then detect if on .g, 
    //to avoid having to bind listeners to new .g when those get added

    $("#ires").addEventListener("mouseover", function(e) {

        //if no-hover mode
        if (window.enableHoverMode && !window.enableHoverMode.checked) return;

        for (var i in e.path)
            if (e.path[i].className == "g") {
                doMouseOver(e.path[i]);

                break;
            }

    }, 0)

    $("#ires").addEventListener("click", function(e) {
        for (var i in e.path)
            if (e.path[i].className == "g") {
                doMouseOver(e.path[i]);

                break;
            }
    }, 0)

    $("#ires").addEventListener("mouseout", function(e) {

        for (var i in e.path)
            if (e.path[i].className == "g") {
                doMouseOut();

                break;
            }
    }, 0)

    //clear intent-to-load timer if user leaves mouse from g in <300ms
    function doMouseOut(g) {
        window.clearTimeout(window.loadPageAfterDelayTimeout);
    }


    function doMouseOver(g) {

        //clear prior intent-to-load  timers
        window.clearTimeout(window.loadPageAfterDelayTimeout);


        //start transition to demonstrate "intent to action"
        // g.className += " current"


        //set a intent-to-load page in 300ms timer, to avoid trigger from fast mouse swipes across whole screen
        window.loadPageAfterDelayTimeout = setTimeout(function() {

                //clear flag to delay mouseover intent longer, set when scrolling
                window.longDelayHover = false;


                //hide prior rFrames
                document.querySelectorAll('.current').forEach(function(cur) {
                    if (g != cur)
                        cur.className = 'g';
                })
                if (rez.querySelector('.show'))
                    rez.querySelector('.show').className = '';



                //highlight current .g
                g.className += " current"



                var url = g.querySelector('h3 a').href;

                var rez = document.querySelector("#rez");
                if (!rez) return;



                //use preloadId to check if rFrame already loaded then show it

                if (preloadId = g.querySelector('h3 a').dataset.preload) {

                    rez.querySelector("#" + preloadId).style.opacity = 0;
                    rez.querySelector("#" + preloadId).className = 'show';
                    onRezFrameShow()


                } else { //create new iframe for target 

                    //set preloadid token into .g link for later recall                 
                    g.querySelectorAll('a')[0].dataset.preload = preloadId = "i" + $("#rez").childNodes.length;


                    //get target page's html via a bypass cors xhr executed from background.j, inserting scrapped html into iframe
                    chrome.runtime.sendMessage({ action: 'xhr', url: url }, function(responseText) {

                        var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

                        //allow relative resource paths to load using the target's domain
                        responseText = responseText.replace(/<head[^>]*>/i, "<head><base href='" + domain + "/'>")

                        //error fallback: set iframe src to be served thru hkrnews.com proxy which spoofs headers
                        //var targetUrl = (location.protocol=="https:"?"https:":"http:") + "//hkrnews.com/get?url=" + url;


                        //create a blank iframe with unique id 
                        var rFrame = document.createElement('iframe');
                        rFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
                        rFrame.id = preloadId;
                        rez.appendChild(rFrame);
                        //set blank iframe html to be the xhr html
                        rFrame.contentDocument.querySelector("html").innerHTML = responseText;

                        //show iframe
                        rez.querySelector("#" + preloadId).className = 'show';
                        $(".show").style.opacity = 0;

                        //apply scripts to target page dom in the iframe
                        setTimeout(onRezFrameShow, 50)


                    }); //end xhr

                }; // end create new iframe




            }, window.longDelayHover ? 700 : g.querySelector('h3 a').dataset.preload ? 300 : 350) //loadPageAfterDelayTimeout 


    }



    //apply scripts to target page dom in the iframe
    function onRezFrameShow() {

        //TODO with timeout not always done
        // $("#rez .show").onload =function() {

        $(".show").style.opacity = 1;


        //highlight on result page, the subtext from .g result, first phrase/sentence
        var g = $('.current');
        var queryTextNode = g.querySelectorAll(".st")[0].cloneNode(1);
        if (queryTextNode.querySelector(".f"))
            queryTextNode.removeChild(queryTextNode.querySelector(".f"))
        var queryText = queryTextNode.textContent.replace(/\.\.\.(.?)+/, '').trim();


        //execute commands in the window context of iframe
        var rWindow = $("#rez .show").contentWindow;


        if (rWindow.getSelection().rangeCount) rWindow.getSelection().collapseToStart();
        //window.find(aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog);
        var found = rWindow.find(queryText, 0, 0, 0, 0, 1, 1);


        //searching first subtext phrase can fail if iframe has it as multiline, so find just bold word
        if (!found) {
            var queryBoldWord = g.querySelectorAll("em")[0];
            if (queryBoldWord)
                var found = rWindow.find(queryBoldWord.textContent, 0, 0, 0, 0, 1, 1);
        }



        if (found && window.enablePulsateQuery.checked) {

            var throbTimesToPulsate = 2;


            function throb() {
                var selNode = rWindow.getSelection().anchorNode.parentNode;
                selNode.style.backgroundColor = "yellow";

                setTimeout(function() {

                    selNode.style.backgroundColor = "";

                    if (--throbTimesToPulsate)
                        setTimeout(function() {
                            throb();

                        }, 400)

                }, 500)
            }

            throb()

        }



        //TODO
        //enable keyEvents to bubble up to main page
        rWindow.onkeydown = keyDownHandler;

        rWindow.focus();


    }; //end onRezFrameShow






    //first on load 
    $(".g")[0].dispatchEvent(new Event('mouseover', { 'bubbles': true }));



    //KEYBOARD SHORTCUTS
    window.onkeydown = keyDownHandler;

    function keyDownHandler(e) {
        var key = e.keyCode;
        var cur = $(".current");


        //get index of current
        var gs = $(".g");

        for (i = 0; g = gs[i++];)
            if (g == cur)
                break;


            //next
        if ([39, 74, 9].indexOf(key) > -1) {
            gs[i].dispatchEvent(new Event('mouseover', { 'bubbles': true }));
            gs[i].scrollIntoViewIfNeeded()
        }

        if ([37, 75].indexOf(key) > -1) {
            gs[i - 2].dispatchEvent(new Event('mouseover', { 'bubbles': true }));
            gs[i - 2].scrollIntoViewIfNeeded();
        }


        //settings ctrl+f1 toggles
        if (e.ctrlKey && key == 112) //toggle between onmouseover and onclick  modes
            window.enableHoverMode.checked = !window.enableHoverMode.checked;
        if (e.ctrlKey && key == 113)
            window.enablePulsateQuery.checked = !window.enablePulsateQuery.checked;
        if (e.ctrlKey && key == 114)
            window.enableInfiniteScroll.checked = !window.enableInfiniteScroll.checked;


        if ([113].indexOf(key) > -1) {

            window.disablejs = !window.disablejs;

            rez.setAttribute('sandbox', "allow-same-origin" + (disablejs ? "" : " allow-scripts"));

        }



        if (key == 13 && e.target.nodeName != "INPUT") { //should window lose focus?

            window.open(document.querySelector(".current a").href, "_blank");
        }

    }



    //SETTINGS

    $("#searchform form").innerHTML += '<div id="config"></div>';

    function addConfig(id, label, onchange, checked) {
        $("#config").innerHTML += '<label class="uiToggle"><input id="' + id + '" ' +
            (checked || checked == undefined ? ' checked="checked" ' : '') + 'type="checkbox">' +
            '<i class="uiToggle-slide"></i><i class="uiToggle-ball"></i>' + label + '</label>';
        $("#" + id).onchange = onchange;
    }

    addConfig('enableHoverMode', 'Hover Mode');
    addConfig('enablePulsateQuery', 'Pulsate Query');
    addConfig('enableInfiniteScroll', 'Infinite Scroll', function() {
        $("#foot").style.display = this.checked ? "none" : "block";
        //TODO move cur page up 
    });


    //move google's settings button
    document.querySelector("#config").appendChild(window.ab_ctls)



}()) //end IIFE
