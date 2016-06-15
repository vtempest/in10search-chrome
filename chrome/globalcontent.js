window.addEventListener("keydown", onKeyDown, false);

function onKeyDown(e) {

    //tab = search text shortcut
    if (e.keyCode == 9 && !e.altKey && !e.ctrlKey  ){







        /*
        //quit if pressing tab in input box
        var i = e.target;
        if (i instanceof HTMLImageElement || i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement || i.textbox ||
            (i.textContent && i.textContent=='') || (i.ownerDocument && i.ownerDocument.designMode && i.ownerDocument.designMode.match(/on/i)) )
            return;

        var t = window.getSelection().toString();

        if (t.length > 0) {
            chrome.extension.sendMessage({
                type: "openTab",
                url: "http://www.google.com/search?q="+t
            });

        } else {
            //if already on google results page, then load first result
            if (document.location.host.match(/google/gi) && document.getElementsByClassName("g").length>0)
                document.location = document.getElementsByClassName("r")[0].getElementsByTagName("a")[0].href;
        }

        */
    }
}

