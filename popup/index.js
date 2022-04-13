// On open
let timer;
chrome.storage.sync.get(["api", "scale", "emoji"], data => {
    addData(data);
});

// Add the data to the inputs
function addData(data) {
    document.querySelectorAll("input").forEach((e) => {
        e.value = data[e.id];
        e.addEventListener("input", save);
    });
}

// Save data on input
function save(e) {
    e = e.target ?? e;
    
    // Remove the error class if exists
    e.classList.remove("error");
    
    // Check if input is valid, mark as red if incorrect
    if (invalidData(e)) {
        e.classList.add("error");
        return;
    }

    // Save the data
    chrome.storage.sync.set({ [e.id]: e.value }, () => {
        const p = document.querySelector("#saved");
        p.innerText = "Saved!";
        clearTimeout(timer);
        timer = setTimeout(() => p.innerText = "", 3000);
    });
}

// Check if user input is valid
function invalidData(e) {
    if (e.id === "scale" && e.value < 1) return true;
    if (e.id === "emoji" && !e.value) return true;
    if (e.id === "api" && !e.value) return true;
}
