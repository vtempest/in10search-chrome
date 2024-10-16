import Main from '$lib/components/TabManager/TabManager.svelte';

// import "tailwindcss/tailwind.css";
import "./app.pcss";

function restoreMain() {
  const app = new Main({
    target: document.body,
  });
}

document.addEventListener('DOMContentLoaded', restoreMain);
