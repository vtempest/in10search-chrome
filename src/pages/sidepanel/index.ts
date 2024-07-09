import Main from '../../tabsearch/TabSearch.svelte';

import "tailwindcss/tailwind.css";
import "./app.pcss";

function restoreMain() {
  const app = new Main({
    target: document.body,
  });
}

document.addEventListener('DOMContentLoaded', restoreMain);
