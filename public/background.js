const siteMappings = [
    { prefix: 'stackoverflow', keywords: "sof, stf, sf", url: "https://stackoverflow.com/search?q=" },
    { prefix: 'youtube', keywords: "yt, yts, ytube", url: "https://youtube.com/search?q=" },
    { prefix: 'chatgpt', keywords: "gpt, chat, cgpt", url: "https://chat.openai.com/chat?q=" },
    { prefix: 'reddit', keywords: "rd, rit, rdt", url: "https://www.reddit.com/search/?q=" },
    { prefix: 'wikipedia', keywords: "wk, wiki, wp", url: "https://en.wikipedia.org/wiki/" },
    { prefix: 'spotify', keywords: "sp, spi, spot", url: "https://open.spotify.com/search/" },
    { prefix: 'github', keywords: "gt, git", url: "https://github.com/search?q=" },

    { prefix: 'amazon', keywords: "am, az, amz", url: "https://www.amazon.com/s?k=" },
    { prefix: 'ebay', keywords: "eb, by", url: "https://www.ebay.com/sch/i.html?_nkw=" },
    { prefix: 'news', keywords: "nw, ns", url: "https://news.google.com/search?q=" },
    { prefix: 'quora', keywords: "qr, qra", url: "https://www.quora.com/search?q=" },
    { prefix: 'twitter', keywords: "tw, ttr", url: "https://twitter.com/search?q=" },
    { prefix: 'imdb', keywords: "im, ibd", url: "https://www.imdb.com/find?q=" },
    { prefix: 'bing', keywords: "bg, bin", url: "https://www.bing.com/search?q=" },
    { prefix: 'yahoo', keywords: "ya, yah", url: "https://search.yahoo.com/search?p=" },

    { prefix: 'facebook', keywords: "fb, fbc", url: "https://www.facebook.com/search/top/?q=" },
    { prefix: 'instagram', keywords: "ig, insta, igm", url: "https://www.instagram.com/explore/tags/" },
    { prefix: 'linkedin', keywords: "ln, li", url: "https://www.linkedin.com/search/results/all/?keywords=" },
    { prefix: 'snapchat', keywords: "sc, sn", url: "https://www.snapchat.com/add/" },
    { prefix: 'tumblr', keywords: "tb, tmb", url: "https://www.tumblr.com/search/" }
];

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var suggestions = [];
    var query = text.trim().toLowerCase();
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
        } else if (prefix.startsWith("gt") || prefix.startsWith("git")) {
            url = "https://github.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("am") || prefix.startsWith("az") || prefix.startsWith("amz")) {
            url = "https://www.amazon.com/s?k=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("eb") || prefix.startsWith("by")) {
            url = "https://www.ebay.com/sch/i.html?_nkw=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("nw") || prefix.startsWith("ns")) {
            url = "https://news.google.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("qr") || prefix.startsWith("qra")) {
            url = "https://www.quora.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("tw") || prefix.startsWith("ttr")) {
            url = "https://twitter.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("im") || prefix.startsWith("ibd")) {
            url = "https://www.imdb.com/find?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("bg") || prefix.startsWith("bin")) {
            url = "https://www.bing.com/search?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("ya") || prefix.startsWith("yah")) {
            url = "https://search.yahoo.com/search?p=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("fb") || prefix.startsWith("fbc")) {
            url = "https://www.facebook.com/search/top/?q=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("ig") || prefix.startsWith("insta") || prefix.startsWith("igm")) {
            url = "https://www.instagram.com/explore/tags/" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("ln") || prefix.startsWith("li")) {
            url = "https://www.linkedin.com/search/results/all/?keywords=" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("sc") || prefix.startsWith("sn")) {
            url = "https://www.snapchat.com/add/" + encodeURIComponent(userQuery);
        } else if (prefix.startsWith("tb") || prefix.startsWith("tmb")) {
            url = "https://www.tumblr.com/search/" + encodeURIComponent(userQuery);
        } else {
            url = "https://www.google.com/search?q=" + encodeURIComponent(text);
        }
    }

    chrome.tabs.update({ url: url });
});
