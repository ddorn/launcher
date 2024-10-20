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


async function load_shortcuts() {
  let path = "/home/diego/.config/dlauncher/shortcuts.json";
  try {
    let data = await Neutralino.filesystem.readFile(path);
    let shortcuts = JSON.parse(data);
    return shortcuts;
  } catch (error) {
    console.error("Error reading file", error);
    return [{ name: "Error", shortcut: "E", command: "echo Error" }];
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  let shortcuts = await load_shortcuts();
  let shortcutTemplate = document.querySelector("#shortcut-template");
  let shortcutContainer = document.querySelector("#shortcuts");
  shortcuts.forEach((shortcut) => {
    let clone = shortcutTemplate.cloneNode(true);
    clone.querySelector(".shortcut-name").textContent = shortcut.name;
    let key_display = clone.querySelector(".shortcut-shortcut");
    key_display.textContent = shortcut.shortcut;
    if (shortcut.color) {
      key_display.style.color = shortcut.color;
      clone.style.borderColor = shortcut.color;
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
});

// wait 1s then reload the page
// setTimeout(() => {
//   window.location.reload();
// }, 1000);