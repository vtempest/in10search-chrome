import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version, name } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: "Tab Manager AI",
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  description:
    "in10search Tab Manager AI  - Browser Sidebar",
  permissions: ["sidePanel", "scripting", "contextMenus", "tabs", "activeTab"],
  host_permissions: ["*://*/*"],
  background: {
    service_worker: "src/pages/background/service-worker.js",
  },
  side_panel: {
    default_path: "src/pages/sidepanel/index.html",
  },
  
  options_page: "src/pages/options/index.html",
  


  action: {
    default_title: "Search Tools",
  },

  icons: {
    "32": "src/assets/icons/icon-32.png",
    "48": "src/assets/icons/icon-48.png",
    "128": "src/assets/icons/icon-128.png",
  },
  commands: {
    _execute_action: {
      suggested_key: {
        default: "Ctrl+Q",
        mac: "Command+B",
      },
    },
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/pages/content/index.js"],
    },
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
}));
