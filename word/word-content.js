//runs on every single webpage!!

//WORD

window.addEventListener("mouseup", function(e) {

	console.log(e)

    var i = e.target;
    if (i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement || i.textbox || (i.textContent && i.textContent=='') )
        return;


    var s = e.view.window.getSelection() + "";

    if (s.length < 50 && s.length > 2)
        chrome.runtime.sendMessage({ action: 'word-key', selectionText: s }, function(res) {})



}, false);



window.addEventListener("click", function(e) {

    if (!e.altKey) return;

    e.preventDefault();

    t = e.target.textContent; //if word/phrase is in its own <a> or <b> etc

    if (t.length>50){ //get clicked single word 

        s = e.view.window.getSelection();
        var range = s.getRangeAt(0);
        var node = s.anchorNode;
        while (range.toString().indexOf(' ') != 0) {
            range.setStart(node, (range.startOffset - 1));
        }
        range.setStart(node, range.startOffset + 1);
        do {
            range.setEnd(node, range.endOffset + 1);

        } while (range.toString().indexOf(' ') == -1 && range.toString().trim() != '');
        var t = range.toString().trim();

    }


    if (t.length < 50 && t.length > 2)
        chrome.runtime.sendMessage({ action: 'word-key', selectionText: t }, function(res) {})


    s.collapseToStart();

}, 0);

