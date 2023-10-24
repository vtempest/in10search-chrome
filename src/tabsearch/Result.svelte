<script lang="ts">
  import { onMount, setContext, SvelteComponent } from 'svelte';

  export let result;
  let {dispString, id, title} = result
  let tabDiv;
  
//on tab result click, go to that tab
function onTab() {

  chrome.tabs.get(id, function (tab) {
    chrome.windows.get(tab.windowId, function (win) {
      chrome.windows.update(win.id, { focused: true });
    });
  });

  chrome.tabs.update(id, { active: true });

  //highlight on page the last word searched for
  /*
  var searchSplit = searchText.trim().split(" ");
  searchSplit = searchSplit[searchSplit.length - 1];

  function goToSearchResult(search) {
    window.find(search, false, false, true, false, true, false);
  }

  chrome.scripting.executeScript({
    target: { tabId: tabID, allFrames: true },
    func: goToSearchResult,
    args: [searchSplit],
  });

  */
}

</script>


<div bind:this={tabDiv} class="tabDiv" on:click={onTab}>
  <div class="tabDesc"> {@html dispString}</div>
</div> 
  
<style>

.currentTab{
      background: #d3d3d3;
}
.tabDiv {
    padding: 2px;
    border-top: 1px solid #a9a9a9;
    font-size: 10pt ;
    white-space: nowrap;
    cursor: pointer;
}
.tabDesc {
    font-size: 8pt ;
    white-space: normal;
}
</style>
