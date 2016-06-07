//browser action dropdown with chrome.api permissions

//on popup load
var d = document;
var textStart = "Start typing to find all the words in the content of open tabs.";

d.addEventListener('DOMContentLoaded', function() {
    //fill with pre-existing text
    if (!localStorage["searchText"])
        localStorage["searchText"] = "";

    if (localStorage["searchText"].length > 0) {
        d.getElementById("inSearch").value = localStorage["searchText"];
        onSearchType();
    } else {
        d.getElementById("tabDisplay").innerHTML = "";
        d.getElementById("tabMessage").innerHTML = textStart;
    }

    //focus search box and have it auto process keys 
    var searchBox = d.getElementById("inSearch");



    searchBox.onkeyup = function() {

        clearTimeout(window.searchBoxThrottle);

        window.searchBoxThrottle = setTimeout(onSearchType, 500);

    };


    searchBox.focus();
    searchBox.select();
});

//on typing into search box, query all the open tabs
function onSearchType() {
    localStorage["searchText"] = d.getElementById("inSearch").value.trim();

    if (localStorage["searchText"].length == 0) {
        d.getElementById("tabDisplay").innerHTML = "";
        d.getElementById("tabMessage").innerHTML = textStart;
        return;
    }

    //scrape all tabs html, inject content-level script into each tab that scrapes its html, returns into callback
    chrome.windows.getAll({ populate: true }, function(winArray) {
        for (var w in winArray) {
            chrome.tabs.getAllInWindow(winArray[w].id,
                function(tabs) {
                    for (var i in tabs) {
                        chrome.tabs.executeScript(tabs[i].id, {
                            code: "chrome.extension.sendMessage({type: 'getHTML', tabId: " + tabs[i].id +
                                ", title: document.title, content: document.body.innerHTML});"
                        });
                    }
                }
            );
        }

        //after tabs processed
        setTimeout(function() {
            var tabMessage = d.getElementById("tabMessage");

            //if results found
            if (d.getElementById("tabDisplay").innerHTML.length > 0) {

                //TODO all windows?
                //shade current tab
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabCurrent) {
                    if (d.getElementById("tab" + tabCurrent[0].id) != null)
                        d.getElementById("tab" + tabCurrent[0].id).className += " currentTab";

                });

                //create a Move all tabs link
                var a = d.createElement('a');
                a.setAttribute('href', '#');
                a.innerText = "Move all results to new window";
                tabMessage.innerHTML = "";
                tabMessage.appendChild(a);

                //process Move all tabs click
                a.addEventListener("click", function() {
                    var tabDivs = document.getElementById("tabDisplay").getElementsByClassName("tabDiv");
                    var tabIds = [];

                    for (var i = 0; i < tabDivs.length; i++)
                        if (tabDivs[i].hasAttribute("id"))
                            tabIds.push(parseFloat(tabDivs[i].id.substring(3)));

                    chrome.windows.create({ tabId: tabIds[0], focused: true }, function(win) {
                        chrome.tabs.move(tabIds, { windowId: win.id, index: -1 });
                    });
                });




            } else { //if no results found
                if (d.getElementById("inSearch").value.length > 0)
                    tabMessage.innerHTML = "No results were found.";
                else
                    tabMessage.innerHTML = textStart;
            }
        }, 300);
    });
}


//on tab result click, go to that tab
function onClickTabResult(e) {
    var tabID = parseFloat(e.target.id.substring(3));
    var searchText = localStorage["searchText"];

    chrome.tabs.get(tabID, function(tab) {
        chrome.windows.get(tab.windowId, function(win) {
            chrome.windows.update(win.id, { focused: true })
        });
    });


    chrome.tabs.update(tabID, { active: true });

    var searchSplit = searchText.trim().split(" ");

    //highlight on page the last word searched for
    chrome.tabs.executeScript(tabID, {
        code: "window.find('" + searchSplit[searchSplit.length - 1] + "', false, false, true, false, true, false);"
    });
}




/**** CHROME API ****/

//process content text for each tab
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "getHTML") {
        var tabId = request.tabId;
        var title = request.title;
        var tabDisplay = d.getElementById("tabDisplay");

        //strip HTML of tags
        var content = title + " " + request.content
            .replace(/<style(.|\n)+?\/style>/gi, '').replace(/<noscript(.|\n)+?\/noscript>/gi, '')
            .replace(/<script(.|\n)+?\/script>/gi, '').replace(/<(.|\n)+?>/gi, '');


        //delete from tab display if already listed
        if (d.getElementById("tab" + tabId) != null) {
            tabDisplay.removeChild(d.getElementById("tab" + tabId));
        }

        //search to find all words in tab content
        var foundAllWords = true;
        var searchText = d.getElementById("inSearch").value.trim().toLowerCase();
        var searchSplit = searchText.split(" ");

        for (var i in searchSplit)
            if (searchSplit[i].length > 0)
                if (content.toLowerCase().indexOf(searchSplit[i]) == -1)
                    foundAllWords = false;

                //quit if all words not found
        if (!foundAllWords)
            return;


        //create title
        var tabDiv = d.createElement("div");
        tabDiv.setAttribute("class", "tabDiv");
        tabDiv.setAttribute("id", "tab" + tabId);
        tabDiv.addEventListener("click", onClickTabResult);

        if (title.length > 45)
            title = title.substr(0, 45) + "&hellip;";

        tabDiv.innerHTML = title;

        //create favIcon
        chrome.tabs.get(tabId, function(tab) {
            if (tab.favIconUrl.length > 0) {
                if (d.getElementById("tab" + tab.id).getElementsByTagName("img").length == 0) {
                    var img = d.createElement('img');
                    img.setAttribute('src', tab.favIconUrl);
                    img.setAttribute('width', '16px');
                    img.setAttribute('height', '16px');
                    d.getElementById("tab" + tab.id).insertBefore(img, d.getElementById("tab" + tab.id).firstChild);
                }
            }
        });

        //create snippet substring
        var indexHit = content.toLowerCase().indexOf(searchSplit[i]);
        var priorText = indexHit > 50 ? 50 : indexHit;
        var dispString = content.substr(Math.max(indexHit - 50, 0), priorText) +
            "<b>" + content.substr(indexHit, searchSplit[i].length) + "</b>" +
            content.substr(indexHit + searchSplit[i].length, 50);

        var tabDesc;
        tabDesc = d.createElement("div");
        tabDesc.setAttribute("class", "tabDesc");
        tabDesc.setAttribute("id", "des" + tabId);
        tabDesc.addEventListener("click", onClickTabResult);
        tabDesc.innerHTML = dispString;

        //attach to result display
        tabDiv.appendChild(tabDesc);
        tabDisplay.appendChild(tabDiv);
    }
});
