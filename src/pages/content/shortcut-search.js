import { searchEngines } from "../../lib/config/config";

/** Select Text, Press Tab To Search Google, 
 *  Tab again for First Result
 * preserve the results in sidebar
 */
function onKeyDown(e) {

  var baseQueryURL = searchEngines["Google"]

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
        document.location.host.match(/google/gi) 
        && document.querySelectorAll("a[href]:has(h3)")?.length > 0
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


window.addEventListener("keydown", onKeyDown, false);

/** Extract resuls JSON object from Google results html page 
 * @param {Document} document - Google HTML document object
 * @returns {Array} - array of objects with title, url, snippet
*/
function extractGoogleResultsPage(document) {
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
      snippet,
    };
  });

  return results;
}