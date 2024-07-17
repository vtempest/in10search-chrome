<script>
  import { onMount } from "svelte";
  import { Search, X, GripVertical } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";

  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";
  import findInTabContent from "./find-tab-content";
  import { writable, derived } from 'svelte/store';
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import { bounceIn } from "svelte/easing";

  let selectedSearchEngine = "Perplexity";
  const tabsStore = writable([]);
  export const resultsStore = derived(tabsStore, $tabs => $tabs);

  $: results = $resultsStore;
  const OPTION_HIGHLIGHT_RESULT = 0;

  let searchText = "";
  let tabMessage = "Search text of open tabs or web";
  let tabDisplay;

  const searchEngineURLs = {
    Perplexity: "https://www.perplexity.ai/?q=",
    Google: "https://www.google.com/search?q=",
    DuckDuckGo: "https://duckduckgo.com/?q=",
    "DDG Go To First": "https://duckduckgo.com/?q=%5C",
  };

  onMount(function () {
    fetchAllTabs();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "updateTabLists") {
        fetchAllTabs();
      } else if (message.type === "tabActivated") {
        updateActiveTab(message.tabId);
      }
    });
  });

  function handleSelectChange(value) {
    selectedSearchEngine = value.value;
    if (searchText) {
      searchSelected();
    }
  }

  function searchSelected() {
    var baseURL = searchEngineURLs[selectedSearchEngine];
    let url = baseURL + encodeURIComponent(searchText);

    chrome.runtime.sendMessage({ type: "openTab", url, bg: false });
  }

  async function fetchAllTabs() {
    chrome.tabs.query({}, (tabs) => {
      const newResults = tabs
        .filter(tab => !tab.url?.startsWith("chrome://"))
        .map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          active: tab.active,
          favIconUrl: tab.favIconUrl || "",
          dispString: false,
          muted: tab.mutedInfo?.muted,
          audible: tab.audible // Add this line to include audio information

        }));
      
      tabsStore.set(newResults);
    });
  }

  function updateActiveTab(activeTabId) {
    tabsStore.update(tabs => 
      tabs.map(tab => ({...tab, active: tab.id === activeTabId}))
    );
  }

  async function onSearchType(event) {
    searchText = event.target.value;

    if (searchText === "") {
      await fetchAllTabs();
      return;
    }

    tabsStore.set([]);
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        if (!tab.url?.startsWith("chrome://")) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: (tabId, favIconUrl, title, url, searchText) => {
              const content = document.body.innerText;
              if (
                title.toLowerCase().includes(searchText.toLowerCase()) ||
                url.toLowerCase().includes(searchText.toLowerCase()) ||
                content.toLowerCase().includes(searchText.toLowerCase())
              ) {
                chrome.runtime.sendMessage({
                  type: "tabFound",
                  tabId,
                  favIconUrl,
                  title,
                  url,
                  content,
                });
              }
            },
            args: [
              tab.id,
              tab.favIconUrl || "",
              tab.title,
              tab.url,
              searchText,
            ],
          });
        }
      }
    });
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.type === "tabFound") {
        let resultObj = findInTabContent(request, searchText);

        if (
          typeof resultObj === "undefined" ||
          resultObj?.dispString === undefined
        )
          return;

        tabsStore.update(currentResults => {
          const existingIndex = currentResults.findIndex(result => result.id === resultObj.id);
          if (existingIndex !== -1) {
            // Update existing tab info
            currentResults[existingIndex] = { ...currentResults[existingIndex], ...resultObj };
            return [...currentResults];
          } else {
            // Add new tab
            return [...currentResults, resultObj];
          }
        });
      }
    }
  );

  
  let forceRerender = 0; // Add this line to create a force re-render trigger

  function handleSort(event) {
    const newItems = event.detail.items;
    tabsStore.set(newItems);
    
    // Send the new order to the background script
    chrome.runtime.sendMessage({ 
      type: "updateTabOrder", 
      newOrder: newItems.map(item => item.id) 
    });

    // Use setTimeout to refetch tabs and force re-render after a short delay
    setTimeout(() => {
      console.log("Refetching tabs and forcing re-render after sort");
      fetchAllTabs();
      forceRerender += 1; // Increment to force re-render
    }, 750); // 750ms delay
  }


  function closeTab(tabId, event) {
    event.stopPropagation();
    chrome.tabs.remove(tabId, () => {
      tabsStore.update(tabs => tabs.filter(tab => tab.id !== tabId));
    });
  }


  
  function handleResultClick(result) {
    chrome.tabs.get(result.id, function (tab) {
      chrome.windows.get(tab.windowId, function (win) {
        chrome.windows.update(win.id, { focused: true });
      });
    });

    chrome.tabs.update(result.id, { active: true });

    chrome.scripting.executeScript({
      target: { tabId: result.id, allFrames: true },
      args: [result.lastSearchWord, OPTION_HIGHLIGHT_RESULT],
      func: (search, OPTION_HIGHLIGHT_RESULT) => {
        window.find(search, false, false, true, false, true, false);

        if (OPTION_HIGHLIGHT_RESULT) {
          let newNode = document.createElement("mark");
          newNode.className = "highlight";
          let selection = window.getSelection();
          selection.getRangeAt(0).surroundContents(newNode);
        }
      }
    });

    // updateActiveTab(result.id);
    // forceRerender += 1;
  }

  function toggleAudio(tabId, event) {
  event.stopPropagation(); // Prevent the tab from being activated
  chrome.tabs.get(tabId, (tab) => {
    chrome.tabs.update(tabId, { muted: !tab.mutedInfo.muted }, (updatedTab) => {
      tabsStore.update(tabs => 
        tabs.map(t => 
          t.id === tabId 
            ? { ...t, muted: updatedTab.mutedInfo.muted }
            : t
        )
      );
    });
  });
}
</script>

<div class="container mx-auto p-4 max-w-sm">
  <div class="mb-4">
    <div class="relative">
      <Search
        class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        size={20}
      />
      <Input
        value={searchText}
        on:input={onSearchType}
        class="pl-10"
        placeholder={tabMessage}
      />
    </div>
  </div>

  <div class="flex space-x-2 mb-4">
    <Select.Root onSelectedChange={handleSelectChange}>
      <Select.Trigger class="w-full">
        <Select.Value placeholder="{selectedSearchEngine}" />
      </Select.Trigger>
      <Select.Content>

        {#each Object.entries(searchEngineURLs) as [key, url]}
          <Select.Item value={key}>{key}</Select.Item>
        {/each}
    </Select.Content>
    </Select.Root>
    <Button on:click={searchSelected} class="flex-shrink-0">
      <Search class="mr-2 h-4 w-4" />
      {selectedSearchEngine}
    </Button>
  </div>

   
  <div class="space-y-1" bind:this={tabDisplay}>
    <section use:dndzone={{items: results}} on:consider={handleSort} on:finalize={handleSort}>
      {#each results as result (result.id)}
        <div animate:flip={{duration: 500}}>
          <div on:click={() => handleResultClick(result)} class="cursor-pointer">
            <Card 
              class="py-2 px-3 flex items-center space-x-3 transition-colors duration-200 {result.active ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-100'}"
            >
            <div class="flex-shrink-0 cursor-move">
              <GripVertical size={14} class="text-gray-400" />
            </div>
            {#if result.favIconUrl}<img src={result.favIconUrl} alt="" class="w-4 h-4 flex-shrink-0" /> {:else}<div class="w-4 h-4 flex-shrink-0 bg-gray-200 rounded-full" />{/if}
            {#if result.audible || result.muted}
              <span 
                class="text-blue-500 cursor-pointer" 
                on:click|stopPropagation={(e) => toggleAudio(result.id, e)}
                title={result.muted ? "Unmute" : "Mute"}
              >
                {#if result.muted}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                {/if}
              </span>
            {/if}
            <div class="flex-grow flex flex-col justify-center overflow-hidden">
              <p class="text-sm font-medium text-gray-900 truncate" title={result.title}>{result.title}</p>
              {#if result.dispString}
                <p class="text-xs text-gray-500 break-words">{@html result.dispString}</p>
              {/if}
            </div>
              <Button variant="ghost" size="icon" class="flex-shrink-0 h-6 w-6 hover:bg-slate-300">
                <span on:click|stopPropagation={(e) => closeTab(result.id, e)}>
                  <X size={14} class="text-gray-500" />
                </span>
              </Button>
            </Card>
          </div>
        </div>
      {:else}
        <div class="p-2 text-sm italic text-gray-600">
          {tabMessage}
        </div>
      {/each}
    </section>
  </div>
</div>