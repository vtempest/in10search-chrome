<script>
  import { onMount, setContext } from "svelte";
  import Result from "./Result.svelte";

  let inSearch;
  let tabDisplay;

  let tabMessageDiv;
  let tabMessage = "";
  let searchText = "";

  $: results = [];

  onMount(function () {
    //fill with pre-existing text
    tabMessage = "Search to find all words in the content of open tabs.";
  });

  function searchGoogle() {
    searchText = searchText || "tesla rumors";

    var url = "https://www.perplexity.ai/?q=" + encodeURIComponent(searchText);

    chrome.tabs.create({ url, active: false }, function (tab) {
      console.log(tab.id);

      function inputSearch(searchTerms) {
        setTimeout(() => {
          console.log("inputSearch========================");
          console.log(document.querySelector("textarea[name='q']"));
          document.querySelector("textarea[name='q']").value = searchTerms;
        }, 1000);

        document.querySelector("textarea[name='q']").value = "searchTerms";

        chrome.runtime.sendMessage({
          type: "inputSearch",
          content: document.body.innerHTML,
        });
      }

      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: inputSearch,
          args: [searchText],

          // files : [ "src/pages/content/index.ts.js" ],
        })
        .then(() => console.log("injected a function"));

      setTimeout(() => {
        chrome.tabs.update(tab.id, { selected: true });
      }, 3000);
    });
  }

  //on typing into search box, query all the open tabs
  function onSearchType() {
    results = [];

    //launch script to search all tabs in all windows
    chrome.windows.getAll({ populate: true }, function (winArray) {
      for (var i in winArray) {
        chrome.tabs.query({ windowId: winArray[i].id }).then(function (tabs) {
          function getTabContent(tabId, favIconUrl) {
            chrome.runtime.sendMessage({
              type: "getHTML",
              tabId,
              favIconUrl,
              title: document.title,
              content: document.body.innerHTML,
            });
          }

          for (var i in tabs) {
            try {
              if (!tabs[i].url?.startsWith("chrome://"))
                chrome.scripting.executeScript({
                  target: { tabId: tabs[i].id, allFrames: true },
                  func: getTabContent,
                  args: [tabs[i].id, tabs[i].favIconUrl],
                });
            } catch (e) {}
          }
        }, false);
      }

      //after tabs processed
      setTimeout(function () {
        //if results found
        if (tabDisplay.querySelectorAll("div").length > 0) {
          //shade current tab
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabCurrent) {
              if (tabDisplay.querySelector("#tab" + tabCurrent[0].id) != null)
                tabDisplay.querySelector("#tab" + tabCurrent[0].id).className +=
                  " currentTab";
            }
          );

          /*/create a Move all tabs link
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.innerText = "Move all results to new window";
        tabMessageDiv.innerHTML = "";
        tabMessageDiv.appendChild(a);

        //process Move all tabs click
        a.addEventListener("click", function () {
          var tabDivs = tabDisplay
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
        */
        } else {
          // if no results found
          tabMessage = "No results were found.";
        }
      }, 300);
    });
  }

  //process content text for each tab
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.type == "inputSearch") {
        console.log(request.title);
      }

      if (request.type == "getHTML") {
        var { tabId, title, favIconUrl } = request;

        //TODO strip HTML of tags
        var content =
          title +
          " " +
          request.content
            .replace(/\r?\n|\r/g, " ")
            .replace(/<style(.|\n)+?\/style>/gi, "")
            .replace(/<noscript(.|\n)+?\/noscript>/gi, "")
            .replace(/<script(.|\n)+?\/script>/gi, "")
            .replace(/<(.|\n)+?>/gi, " ");

        //delete from tab display if already listed
        if (results?.map((x) => x.id).indexOf(tabId) > -1) {
          // return;
          results.splice(content?.map((x) => x.id).indexOf(tabId), 1);
        }

        //search to find all words in tab content
        var foundAllWords = true;
        var searchSplit = searchText.trim().split(" ");

        for (var i in searchSplit)
          if (searchSplit[i].length > 0)
            if (content.toLowerCase().indexOf(searchSplit[i]) == -1)
              foundAllWords = false;

        //quit if all words not found
        if (!foundAllWords) return;

        let lastSearchWord = searchSplit[searchSplit.length - 1];

        //create title
        if (title.length > 45) title = title.substr(0, 45) + "&hellip;";

        //create snippet substring
        let indexStartWord = content.toLowerCase().indexOf(lastSearchWord);
        let indexEndWord = indexStartWord + lastSearchWord.length;

        let snippetTextSize = 100;

        let dispString =
          content.substring(
            Math.max(indexStartWord - snippetTextSize, 0),
            indexStartWord
          ) +
          "<b>" +
          content.substring(indexStartWord, indexEndWord) +
          "</b>" +
          content.substring(indexEndWord, indexEndWord + snippetTextSize);

        console.log(dispString);

        var resultObj = {
          dispString,
          id: tabId,
          title,
          favIconUrl,
          lastSearchWord,
        };

        results.push(resultObj);

        //needed to make []{} reactive
        results = results;
      }
    }
  );

</script>

<div class="container mx-auto p-4 max-w-sm">
  <div class="mb-4">
    <input
      bind:value={searchText}
      type="text"
      id="inSearch"
      bind:this={inSearch}
      on:keyup={onSearchType}
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={tabMessage}
    />
  </div>

  <button 
    on:click={searchGoogle} 
    class="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center justify-center"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    Search
  </button>

  <nav class="space-y-2" id="tabDisplay" bind:this={tabDisplay}>
    {#each results as result}
      <Result {result} />
    {:else}
      <div 
        id="tabMessage" 
        bind:this={tabMessageDiv}
        class="p-2 text-sm italic text-gray-600"
      >
        {tabMessage}
      </div>
    {/each}
  </nav>
</div>