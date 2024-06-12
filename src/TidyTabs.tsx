export async function tidyTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        const tabIds: number[] = tabs.map(tab => tab.id ?? -1);
        if (tabIds.length === 0) {
            console.error('No open tabs to group.');
            return;
        }
        await chrome.tabs.group({ tabIds }, async (groupId) => {
            console.log(`Group ${groupId} created`);
            await chrome.tabGroups.update(
                groupId,
                {
                    collapsed: false,
                    title: "Vanakkam da Mapla",
                    color: "blue",
                },
                () => {
                    console.log("Group updated");
                }
            );
        });

        console.log('Tabs tidied successfully');
    } catch (error) {
        console.error('Error tidying tabs:', error);
    }
}
