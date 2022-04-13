// Add the hidden button click listener
document.querySelector("#advanced").addEventListener("click", () => {
    document.querySelector("#hidden").classList.toggle("hidden");
    const arrow = document.querySelector("#arrow");
    arrow.innerHTML = arrow.innerHTML === "v" ? "^" : "v";
});

// Add the restore API key button click listener
document.querySelector("#restore").addEventListener("click", () => {
    chrome.storage.sync.get(["default"], data => {
        const e = document.querySelector("#api");
        e.value = data.default.api;
        save(e);
    });
});

// Add the reset all settings button click listener
document.querySelector("#reset").addEventListener("click", () => {
    chrome.storage.sync.get(["default"], data => {
        addData(data.default);
        
        chrome.storage.sync.set(data.default, () => {
            const p = document.querySelector("#saved");
            p.innerText = "Saved!";
            clearTimeout(timer);
            timer = setTimeout(() => p.innerText = "", 3000);
        });
    });
});
