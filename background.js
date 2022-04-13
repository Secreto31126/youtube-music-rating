chrome.runtime.onInstalled.addListener(() => {
    const data = {
        api: "AIzaSyDmrhNaBDjrMvSLWpFWUZBT_-LVTjVhgSI",
        scale: 5,
        emoji: "🌟",
    }
    data.default = JSON.parse(JSON.stringify(data));

    chrome.storage.sync.set(data);
});

function executeScript(tabId, url) {
    chrome.tabs.sendMessage(tabId, {
        message: "url_changed",
        url,
    }, console.log);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url?.includes("music.youtube.com")) {
        executeScript(tabId, changeInfo.url);
    }
});
