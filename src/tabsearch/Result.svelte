<script lang="ts">
  import { onMount } from "svelte";

  export let result;
  let { dispString, id, title, favIconUrl, lastSearchWord } = result;
  let tabDiv;

  //close tab
  function onClose() {
    chrome.tabs.remove(id);
    tabDiv.style.display = "none";
  }

  /**
   * on tab result click, go to that tab
   * highlight the last word searched for
   */
  function onTab() {
    chrome.tabs.get(id, function (tab) {
      chrome.windows.get(tab.windowId, function (win) {
        chrome.windows.update(win.id, { focused: true });
      });
    });

    chrome.tabs.update(id, { active: true });

    //highlight on page the last word searched for, keep clicking result to cycle through next instances
    function goToSearchResult(search) {
      window.find(search, false, false, true, false, true, false);

      // permanently highlight the word on page
      let newNode = document.createElement("mark");
      newNode.className = "highlight";
      let selection = window.getSelection();
      selection.getRangeAt(0).surroundContents(newNode);
    }

    chrome.scripting.executeScript({
      target: { tabId: id, allFrames: true },
      func: goToSearchResult,
      args: [lastSearchWord],
    });
  }
</script>

<div 
  bind:this={tabDiv} 
  class="p-3 border-2 border-gray-300 rounded-md shadow-md bg-white transform transition-transform duration-150 ease-in-out hover:shadow-lg cursor-pointer mb-3 relative group"
  on:click={onTab}
>
  <div class="flex items-center space-x-2 mb-2">
    <img src={favIconUrl} class="w-5 h-5 bg-primary-500 rounded" alt="Favicon" />
    <div class="text-sm font-medium truncate flex-grow">{title}</div>
    <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <!-- <button 
        class="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
        on:click|stopPropagation={onSave}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      </button> -->
      <button 
        class="p-1 bg-red-500 hover:bg-red-600 w-6 text-white rounded-full transition-colors duration-200"
        on:click|stopPropagation={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
  <div class="text-xs text-gray-600 line-clamp-2">{@html dispString}</div>
</div>