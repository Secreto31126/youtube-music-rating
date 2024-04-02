// Add the hidden button click listener
document.querySelector("#advanced")?.addEventListener("click", () => {
    document.querySelector("#hidden")?.classList.toggle("hidden");
    const arrow = /** @type {HTMLSpanElement} */ (document.querySelector("#arrow"));
    arrow.innerHTML = arrow.innerHTML === "v" ? "^" : "v";
});

// Add the restore selectors key button click listener
document.querySelector("#restore_selectors")?.addEventListener("click", () => {
    chrome.storage.sync.get(["default"], data => {
        const e1 = /** @type {HTMLInputElement} */ (document.querySelector("#selectors_entry_title"));
        e1.value = data.default.selectors_entry_title;
        save(e1);

        const e2 = /** @type {HTMLInputElement} */ (document.querySelector("#selectors_list_entry"));
        e2.value = data.default.selectors_list_entry;
        save(e2);
    });
});

// Add the restore API key button click listener
document.querySelector("#restore_api")?.addEventListener("click", () => {
    chrome.storage.sync.get(["default"], data => {
        const e = /** @type {HTMLInputElement} */ (document.querySelector("#api"));
        e.value = data.default.api;
        save(e);
    });
});

// Add the reset all settings button click listener
document.querySelector("#reset")?.addEventListener("click", () => {
    chrome.storage.sync.get(["default"], data => {
        addData(data.default);

        chrome.storage.sync.set(data.default, () => {
            const p = /** @type {HTMLParagraphElement} */ (document.querySelector("#saved"));
            p.innerText = "Saved!";
            clearTimeout(timer);
            timer = setTimeout(() => p.innerText = "", 3000);
        });
    });
});
