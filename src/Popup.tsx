import React from 'react';

const Popup: React.FC = () => {
    const onClick = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url;

        try {
            const response = await fetch('http://127.0.0.1:5000/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const summaryContainer = document.getElementById('summaryContainer');
            if (summaryContainer) {
                summaryContainer.innerText = data.summary;
                summaryContainer.style.textAlign = 'left'
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Summarize Page</h2>
            <button style={{ marginBottom: '10px' }} onClick={onClick}>Generate Summary</button>
            <div id="summaryContainer" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', textAlign: 'left', minWidth: '300px' }}></div>
        </div>
    );
};

export default Popup;
