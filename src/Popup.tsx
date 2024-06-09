import React from 'react';
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
            content: "Summarize the content of this webpage, if there is any code snippet then include the snippet in your response in rich text as a codeblock itself. If there is any solution to the problem in the webpage, then make the response as the solution available for the problem in python with no comments" + url,
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
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div id='name-logo' style={{width: "100%"}}>
                <img src="name-logo.svg" alt="Name-Logo-Bro"/>
            </div>
            <div style={{ textAlign: 'center', padding: '0 20px 20px 20px' }}>
                <h2 color='black'>Summarize Page</h2>
                <button style={{ marginBottom: '10px' }} onClick={onClick}>Generate Summary</button>
                {summary && (
                    <div 
                        id="summaryContainer" 
                        style={{ 
                            border: '1px solid #ccc', 
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
