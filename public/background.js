chrome.omnibox.onInputStarted.addListener(function() {
    chrome.omnibox.setDefaultSuggestion({ description: "Quick Search Into the Sites" });
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var suggestions = [];
    var query = text.trim().toLowerCase();

    const siteMappings = [
        { prefix: 'stackoverflow', url: "https://stackoverflow.com/search?q=" },
        { prefix: 'youtube', url: "https://youtube.com/search?q=" },
        { prefix: 'chatgpt', url: "https://chat.openai.com/chat?q=" },
        { prefix: 'reddit', url: "https://www.reddit.com/search/?q=" },
        { prefix: 'wikipedia', url: "https://en.wikipedia.org/wiki/" },
        { prefix: 'spotify', url: "https://open.spotify.com/search/" }
    ];

    const words = query.split(' ');
    const firstWord = words[0];

    for (const site of siteMappings) {
        if (site.prefix.includes(firstWord)) {
            const searchQuery = query.slice(firstWord.length).trim();
            suggestions.push({
                deletable: true,
                content: site.prefix + " " + searchQuery,
                description: `(Search ${site.prefix.charAt(0).toUpperCase() + site.prefix.slice(1)}) ${searchQuery}`
            });
        }
    }
    suggest(suggestions);
});
chrome.omnibox.onInputEntered.addListener(function(text) {
    var query = '';
    var url = '';

    if (text.startsWith("sof") || text.startsWith("stf") || text.startsWith("sf")) {
        query = text.substring(3).trim();
        url = "https://stackoverflow.com/search?q=" + encodeURIComponent(query);
    } else if (text.startsWith("yt") || text.startsWith("ytube") || text.startsWith("yts")) {
        query = text.substring(3).trim();
        url = "https://youtube.com/search?q=" + encodeURIComponent(query);
    } else if (text.startsWith("gpt") || text.startsWith("chat") || text.startsWith("cgpt")) {
        query = text.substring(3).trim();
        url = "https://chat.openai.com/chat?q=" + encodeURIComponent(query);
    } else if (text.startsWith("rd") || text.startsWith("rit") || text.startsWith("rdt")) {
        query = text.substring(3).trim();
        url = "https://www.reddit.com/search/?q=" + encodeURIComponent(query);
    } else if (text.startsWith("wk") || text.startsWith("wiki") || text.startsWith("wp")) {
        query = text.substring(3).trim();
        url = "https://en.wikipedia.org/wiki/" + encodeURIComponent(query);
    } else if (text.startsWith("sp") || text.startsWith("spi") || text.startsWith("spot")) {
        query = text.substring(3).trim();
        url = "https://open.spotify.com/search/" + encodeURIComponent(query);
    } else {
        url = "https://www.google.com/search?q=" + encodeURIComponent(text);
    }

    chrome.tabs.create({ url: url });
    chrome.omnibox.setDefaultSuggestion({ description: "" });
});
