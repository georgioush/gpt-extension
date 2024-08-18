chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', urlEndpoint: 'https://<your-resource-name>.openai.azure.com/openai/deployments/<your-deployment-id>/chat/completions?api-version=<api-version>' });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'sendOpenAIRequest') {
        const { apiKey, urlEndpoint } = message;

        // ペイロードを定義
        const payload = {
            messages: [
                {
                    role: 'system',
                    content: 'あなたは情報を探すのを手助けするAIアシスタントです。'
                },
                { role: 'user', content: 'Open AI について日本語で説明してください' }
            ],
            temperature: 0.2,
            top_p: 0.95,
            max_tokens: 10000
        };

        try {
            const response = await fetch(urlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('Response: ', data.choices[0].message.content);

            // 取得したデータをchrome.storageに保存
            chrome.storage.sync.set({ response: data.choices[0].message.content }, () => {
                console.log('Response has been saved.');
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
});