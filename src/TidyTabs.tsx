export async function tidyTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        if (tabs.length === 0) {
            console.error('No open tabs to group.');
            return;
        }
        const extractDomain = (url: string) => {
            const urlObj = new URL(url);
            return urlObj.hostname;
        };

        const colors: chrome.tabGroups.ColorEnum[] = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan"];
        let colorIndex = 0;

        const tabsByDomain: { [domain: string]: chrome.tabs.Tab[] } = {};
        for (const tab of tabs) {
            if (tab.url) {
                const domain = extractDomain(tab.url);
                if (!tabsByDomain[domain]) {
                    tabsByDomain[domain] = [];
                }
                tabsByDomain[domain].push(tab);
            }
        }

        for (const domain in tabsByDomain) {
            const tabsInDomain = tabsByDomain[domain];
            const tabIdsToGroup = tabsInDomain.map(tab => tab.id!).filter(id => id !== undefined);
            if (tabIdsToGroup.length > 0) {
                const groupId = await chrome.tabs.group({ tabIds: tabIdsToGroup });
                const groupColor = colors[colorIndex % colors.length];
                colorIndex++;
                await chrome.tabGroups.update(groupId, {
                    collapsed: false,
                    title: domain,
                    color: groupColor,
                });
                console.log(`Group '${domain}' created with tabs: ${tabIdsToGroup} and color: ${groupColor}`);
            }
        }

        console.log('Tabs grouped by site successfully');
    } catch (error) {
        console.error('Error tidying tabs:', error);
    }
}
