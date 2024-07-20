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
    const siteMappings = [
        { prefix: 'stackoverflow', url: "https://stackoverflow.com/search?q=" },
        { prefix: 'youtube', url: "https://youtube.com/search?q=" },
        { prefix: 'chatgpt', url: "https://chat.openai.com/chat?q=" },
        { prefix: 'reddit', url: "https://www.reddit.com/search/?q=" },
        { prefix: 'wikipedia', url: "https://en.wikipedia.org/wiki/" },
        { prefix: 'spotify', url: "https://open.spotify.com/search/" }
    ];

    const [prefix, ...rest] = text.split(' ');
    const query = rest.join(' ');
    const site = siteMappings.find(site => site.prefix === prefix.toLowerCase());

    if (site) {
        const url = site.url + encodeURIComponent(query);
        chrome.tabs.create({ url: url });
        chrome.omnibox.setDefaultSuggestion({ description: "" });
    } else {
        const url = "https://www.google.com/search?q=" + encodeURIComponent(text);
        chrome.tabs.create({ url: url });
        chrome.omnibox.setDefaultSuggestion({ description: "" });
    }
});
