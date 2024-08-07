import React, { useState } from 'react';
import { tidyTabs } from './TidyTabs';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
    dangerouslyAllowBrowser: true,
});

export async function getGroqSummary() {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    let content = await onWindowLoad() || ' ';

    if (content.length > 8196){
        content = tab.url || ' ';
    }
    console.log(content);
    
    return groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `Can you provide a comprehensive summary of the given text?
                    The summary should cover all the key points and main ideas presented in the original text,
                    while also condensing the information into a concise and easy-to-understand format.
                    Please ensure that the summary includes relevant details and examples that support the main
                    ideas, while avoiding any unnecessary information or repetition. The length of the summary should
                    be appropriate for the length and complexity of the original text, providing a clear and accurate overview 
                    without omitting any important information.` + content,
            },
        ],
        model: 'llama3-8b-8192',
    });
}

const Popup: React.FC = () => {
    const [summary, setSummary] = React.useState<string>('');

    const summarizeContent = async () => {
        try {
            const chatCompletion = await getGroqSummary();
            const content = chatCompletion.choices[0]?.message?.content || '';
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

    const [ask, setAsk] = React.useState<string>('');
    const quesPage = async (event: React.FormEvent) => {
        event.preventDefault(); 
        try {
            const page = await onWindowLoad() || ' ';
            const askContent = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: ask +page,
                    },
                ],
                model: 'llama3-8b-8192',
            });
            setAsk('');
            const content = askContent.choices[0]?.message?.content || '';
            setSummary(content);
            console.log(content);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const ungroupAllTabs = async () => {
        try {
            const groups = await chrome.tabGroups.query({});
            
            if (groups.length === 0) {
                console.log('No groups to ungroup.');
                return;
            }

            for (const group of groups) {
                const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
                const tabIdsInGroup = tabsInGroup.map(tab => tab.id).filter(id => id !== undefined) as number[];
                
                if (tabIdsInGroup.length > 0) {
                    await chrome.tabs.ungroup(tabIdsInGroup);
                    // console.log(`Ungrouped tabs from group ${group.id}`);
                }
            }

            // console.log('All tabs ungrouped successfully');
        } catch (error) {
            console.error('Error ungrouping tabs:', error);
        }
    };

    return (
        <div>
            <div id="name-logo" style={{ width: '100%', textAlign: 'center' }}>
                <img src="name-logo.svg" alt="Name-Logo-Bro" style={{ height: '3rem', maxWidth: '100%' }} />
            </div>
            <div style={{ textAlign: 'center', padding: '0 2% 2% 2%' }}>
                {/* <h2 style={{ color: 'black', fontSize: '1.2rem' }}></h2> */}
                <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={summarizeContent}>
                        Get Summary
                    </button>
                </div>
                <form onSubmit={quesPage} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingBottom: '1rem', gap: '0.3rem'}}>
                    <input
                    type="text"
                    className="input-field"
                    id="messageInput"
                    placeholder="Ask about page..."
                    value={ask}
                    onChange={(e) => {setAsk(e.target.value)}}
                    style={{background: 'none', color: 'black', outline: 'none', border: '2px solid #e54f47', borderRadius: '0.625rem', maxWidth: '70%', textOverflow: 'clip', paddingLeft: '4%'}}/>
                    <button className="send-button" style={{display: 'flex', alignItems:'center', justifyContent:'center'}} type='submit'>
                        <img src='send-btn.png' alt='Ask' style={{height: '1rem'}}/>
                    </button>
                </form>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '2.3rem', whiteSpace: 'nowrap' }}
                        onClick={onTidyTabsClick}>
                        Tidy Tabs
                    </button>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '2.3rem', whiteSpace: 'nowrap' }}
                        onClick={ungroupAllTabs}>
                        Ungroup Tabs
                    </button>
                </div>
                {summary && (
                    <div
                        id="summaryContainer"
                        style={{
                            border: '1px solid #fff',
                            padding: '1rem',
                            borderRadius: '0.625rem',
                            textAlign: 'left',
                            minWidth: '300px',
                            boxShadow: '0px 0px 0.625rem rgba(0, 0, 0, 0.1)',
                            margin: '1rem auto',
                            maxWidth: '80%',
                            wordWrap: 'break-word',
                        }}
                    >
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                )}
            </div>
            <p style={{ textAlign: 'center' }}>
                Made with{' '}
                <img
                    src="https://www.svgrepo.com/show/528335/keyboard.svg"
                    style={{ width: '1rem', height: '1rem', verticalAlign: 'middle' }}
                    alt="keyboard icon"
                />{' '}
                by{' '}
                <a href="https://linktr.ee/mvram" target="_blank" rel="noopener noreferrer">
                    vrdev
                </a>
            </p>
        </div>
    );
};

async function onWindowLoad(): Promise<string | null> {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab found');

        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: DOMtoString,
        });

        return result.result ?? null;
    } catch (error) {
        console.error('Error executing script:', error);
        return null;
    }
}

function DOMtoString(): string {
    const selector = document.documentElement;
    return selector.innerText;
}

export default Popup;
