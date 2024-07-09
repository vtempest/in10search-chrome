<script lang="ts">
  import { onMount, setContext } from "svelte";
  import Result from "./Result.svelte";
  import { Search } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import { Select, SelectContent, SelectItem,
     SelectTrigger, SelectValue } from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button";



  let tabDisplay;
  //the devil is in the defaults
  let selectedSearchEngine = "Perplexity" ;
  let searchText = '';
  let results = [];
  let tabMessage = 'Enter your search query';

  $: results = [];

  onMount(function () {
    tabMessage = "Search tabs, favorites, wiki, or web";
  });
  
  function handleSelectChange(event) {
    selectedSearchEngine = event.value;
  }
  

  function searchSelected() {
    searchText = searchText;

    let url;
    switch (selectedSearchEngine) {
     
      case "Perplexity AI":
        url = "https://www.perplexity.ai/?q=" + encodeURIComponent(searchText);
        break;
      case "Google":
        url = "https://www.google.com/search?q=" + encodeURIComponent(searchText);
        break;
      case "DuckDuckGo":
        url = "https://duckduckgo.com/?q=" + encodeURIComponent(searchText);
        break;
      case "google_first": //manual
        url = "https://www.google.com/search?q=" + encodeURIComponent(searchText);
        break;
      case "DDG Go To First":
        url = "https://duckduckgo.com/?q=%5C" + encodeURIComponent(searchText);
        break;
    }
    chrome.tabs.create({ url, active: false }, function (tab) {
      console.log(tab.id);

      function inputSearch(searchTerms, engine) {
        setTimeout(() => {
          let inputSelector;
          switch (engine) {
            case "google":
              inputSelector = "input[name='q']";
              break;
            case "perplexity":
              inputSelector = "textarea[name='q']";
              break;
            case "claude":
              inputSelector = "textarea[placeholder='Enter your message here']"; // Adjust this selector for Claude
              break;
            case "duckduckgo":
              inputSelector = "input[name='q']";
              break;
          }
          const inputElement = document.querySelector(inputSelector);
          if (inputElement) {
            inputElement.value = searchTerms;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 1000);

        chrome.runtime.sendMessage({
          type: "inputSearch",
          content: document.body.innerHTML,
        });
      }

      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: inputSearch,
          args: [searchText, selectedSearchEngine],
        })
        .then(() => console.log("injected a function"));

      setTimeout(() => {
        chrome.tabs.update(tab.id, { selected: true });
      }, 3000);
    });
  }

  //on typing into search box, query all the open tabs
  function onSearchType(event) {
    searchText = event.target.value;
    results = [];

    //launch script to search all tabs in all windows
    chrome.windows.getAll({ populate: true }, function (winArray) {
      for (var i in winArray) {
        chrome.tabs.query({ windowId: winArray[i].id }).then(function (tabs) {
          
          function getTabContent(tabId, favIconUrl) {
            //send message to get HTML content, title and pass thru id/icon
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
                //gets tabID and favicon from chrome api
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
        var { tabId, title, favIconUrl, content } = request;

        //TODO strip HTML of tags
        content =
          title +
          " " +
          content
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
    <div class="relative">
      <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
      <Input
        value={searchText}
        on:input={onSearchType}
        class="pl-10"
        placeholder={tabMessage}
      />
    </div>
  </div>

  <div class="flex space-x-2 mb-4">
    <Select
        selected={selectedSearchEngine}
        onSelectedChange={handleSelectChange}
      >
        
         <SelectTrigger class="w-full">
        <SelectValue placeholder="Select search engine" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DDG Go To First">DuckDuckGo 1st</SelectItem>
        <SelectItem value="Perplexity AI">Perplexity AI</SelectItem>
        <SelectItem value="Google">Google</SelectItem>
        <SelectItem value="DuckDuckGo">DuckDuckGo</SelectItem>
      </SelectContent>
    </Select>
    <Button on:click={searchSelected} class="flex-shrink-0">
      <Search class="mr-2 h-4 w-4" /> {selectedSearchEngine}
    </Button>
  </div>

  <nav class="space-y-2" id="tabDisplay" bind:this={tabDisplay}>
    {#each results as result}
      <Result {result} />
    {:else}
      <div 
        id="tabMessage" 
        class="p-2 text-sm italic text-gray-600"
      >
        {tabMessage}
      </div>
    {/each}
  </nav>
</div>