import React, { useState } from 'react';
import { tidyTabs } from './TidyTabs';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';
import './Popus.css';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
    dangerouslyAllowBrowser: true,
});

export async function getGroqSummary() {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    let content = await onWindowLoad() || ' ';

    if (content.trim().split(/\s+/).length > 8150){
        content = tab.url || ' ';
    }
    // console.log(content);
    
    return groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `Can you provide a comprehensive summary of the given text?
                    The summary should cover all the "key points" and "main ideas" presented in the original text,
                    while also condensing the information into a concise and easy-to-understand format by breaking down the output
                    into sections like overview, key points, conclusion etc.
                    Please ensure that the summary includes relevant details and examples that support the main
                    ideas, while avoiding any unnecessary information or repetition. The length of the summary should
                    be appropriate for the length and complexity of the original text, providing a clear and accurate overview 
                    without omitting any important information.` + content,
            },
        ],
        model: 'llama3-8b-8192',
        // model: 'llama-3.1-8b-instant',
    });
}

const Popup: React.FC = () => {
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loading_tabs, setLoading_tabs] = useState<boolean>(false);

    const summarizeContent = async () => {
        setLoading(true);
        setSummary('');
        try {
            const chatCompletion = await getGroqSummary();
            const content = chatCompletion.choices[0]?.message?.content || '';
            setSummary(content);
            // console.log(content);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onTidyTabsClick = async () => {
        try {
            setLoading_tabs(true);
            await tidyTabs();
            setLoading_tabs(false);
        } catch (error) {
            console.error('Error tidying tabs:', error);
        }
    };

    const [ask, setAsk] = useState<string>('');
    const quesPage = async (event: React.FormEvent) => {
        event.preventDefault(); 
        setLoading(true); 
        try {
            const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
            let page = await onWindowLoad() || ' ';
            if (page.length > 6000){
                page = tab.url || ' ';
            }
            console.log(page);
            const askContent = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: ask +page,
                    },
                ],
                model: 'llama-3.3-70b-versatile',
                // model: 'llama3-8b-8192',
                // model: 'llama-3.1-8b-instant',
            });
            setAsk('');
            const content = askContent.choices[0]?.message?.content || '';
            const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
            const formattedAsk = `${cap(ask.trim().replace(/\?+$/, ''))}?`;

            setSummary(`**${formattedAsk}**\n\n${content}`);

            // console.log(content);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const ungroupAllTabs = async () => {
        try {
            const groups = await chrome.tabGroups.query({});
            
            if (groups.length === 0) {
                // console.log('No groups to ungroup.');
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

            // console.log('all tabs ungrouped successfully');
        } catch (error) {
            console.error('Error ungrouping tabs:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div id="name-logo" style={{ width: '100%', textAlign: 'center' }}>
                <img src="name-logo.svg" alt="Name-Logo-Bro" style={{ height: '3rem', maxWidth: '100%' }} />
            </div>
            <div style={{ textAlign: 'center', padding: '0 2% 2% 2%' }}>
                <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={summarizeContent} disabled={loading}>
                        {loading ? 'Loading...' : 'Get Summary'}
                    </button>
                </div>
                <form onSubmit={quesPage} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingBottom: '1rem', gap: '0.3rem'}}>
                    <input
                    type="text"
                    className="input-field"
                    id="messageInput"
                    placeholder="Ask about page..."
                    value={ask}
                    autoFocus
                    autoComplete='off'
                    onChange={(e) => {setAsk(e.target.value)}}
                    style={{background: 'none', color: 'black', outline: 'none', border: '1px solid #e54f47', borderRadius: '0.625rem', maxWidth: '70%', textOverflow: 'clip', paddingLeft: '4%'}}/>
                    <button className="send-button" style={{display: 'flex', alignItems:'center', justifyContent:'center'}} type='submit' disabled={loading}>
                        <img src='send-btn.png' alt='Ask' style={{height: '1rem'}}/>
                    </button>
                </form>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '2.3rem', whiteSpace: 'nowrap' }}
                        onClick={onTidyTabsClick}>
                        Organize Tabs
                    </button>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '2.3rem', whiteSpace: 'nowrap' }}
                        onClick={ungroupAllTabs}>
                        Ungroup Tabs
                    </button>
                </div>
                {loading && (
                    <div id="summaryContainer" className="loading-summary"></div>
                )}
                {loading_tabs && (
                    <div id="tab-bar" className="loading-tabs"></div>
                )}
                {summary && !loading && (
                    <div id="summaryContainer">
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

