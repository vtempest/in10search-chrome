document.addEventListener("DOMContentLoaded", function() {

        //only on specific pages of web results
        if (!$(".hdtb-msel") || !$(".hdtb-msel").textContent || ["All", "Videos", "News", "Shopping", "News", "Books"].indexOf($(".hdtb-msel").textContent) == -1) {
            document.querySelector('html').classList.add("disableAutoloadApp");
            return

        }



        //listen to mouse over on container of .g then detect if on .g,
        //to avoid having to bind listeners to new .g when those get added

        $("#ires").addEventListener("mouseover", function(e) {

            //if no-hover mode
            if (window.enableHoverMode && !window.enableHoverMode.checked) return;

            for (var i in e.path)
                if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "g") > -1) {
                    doMouseOver(e.path[i]);

                    break;
                }

        }, 0)

        $("#ires").addEventListener("click", function(e) {
            for (var i in e.path)
                if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "g") > -1) {
                    doMouseOver(e.path[i]);

                    break;
                }
        }, 0)

        $("#ires").addEventListener("mouseout", function(e) {

            for (var i in e.path)
                if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "g") > -1) {
                    doMouseOut();

                    break;
                }
        }, 0)


    }) //end dom loaded




//TODO youtube autoplay suprpression


//clear intent-to-load timer if user leaves mouse from g in <300ms
function doMouseOut(g) {
    clearTimeout(window.loadPageAfterDelayTimeout);
}


function doMouseOver(g) {

    //clear prior intent-to-load  timers
    clearTimeout(window.loadPageAfterDelayTimeout);


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

            if (document.querySelector('.show'))
                document.querySelector('.show').className = '';



            //highlight current .g
            g.classList.add("current")




            var url = g.querySelector('h3 a,a').href;

            var rez = document.querySelector("#rez");
            if (!rez) return;



            //use preloadId to check if rFrame already loaded then show it

            if (preloadId = g.querySelector('h3 a,a').dataset.preload) {

                if (rez.querySelector("#" + preloadId)) {
                    rez.querySelector("#" + preloadId).style.opacity = 0;

                    rez.querySelector("#" + preloadId).className = 'show';
                    onFrameShow()
                }

            } else { //create new iframe for target

                //set preloadid token into .g link for later recall
                g.querySelectorAll('a')[0].dataset.preload = preloadId = "i" + $("#rez").childNodes.length;



                xhrFrame(url, preloadId, function(rFrame) {

                    //show iframe
                    rFrame.className = 'show';
                    rFrame.style.opacity = 0;

                    //apply scripts to target page dom in the iframe
                    setTimeout(onFrameShow, 130)

                })



            }; // end create new iframe


            //TODO timeout for preloaded
        }, window.longDelayHover ? 700 : g.querySelector('h3 a,a').dataset.preload ? 50 : 350) //loadPageAfterDelayTimeout


}


function xhrFrame(url, preloadId, callback) {
    //TODO pdf.js



    //get target page's html via a bypass cors xhr executed from background.j, inserting scrapped html into iframe
    chrome.runtime.sendMessage({ action: 'xhr', url: url }, function(responseText) {

        if (responseText && responseText.error)
            console.log(responseText.error)



        var domain = (url.match(/(http:\/\/|https:\/\/)[^\/]+/gi) || [""])[0];

        //allow relative resource paths to load using the target's domain
        responseText = responseText && responseText.replace(/<head[^>]*>/i, "<head><base href='" + domain + "/'>" +
            "<style>.solar img{ -webkit-filter: invert(100%) !important; transition: 1.5s; }</style>");

        //error fallback: set iframe src to be served thru hkrnews.com proxy which spoofs headers
        //var targetUrl = (location.protocol=="https:"?"https:":"http:") + "//hkrnews.com/get?url=" + url;


        //create a blank iframe with unique id
        var rFrame = document.createElement('iframe');

        if (!url.endsWith('pdf'))
            rFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');

        rFrame.id = preloadId;



        rez.appendChild(rFrame);
        rFrame.addEventListener("load", function(e) {
            console.log(e)
                //this is for redirects on a[href] by user in iframe

        }, 0)


        //  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        // var observer = new MutationObserver(onFrameShow);

        //  observer.observe(rFrame.contentDocument.querySelector("html"), { childList: true, subtree: true });


        // if (url.endsWith('pdf'))
        //     alert(responseText.length)

        //set blank iframe html to be the xhr html
        if (url.indexOf("youtube") > -1 || (url.indexOf("www.google.com") > -1 && url.indexOf("chrome.google.com") == -1) 
            || url.endsWith('pdf')) //|| !responseText)
            rFrame.src = url;

        else

            rFrame.contentDocument.querySelector("html").innerHTML = responseText;



        //NO ERRORS
        //console.clear();

        callback(rFrame)



    }); //end xhr

}


//apply scripts to target page dom in the iframe
function onFrameShow() {

    //TODO with timeout not always done
    // $("#rez .show").onload =function() {

    if ($(".show").style)
        $(".show").style.opacity = 1;


    //match solarize except images

    if ($(".show").contentDocument) {

        if (document.body.classList.contains("solar"))
            $(".show").contentDocument.body.classList.add("solar");
        else
            $(".show").contentDocument.body.classList.remove("solar");
    }


    //highlight on result page, the subtext from .g result, first phrase/sentence
    var g = document.querySelector('.current');
    if (!g) return;

    var queryTextNode = g.querySelectorAll(".st")[0] ? g.querySelectorAll(".st")[0].cloneNode(1) : false;
    if (queryTextNode && queryTextNode.querySelector(".f"))
        queryTextNode.removeChild(queryTextNode.querySelector(".f"))
    var queryText = queryTextNode ? queryTextNode.textContent.replace(/\.\.\.(.?)+/, '').trim() : false;


    //execute commands in the window context of iframe
    var rWindow = $("#rez .show").contentWindow;
    if (!rWindow) return;


    if (rWindow.getSelection().rangeCount) rWindow.getSelection().collapseToStart();
    //window.find(aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog);
    var found = rWindow.find(queryText, 0, 0, 0, 0, 1, 1);


    //searching first subtext phrase can fail if iframe has it as multiline, so find just bold word
    if (!found) {
        var queryBoldWord = g.querySelectorAll("em")[0];
        if (queryBoldWord)
            var found = rWindow.find(queryBoldWord.textContent, 0, 0, 0, 0, 1, 1);
    }

    //scroll to position selection to middle
    if (!$(".show").contentWindow.getSelection().isCollapsed) {
        //position highlighted to top
        $(".show").contentWindow.getSelection().anchorNode.parentNode.scrollIntoView(1);

        //position highlighted to middle
        $(".show").contentWindow.document.body.scrollTop -= $(".show").contentWindow.innerHeight / 2 - 30

    }

    //query terms to highlight, by each word, on target iframe

    var q = document.querySelector("#searchform input[name=q]").value;
    console.log(q)
    var q2 = "((?=.*" + (q.match(/"([^"]+)"|[\w]+/gi) || []).join(")(?=.*").replace(/\"/g, '') + ")).+"

    console.log(q2)

    // debugger

    //
    // rWindow.document.body.innerHTML = rWindow.document.body.innerHTML
    //   .replace(new RegExp("" + q2 + "", "gi"), "<span style='background:yellow'>$1</span>")





    // on the target iframe, pulsate the first found phrase string
    if (found && window.enablePulsateQuery.checked) {

        var throbTimesToPulsate = 2;


        function throb() {
            var selNode = rWindow.getSelection().anchorNode.parentNode;
            selNode.style.backgroundColor = "#a2c2fa";

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




}; //end onFrameShow
