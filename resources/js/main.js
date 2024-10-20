// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("windowClose", () => { Neutralino.app.exit(); });


let example_shortcut = {
  name: "Test",
  shortcut: "T",
  command: "echo Test",
  color: "red",  // optional
}
// colors from tailwindcss
const colors = {
  "red": "#ef4444",
  "sky": "#0ea5e9",
  "gray": "#6b7280",
  "zinc": "#d1d5db",
  "lime": "#84cc16",
  "teal": "#14b8a6",
  "cyan": "#06b6d4",
  "blue": "#3b82f6",
  "pink": "#ec4899",
  "rose": "#f43f5e",
  "slate": "#6b7280",
  "stone": "#8d99ae",
  "amber": "#f59e0b",
  "green": "#10b981",
  "orange": "#f97316",
  "yellow": "#f59e0b",
  "indigo": "#6366f1",
  "violet": "#8b5cf6",
  "purple": "#8b5cf6",
  "neutral": "#d1d5db",
  "emerald": "#10b981",
  "fuscia": "#ec4899",
};
const colors_list = Object.keys(colors);


async function load_shortcuts(errors) {
  let configDir = await Neutralino.os.getPath('config');
  let path = `${configDir}/dlauncher/shortcuts.json`;
  try {
    let data = await Neutralino.filesystem.readFile(path);
    let shortcuts = JSON.parse(data);
    return shortcuts;
  } catch (error) {
    console.error("Error reading file", error);
    errors.push(`Error reading config at ${path}.`);
    errors.push("> " + error);
    return [];
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  let errors = [];

  let shortcuts = await load_shortcuts(errors);
  let shortcutTemplate = document.querySelector("#shortcut-template");
  let shortcutContainer = document.querySelector("#shortcuts");

  shortcuts.forEach((shortcut) => {
    let clone = shortcutTemplate.cloneNode(true);
    clone.querySelector(".shortcut-name").textContent = shortcut.name;
    let key_display = clone.querySelector(".shortcut-shortcut");
    key_display.textContent = shortcut.shortcut;
    // Sheck if the color is valid
    if (colors_list.includes(shortcut.color)) {
      // add the classes
      // clone.classList.add(`bg-${shortcut.color}-950`);
      // clone.classList.add(`border-${shortcut.color}-500`);
      // key_display.classList.add(`text-${shortcut.color}-500`);
      let color = colors[shortcut.color] || shortcut.color;
      clone.style.borderColor = color;
      key_display.style.color = color;
      clone.style.backgroundColor = color + "10";
    } else if (shortcut.color) {
      errors.push(`Invalid color for shortcut ${shortcut.name} (${shortcut.color}). Please use one of the following: ${colors_list.join(", ")}`);
    }
    // clone.querySelector(".shortcut-command").textContent = shortcut.command;
    shortcutContainer.appendChild(clone);
    clone.style.display = "block";
    clone.addEventListener("click", () => {
      Neutralino.os.spawnProcess(shortcut.command);
      Neutralino.app.exit();
    });
  });

  window.addEventListener("keydown", (e) => {
    // let lastPressedKeysSpan = document.querySelector("#last-pressed-keys");
    // lastPressedKeysSpan.textContent += e.key + " ";

    shortcuts.forEach((shortcut) => {
      if (e.key === shortcut.shortcut) {
        Neutralino.os.spawnProcess(shortcut.command);
        Neutralino.app.exit();
      }
    });

    if (e.key === "Escape") {
      Neutralino.app.exit();
    }
  });

  Neutralino.events.on('spawnedProcess', (evt) => {
    switch(evt.detail.action) {
        case 'stdOut':
            console.log(evt.detail.data);
            break;
        case 'stdErr':
            console.error(evt.detail.data);
            break;
        case 'exit':
            console.log(`Ping process terminated with exit code: ${evt.detail.data}`);
            break;
    }
  });

  if (errors.length > 0) {
    console.error("Errors found", errors);
    document.querySelector("#errors").textContent = errors.join("\n");
  }
});

// wait 1s then reload the page
// setTimeout(() => {
//   window.location.reload();
// }, 1000);