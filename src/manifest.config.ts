import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version, name } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  .replace(/[^\d.-]+/g, "").split(/[.-]/);

export default defineManifest(async (env) => ({
    "manifest_version": 3,
    "name": "Tab Manager AI",
    version: `${major}.${minor}.${patch}`,
    version_name: version,
    "description": "Tab Manager AI  - Browser Sidebar - Search Text Content of All Open Tabs",
    "permissions": [
        "sidePanel", "scripting", "storage", "contextMenus", "tabs"
    ],
    "host_permissions": [
        "*://*/*"
      ],
    "background": {
        "service_worker": "src/pages/background/index.ts"
    },
    "side_panel":{
        "default_path": "src/pages/sidepanel/index.html"
    },
    
    "action": {
        "default_title": "Search Tools"
     },

    "icons": {
        "32": "src/assets/icons/icon-32.png",
        "48": "src/assets/icons/icon-48.png",
        "128": "src/assets/icons/icon-128.png"
    },
    "commands": {
        "_execute_action": {
            "suggested_key": {
            "default": "Ctrl+Q",
            "mac": "Command+B"
            }
        }
    },  
    "content_scripts": [ {
        "matches": ["<all_urls>"],
        "js": ["src/pages/content/index.ts"]
    }]

}));
