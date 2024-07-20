chrome.omnibox.onInputStarted.addListener(function() {
    chrome.omnibox.setDefaultSuggestion({ description: "Quick Search Into the Sites" });
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var suggestions = [];
    var query = text.trim().toLowerCase();
    
    const siteMappings = [
        { prefix: 'stackoverflow', keywords: "sof, stf, sf", url: "https://stackoverflow.com/search?q=" },
        { prefix: 'youtube', keywords: "yt, yts, ytube", url: "https://youtube.com/search?q=" },
        { prefix: 'chatgpt', keywords: "gpt, chat, cgpt", url: "https://chat.openai.com/chat?q=" },
        { prefix: 'reddit',  keywords: "rd, rit, rdt", url: "https://www.reddit.com/search/?q=" },
        { prefix: 'wikipedia',  keywords: "wk, wiki, wp", url: "https://en.wikipedia.org/wiki/" },
        { prefix: 'spotify',  keywords: "sp, spi, spot", url: "https://open.spotify.com/search/" },
        { prefix: 'github',  keywords: "gt, git", url: "https://github.com/search?q=" }
    ];
    
    const words = query.split(' ');
    const firstWord = words[0];
    
    for (const site of siteMappings) {
        if (site.prefix.includes(firstWord)) {
            const searchQuery = query.slice(firstWord.length).trim();
            suggestions.push({
                deletable: true,
                content: site.prefix + " " + searchQuery,
                description: `(Search ${site.prefix.charAt(0).toUpperCase() + site.prefix.slice(1)}) Keywords: ${site.keywords} ${searchQuery}`
            });
        }
    }
    
    suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(function(text) {
    var url = '';
    const siteMappings = [
        { prefix: 'stackoverflow', url: "https://stackoverflow.com/search?q=" },
        { prefix: 'youtube', url: "https://youtube.com/search?q=" },
        { prefix: 'chatgpt', url: "https://chat.openai.com/chat?q=" },
        { prefix: 'reddit', url: "https://www.reddit.com/search/?q=" },
        { prefix: 'wikipedia', url: "https://en.wikipedia.org/wiki/" },
        { prefix: 'spotify', url: "https://open.spotify.com/search/" },
        { prefix: 'github', url: "https://github.com/search?q=" }
    ];
    
    const [prefix, ...rest] = text.split(' ');
    const userQuery = rest.join(' ');
    const site = siteMappings.find(site => site.prefix === prefix.toLowerCase());

    if (site) {
        url = site.url + encodeURIComponent(userQuery);
    } else {
        if (prefix.startsWith("sof") || prefix.startsWith("stf") || prefix.startsWith("sf")) {
            url = "https://stackoverflow.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("yt") || prefix.startsWith("ytube") || prefix.startsWith("yts")) {
            url = "https://youtube.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("gpt") || prefix.startsWith("chat") || prefix.startsWith("cgpt")) {
            url = "https://chat.openai.com/chat?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("rd") || prefix.startsWith("rit") || prefix.startsWith("rdt")) {
            url = "https://www.reddit.com/search/?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("wk") || prefix.startsWith("wiki") || prefix.startsWith("wp")) {
            url = "https://en.wikipedia.org/wiki/" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("sp") || prefix.startsWith("spi") || prefix.startsWith("spot")) {
            url = "https://open.spotify.com/search/" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("gt") || prefix.startsWith("git")){
            url = "https://github.com/search?q=" + encodeURIComponent(userQuery);
        } 
        else {
            url = "https://www.google.com/search?q=" + encodeURIComponent(text);
        }
    }

    chrome.tabs.update({ url: url });
});
