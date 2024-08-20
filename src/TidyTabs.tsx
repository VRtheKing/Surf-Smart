import Groq from "groq-sdk";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

type Tab = chrome.tabs.Tab;
type GroupedTabs = { [groupName: string]: string[] };

export async function tidyTabs() {
    try {
        const tabs: Tab[] = await chrome.tabs.query({});
        const tabTitles = tabs.map(tab => tab.title ?? '');

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `The following list shows the currently open tabs in my browser. Group them based on their
                     titles and content. The groups should be sorted like how a human would sort the tabs for managing
                     their tabs based on the topics and content. Provide a JSON response where each key represents a group name and its
                    corresponding value is an array of tab titles belonging to that group. If any tabs do not
                    fit into specific groups, place them under "Misc".\n\nTabs:\n${tabTitles.join('\n')}`,
                },
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const content = response?.choices[0]?.message?.content;
        if (typeof content !== 'string') {
            throw new Error('Invalid response format. Expected string.');
        }
        console.log(content);
        let groupedTabs: GroupedTabs = {};
        try {
            groupedTabs = JSON.parse(content) as GroupedTabs;
        } catch (error) {
            throw new Error('Error parsing JSON:');
        }

        for (const groupName in groupedTabs) {
            if (Object.prototype.hasOwnProperty.call(groupedTabs, groupName)) {
                const tabsInGroup = groupedTabs[groupName];
                const tabsToMove = tabs.filter(tab => tabsInGroup.includes(tab.title ?? ''));
                const tabIdsToMove = tabsToMove.map(tab => tab.id).filter(id => typeof id === 'number') as number[];
                if (tabIdsToMove.length > 0) {
                    const groupId = await chrome.tabs.group({ tabIds: tabIdsToMove });
                    console.log(`Tabs grouped under "${groupName}" (Group ID: ${groupId}) successfully.`);
                    await chrome.tabGroups.update(groupId, {
                        title: groupName,
                        collapsed: false,
                    });
                }
            }
        }

        // console.log('Tabs tidied successfully');
    } catch (error) {
        console.error('Error tidying tabs:', error);
    }
}
