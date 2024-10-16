<script>
  import { onMount } from 'svelte';
  import { tab_categories } from './category-tab-data';
  import { ChatGroq } from '@langchain/groq';
  import { HumanMessage } from '@langchain/core/messages';

  const PLACEHOLDER_SECTIONS = tab_categories
    .map((i) => i.name + ' ' + i.keywords.join(' '));

  let sections = PLACEHOLDER_SECTIONS.map(title => ({ title, items: [] }));
  let status = 'idle';
  let worker;

  export let tabsStore;

  let text = "";
  $: text;

  let groqResponse = "";

  function getTabsList() {
    let tabsList = "";
    
    tabsStore.subscribe(tabs => {
      tabs.forEach((tab, index) => {
        const tabNumber = index + 1;
        const title = tab.title;
        const domain = new URL(tab.url).hostname;
        
        tabsList += `${tabNumber}. ${title}  ${domain}\n`;
      });
    })();
  
    console.log(tabsList);
    text = tabsList;
    return tabsList;
  }

  onMount(() => {
    getTabsList();
    worker = new Worker(new URL('./category-worker.js', import.meta.url), { type: 'module' });
  
    worker.addEventListener('message', (e) => {
      const { status: workerStatus, output } = e.data;
      if (workerStatus === 'initiate') {
        status = 'loading';
      } else if (workerStatus === 'ready') {
        status = 'ready';
      } else if (workerStatus === 'output') {
        const { sequence, labels, scores } = output;
        const label = scores[0] > 0.5 ? labels[0] : 'Other';
        const sectionID = sections.findIndex(x => x.title === label) ?? sections.length - 1;
        sections[sectionID].items = [...sections[sectionID].items, sequence];
        sections = sections;
      } else if (workerStatus === 'complete') {
        status = 'idle';
      }
    });
  
    return () => { 
      worker.terminate();
    }; 
  });
  
  function classify() {
    status = 'processing';
    console.log(text);
    worker.postMessage({
      text,
      labels: sections.slice(0, -1).map(section => section.title)
    });
  }
  
  function addCategory() {
    text = getTabsList();
    sections = [
      ...sections.slice(0, -1),
      { title: 'New Category', items: [] },
      sections[sections.length - 1]
    ];
  }
  
  function removeCategory() {
    if (sections.length > 1) {
      sections = [
        ...sections.slice(0, -2),
        sections[sections.length - 1]
      ];
    }
  }
  
  function clearCategories() {
    sections = sections.map(section => ({
      ...section,
      items: [],
    }));
  }

  async function callGroqAPI() {
    status = 'calling-groq';
    let apiKey = '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'
    try {
      const chat = new ChatGroq({
        apiKey, // Replace with your actual Groq API key
      });
      const messages = [new HumanMessage(text)];
      const response = await chat.invoke(messages);
      groqResponse = response.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      groqResponse = 'Error: Failed to call Groq API';
    } finally {
      status = 'idle';
    }
  }
  
  $: busy = status !== 'idle';
</script>

<div class="flex flex-col h-full">
  <textarea
    class="border w-full p-1 h-1/2"
    bind:value={text}
  ></textarea>
  <div class="flex flex-col justify-center items-center m-2 gap-1">
    <button
      class="border py-1 px-2 bg-blue-400 rounded text-white text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={busy}
      on:click={classify}
    >
      {#if !busy}
        Categorize
      {:else if status === 'loading'}
        Downloading (30s)
      {:else}
        Processing
      {/if}
    </button>
    <div class="flex gap-1">
      <button
        class="border py-1 px-2 bg-green-400 rounded text-white text-sm font-medium"
        on:click={addCategory}
      >
        Add category
      </button>
      <button
        class="border py-1 px-2 bg-red-400 rounded text-white text-sm font-medium"
        disabled={sections.length <= 1}
        on:click={removeCategory}
      >
        Remove category
      </button>
      <button
        class="border py-1 px-2 bg-orange-400 rounded text-white text-sm font-medium"
        on:click={clearCategories}
      >
        Clear
      </button>
      <button
        class="border py-1 px-2 bg-purple-400 rounded text-white text-sm font-medium"
        disabled={busy}
        on:click={callGroqAPI}
      >
        Call Groq API
      </button>
    </div>
  </div>

  <div class="flex justify-between flex-grow overflow-x-auto max-h-[40%]">
    {#each sections as section, index}
      <div class="flex flex-col w-full">
        <input
          disabled={section.title === 'Other'}
          class="w-full border px-1 text-center"
          bind:value={section.title}
        />
        <div class="overflow-y-auto h-full border">
          {#each section.items as item, itemIndex}
            <div class="m-2 border bg-red-50 rounded p-1 text-sm">
              {item}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if groqResponse}
    <div class="mt-4 p-2 border rounded bg-gray-100">
      <h3 class="font-bold">Groq API Response:</h3>
      <p>{groqResponse}</p>
    </div>
  {/if}
</div>

<style>
  /* Add any additional styles here */
</style>