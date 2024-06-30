import React from 'react';
import { tidyTabs } from './TidyTabs';
import Groq from "groq-sdk";
import ReactMarkdown from 'react-markdown';

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export async function getGroqSummary() {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    const url = tab.url || '';
    console.log(url);
    return groq.chat.completions.create({
        messages: [
        {
            role: "user",
            content: `Can you provide a comprehensive summary of the given text?
             The summary should cover all the key points and main ideas presented in the original text,
             while also condensing the information into a concise and easy-to-understand format.
             Please ensure that the summary includes relevant details and examples that support the main
             ideas, while avoiding any unnecessary information or repetition. The length of the summary should
             be appropriate for the length and complexity of the original text, providing a clear and accurate overview 
             without omitting any important information.` + url,
        },
        ],
        model: "llama3-8b-8192",
    });
}

const Popup: React.FC = () => {
    const [summary, setSummary] = React.useState('');

    const onClick = async () => {
        try {
            const chatCompletion = await getGroqSummary();
            const content = chatCompletion.choices[0]?.message?.content || "";
            setSummary(content);
            console.log(content);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const onTidyTabsClick = async () => {
        try {
            await tidyTabs();
        } catch (error) {
            console.error('Error tidying tabs:', error);
        }
    };
    const ungroupAllTabs = async () => {
        try {
            const groups = await chrome.tabGroups.query({});
            
            if (groups.length === 0) {
                console.log('No groups to ungroup.');
                return;
            }
            for (const group of groups) {
                const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
                const tabIdsInGroup = tabsInGroup.map(tab => tab.id!).filter(id => id !== undefined);
                
                if (tabIdsInGroup.length > 0) {
                    await chrome.tabs.ungroup(tabIdsInGroup);
                    console.log(`Ungrouped tabs from group ${group.id}`);
                }
            }
    
            console.log('All tabs ungrouped successfully');
        } catch (error) {
            console.error('Error ungrouping tabs:', error);
        }
    }
    

    return (
        <div>
            <div id='name-logo' style={{width: "100%"}}>
                <img src="name-logo.svg" alt="Name-Logo-Bro" height="40rem"/>
            </div>
            <div style={{ textAlign: 'center', padding: '0 20px 20px 20px' }}>
                <h2 color='black'>Summarize Page</h2>
                <button style={{ marginBottom: '10px' }} onClick={onClick}>Generate Summary</button>
                <button style={{ marginBottom: '10px', marginLeft: '10px' }} onClick={onTidyTabsClick}>Tidy Tabs</button>
                <button style={{ marginBottom: '10px', marginLeft: '10px' }} onClick={ungroupAllTabs}>Ungroup Tabs</button>
                {summary && (
                    <div 
                        id="summaryContainer" 
                        style={{ 
                            border: '1px solid #fff', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            textAlign: 'left', 
                            minWidth: '300px',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        }}>
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popup;