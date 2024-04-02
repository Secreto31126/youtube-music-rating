chrome.runtime.onInstalled.addListener(() => {
    const data = {
        api: "AIzaSyDmrhNaBDjrMvSLWpFWUZBT_-LVTjVhgSI",
        scale: 5,
        emoji: "🌟",
        selectors_list_entry: "#contents #contents ytmusic-responsive-list-item-renderer",
        selectors_entry_title: "yt-formatted-string.title"
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
