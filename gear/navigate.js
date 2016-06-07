//swipe webcam armgesture


document.addEventListener("DOMContentLoaded", function() {

    //TODO only webcam in tab is focused


     //only on specific pages of web results
     if (!$(".hdtb-msel") || !$(".hdtb-msel").textContent || ["All", "Videos", "News", "Shopping", "News", "Books"].indexOf($(".hdtb-msel").textContent) == -1)
                return;

    setTimeout(function(){


        swag.start().onRight = navNext


    }, 500)    
          

    // window.onblur=function(){
    //  swag.stop()

    // }


    //KEYBOARD SHORTCUTS

    window.onkeypress = keyDownHandler;



}) //dom ready



function keyDownHandler(e) {
    var key = e.keyCode;

    if (e.target.nodeName == "INPUT")
        return;


    //next
    if ([39, 74, 9].indexOf(key) > -1) 
        window.navNext();
    //prior
    if ([37, 75].indexOf(key) > -1) 
        window.navPrior();

    //settings ctrl+f1 toggles
    if (e.altKey && e.ctrlKey && key >= 49 && key < 55) {
        var checkbox = window.config.childNodes[key-49];
        if (checkbox){
            checkbox = checkbox.querySelector("input");
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));

            e.stopPropagation();
        }

    }


    if ([113].indexOf(key) > -1) {

        window.disablejs = !window.disablejs;

     //   rez.setAttribute('sandbox', "allow-same-origin" + (disablejs ? "" : " allow-scripts"));

    }



    if (key == 13 ) { //should window lose focus?

        window.open(document.querySelector(".current a").href, "_blank");
    }

}



function navNext(){

     //get index of current
    var gs = $(".g");
    var cur = $(".current");

    for (i = 0; g = gs[i++];)
        if (g == cur)
            break;

    if (!gs[i]) return;

    // todo autolaod

    gs[i].dispatchEvent(new Event('click', { 'bubbles': true }));
    gs[i].scrollIntoViewIfNeeded()

}



function navPrior(){

     //get index of current
    var gs = $(".g");

    for (i = 0; g = gs[i++];)
        if (g == cur)
            break;

    gs[i - 2].dispatchEvent(new Event('click', { 'bubbles': true }));
    gs[i - 2].scrollIntoViewIfNeeded();
    

}

