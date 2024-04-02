class API {
    /**
     * @param {string} key
     */
    constructor(key) {
        if (!key) throw new Error("Missing API key, please make sure you added it in the extension's settings");
        this.key = key;
    }

    /**
     * @param {string} request
     */
    async get(request) {
        return (await fetch("https://www.googleapis.com/youtube/v3" + request)).json();
    }

    /**
     * Unfortunately, the recursive function seems to be breaking the API requests limit. Removed.
     * @param {string} id
     * @param {undefined} [pageToken]
     */
    async getPlaylist(id, pageToken) {
        // Request for a single page of 50 videos max
        const res = await this.get(
            `/playlistItems?part=contentDetails&playlistId=${id}&maxResults=50&key=${this.key}`
            // + (pageToken ? `&pageToken=${pageToken}` : "")  // pageToken is used for recursion
        );

        if (res.error) throw res.error;

        const pages = [res.items];

        // If the playlist contains over 50 videos, request the next page and merge the results
        // if (res.nextPageToken) pages.push(...(await this.getPlaylist(id, res.nextPageToken)));

        // Expected output: [ [ first page ], [ second page ], ... ]
        return pages;
    }

    /**
     * @param {any[]} pages
     */
    async getVideos(pages) {
        const videos = [];

        // Make a request per page
        for (let page of pages) {
            // Each page is an array of max 50 videos' ids
            const ids = page.join("&id=");
            const res = await this.get(`/videos?part=statistics&id=${ids}&key=${this.key}`);

            if (res.error) throw res.error;

            videos.push(...res.items);
        }

        // Expected output: [ { video }, { video }, ... ]
        return videos;
    }
}

/**
 * @param {number[]} views - Array of views
 * @param {number} n - Number of stars
 */
function getRatings(views, n) {
    // Find the most viewed video
    const max = Math.max(...views);

    // Divide in n categories (max * 1/5, max * 2/5, ..., max * (n - 1) / n)
    const groups = new Array(n - 1).fill(0).map((_, i) => max * (i + 1) / n);

    // If views doesn't meet the requirements for the next group limit, break, else add a star to the rating
    // O(views ^ n) && o(views - 1 + n - 1)
    const ratings = new Array(views.length).fill(1);
    for (let i = 0; i < views.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            if (views[i] < groups[j]) break; else ratings[i]++;
        }
    }

    return ratings;
}

/**
 * @param {number[]} views - Array of views
 * @param {number} stars - Number of stars
 * @param {string} emoji - Emoji to represent the rating
 * @param {{ list_entry: string; entry_title: string }} selectors - Selectors for the list entry and the title within
 */
function addRatings(views, stars, emoji, selectors) {
    const ratings = getRatings(views, stars);

    // Find the rendered list
    const list = document.querySelectorAll(selectors.list_entry);

    // Regex to check if the video is private
    const isPrivateRegex = /FEmusic_library_privately_owned/;

    for (let i = 0, rate = 0; i < list.length; i++, rate++) {
        const elem = list[i];
        const text = elem.querySelector(selectors.entry_title);

        if (!text) {
            rate--;
            continue;
        }

        // If it's a private song (AKA we can't get its data), skip it
        if (isPrivateRegex.test(elem["secondary-flex-columns"])) {
            rate--;
            text.innerHTML += `<span id="rating" title="Private song, unable to parse data"> ❓</span>`;
            continue;
        }

        // Add the rating
        const viewsString = Number(views[rate]).toLocaleString();
        text.innerHTML += `<span id="rating" title="${viewsString} views"> ${emoji.repeat(ratings[rate])}</span>`;
    }
}

async function main(href = window.location.href) {
    // Check if there has been an update in user's settings
    const userSettings = await new Promise((res) => {
        chrome.storage.sync.get(["api", "scale", "emoji", "selectors_list_entry", "selectors_entry_title"], data => {
            res(data);
        })
    });

    const YT = new API(userSettings.api);

    // If the script has already been run, do nothing
    if (!!document.querySelector("#rating")) return "Already executed";

    const playlist = new URL(href).searchParams.get("list");
    if (!playlist) return "No playlist id found";

    const ids = (await YT.getPlaylist(playlist)).map(page => page.map(item => item.contentDetails.videoId));
    const views = (await YT.getVideos(ids)).map(item => parseInt(item.statistics.viewCount));

    addRatings(
        views,
        userSettings.scale,
        userSettings.emoji,
        {
            list_entry: userSettings.selectors_list_entry,
            entry_title: userSettings.selectors_entry_title
        }
    );

    return "Success";
}

main();

// Listen for messages sent from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'url_changed') main(request.url).then(r => sendResponse(r));
    return true;
});
