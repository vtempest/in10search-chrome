<script lang="ts">
  import { onMount, setContext  } from "svelte";
  import Result from "./Result.svelte";

  let inSearch;
  let tabDisplay = "";
  let tabMessage = "";
  let searchText = "";
  let results = [];

  $: results = [];

  onMount(function () {
    //fill with pre-existing text
    tabMessage =
      "Start typing to match all the words in the content of open tabs.";
  });


  //on typing into search box, query all the open tabs
  function onSearchType() {
   

    $: results = [];


    //launch script to search all tabs in all windows
    chrome.windows.getAll({ populate: true }, function (winArray) {
      for (var i in winArray) {
        chrome.tabs.query({ windowId: winArray[i].id }).then(function (tabs) {
          function getTabContent(tabId) {
            chrome.runtime.sendMessage({
              type: "getHTML",
              tabId: tabId,
              title: document.title,
              content: document.body.innerHTML,
            });
          }

          for (var i in tabs) {
            try {

              chrome.scripting.executeScript({
                target: { tabId: tabs[i].id, allFrames: true },
                func: getTabContent,
                args: [tabs[i].id],
              });
            } catch (e) {}
          }
        }, false);
      }

      /*
        //after tabs processed
    setTimeout(function () {

      //if results found
      if (document.querySelector("#tabDisplay").innerHTML.length > 0) {
        //shade current tab
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabCurrent) {
            if (document.querySelector("#tab" + tabCurrent[0].id) != null)
              document.querySelector("#tab" + tabCurrent[0].id).className +=
                " currentTab";
          }
        );

        //create a Move all tabs link
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.innerText = "Move all results to new window";
        tabMessage.innerHTML = "";
        tabMessage.appendChild(a);

        //process Move all tabs click
        a.addEventListener("click", function () {
          var tabDivs = document
            .getElementById("tabDisplay")
            .getElementsByClassName("tabDiv");
          var tabIds = [];

          for (var i = 0; i < tabDivs.length; i++)
            if (tabDivs[i].hasAttribute("id"))
              tabIds.push(parseFloat(tabDivs[i].id.substring(3)));

          chrome.windows.create(
            { tabId: tabIds[0], focused: true },
            function (win) {
              chrome.tabs.move(tabIds, { windowId: win.id, index: -1 });
            }
          );
        });
      } else {
        //if no results found
          // tabMessage = "No results were found.";
      }
    }, 300);*/
    });
  }

  
  //process content text for each tab
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type == "getHTML") {
      var {tabId, title}  = request;
      //TODO strip HTML of tags
      var content =
        title + " " + request.content
          .replace(/<style(.|\n)+?\/style>/gi, "")
          .replace(/<noscript(.|\n)+?\/noscript>/gi, "")
          .replace(/<script(.|\n)+?\/script>/gi, "")
          .replace(/<(.|\n)+?>/gi, "");



      //delete from tab display if already listed
      if (results?.map( (x)=>x.id).indexOf(tabId) > -1) {
        // return;
        results.splice(content.map((x)=>x.id).indexOf(tabId), 1);
      }

      //search to find all words in tab content
      var foundAllWords = true;
      var searchSplit = searchText.split(" ");

      console.log(searchText)

      for (var i in searchSplit)
        if (searchSplit[i].length > 0)
          if (content.toLowerCase().indexOf(searchSplit[i]) == -1)
            foundAllWords = false;


      


      

      //quit if all words not found
      if (!foundAllWords) return;

      //create title

      if (title.length > 45) title = title.substr(0, 45) + "&hellip;";




      /*/create favIcon
      chrome.tabs.get(tabId, function (tab) {
        if (tab.favIconUrl.length > 0) {
          if (
            document.querySelector("#tab" + tab.id)?.getElementsByTagName("img").length ==
            0
          ) {
            var img = document.createElement("img");
            img.setAttribute("src", tab.favIconUrl);
            img.setAttribute("width", "16px");
            img.setAttribute("height", "16px");
            document.querySelector("#tab" + tab.id).insertBefore(
              img,
              document.querySelector("#tab" + tab.id).firstChild
            );
          }
        }
      }); */

      //create snippet substring
      var indexHit = content.toLowerCase().indexOf(searchSplit[i]);

      console.log (indexHit)
      var priorText = indexHit > 50 ? 50 : indexHit;
      var dispString =
        content.substring(Math.max(indexHit - 50, 0), priorText) +
        "<b>" +
        content.substring(indexHit, searchSplit[i].length) +
        "</b>" +
        content.substring(indexHit + searchSplit[i].length, 50);

      
      var resultObj = {dispString, id: tabId, title};

      results.push(resultObj);
      
      //needed to make []{} reactive
      results = results;
      
    }
  });
</script>

<div class="container">
  <input
    bind:value={searchText}
    type="text"
    id="inSearch"
    bind:this="{inSearch}"
    on:keyup="{onSearchType}"
  />
  <div id="tabDisplay">
    {#each results as result}
      <Result {result} />
    {:else}
  <div id="tabMessage">{tabMessage}</div>
    {/each}
  </div>
</div>

<style>
  :global(body) {
    overflow: hidden;
    margin: 5px;
    padding: 0;
    background: white;
  }
  #tabDisplay {
    min-width: 300px;
    max-width: 300px;
    font-size: 10pt;
  }

  #tabDisplay img {
    padding-right: 3px;
  }
  #tabMessage {
    padding-top: 2px;
    padding-bottom: 2px;
    min-width: 300px;
    font-size: 10pt;
    font-style: italic;
    cursor: default;
  }

  #tabMessage a {
    font-style: normal;
    color: #2f4f4f;
  }

  #inSearch {
    min-width: 300px;
  }
</style>
