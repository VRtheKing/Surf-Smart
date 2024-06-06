chrome.omnibox.onInputEntered.addListener(function(text) {
    var query='';
    var url='';
    if (text.startsWith("sof") || text.startsWith("stf") || text.startsWith("sf")) {
        query = text.substring(3).trim();
        url = "https://stackoverflow.com/search?q=" + encodeURIComponent(query);
        chrome.tabs.update({ url: url });
    } 
    else if (text.startsWith("yt") || text.startsWith("ytube") || text.startsWith("yts")){
        query = text.substring(3).trim();
        url = "https://youtube.com/search?q=" + encodeURIComponent(query);
        chrome.tabs.update({ url: url });
    }
    else if (text.startsWith("rd") || text.startsWith("rit") || text.startsWith("rdt")){
        query = text.substring(3).trim();
        url = "https://www.reddit.com/search/?q=" + encodeURIComponent(query);
        chrome.tabs.update({ url: url });
    }
    else {
        var defaultSearchUrl = "https://www.google.com/search?q=" + encodeURIComponent(text);
        chrome.tabs.update({ url: defaultSearchUrl });
    }
});
