window.addEventListener("keydown", onKeyDown, false);

const searchEngineURLs = {
  "Perplexity AI": "https://www.perplexity.ai/?q=",
  Google: "https://www.google.com/search?q=",
  DuckDuckGo: "https://duckduckgo.com/?q=",
  google_first: "https://www.google.com/search?q=",
  "DDG Go To First": "https://duckduckgo.com/?q=%5C",
};

function onKeyDown(e) {

  var baseQueryURL = searchEngineURLs["Google"]


  //tab = search text shortcut
  if (e.keyCode == 9 && !e.altKey && !e.ctrlKey) {
    


    //quit if pressing tab in input box
    var i = e.target;
    if (
      i instanceof HTMLImageElement ||
      i instanceof HTMLInputElement ||
      i instanceof HTMLTextAreaElement ||
      i.textbox ||
      (i.textContent && i.textContent == "") ||
      (i.ownerDocument &&
        i.ownerDocument.designMode &&
        i.ownerDocument.designMode.match(/on/i))
    )
      return;

    var t = window?.getSelection().toString();
    var shouldOpenInBackground = e.shiftKey;

    console.log(t);

    if (t.length > 0) {
      e.preventDefault();
      e.stopPropagation();

      chrome.runtime.sendMessage({
        type: "openTab",
        bg: shouldOpenInBackground,
        url: baseQueryURL + t,
      });
    } else {
      //if already on google results page, then load first result
      if (
        document.location.host.match(/google/gi) &&
        document.getElementsByClassName("g").length > 0
            ) {
          e.preventDefault();
          e.stopPropagation();

        var results = extractGoogleResultsPage(document)

        console.log(JSON.stringify(results))
        document.location = results[0].url;
      }
    }
  }
}




function extractGoogleResultsPage(document){
  // get results which are <a href> elements with <h3> children
  var results = Array.from(document.querySelectorAll("a[href]:has(h3)"))?.map((e) => {
   var title = e
     .querySelector("h3")
     //remove missing <?> chars common in snippets
     .textContent.replace(/[\u{0080}-\u{10FFFF}]/gu, "");
   
     //get 5th parent element of the <a> element which is the result div
   var parent = e.parentNode.parentNode
   .parentNode.parentNode
     .parentNode.parentNode.parentNode; 
 
   //get date if available in div>span element
  //  var date;
  //  parent.querySelectorAll("div>span")?.forEach((e) => {
  //    if (chrono.parseDate(e.textContent))
  //      date = chrono.parseDate(e.textContent).toISOString().split("T")[0];
  //  });
 
   //find snippet in element containing span+span, get its text node
   var snippetDiv = parent.querySelector("span>em")?.parentNode
   if (snippetDiv)
     var snippet = snippetDiv
       ?.textContent //isolate text node
       ?.replace(/\.\.\./g, "") //remove ...
       ?.replace(/[\u{0080}-\u{10FFFF}]/gu, "")
       .trim(); //remove missing <?> chars common in snippets
 
   //get url from href, remove google tracking
   var url = e.getAttribute("href");
   if (url && url.indexOf("/url?q") > -1)
     url = new URLSearchParams(url.slice(5)).get("q");
 
   return {
     title,
     url,
    //  date,
     snippet,
   };
 });
 
   return results;
 }