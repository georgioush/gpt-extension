chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ 
        apiKey: 'YOUR_API_KEY_HERE', 
        urlEndpoint: 'https://<your-resource-name>.openai.azure.com/openai/deployments/<your-deployment-id>/chat/completions?api-version=<api-version>', 
        userPrompt: 'OpenAI について説明してください。' 
    });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'sendOpenAIRequest') {
        const { apiKey, urlEndpoint, userPrompt } = message;

        // ペイロードを定義
        const payload = {
            messages: [
                {
                    role: 'system',
                    content: 'あなたは情報を探すのを手助けするAIアシスタントです。'
                },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            top_p: 0.95,
            max_tokens: 4096, // completions の場合、最大が 4096 トークン (おそらく出力？)
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
            if (data.choices && data.choices.length > 0) {
                const messageContent = data.choices[0].message.content;
                console.log('Response: ', messageContent);

                // 取得したデータをchrome.storageに保存
                chrome.storage.sync.set({ response: messageContent }, () => {
                    console.log('Response has been saved.');
                });
            } else {
                console.error('No choices found in the response.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else if (message.action === 'logMainTabInfo') {
        console.log('MainTab info received:', message.mainTabInfo);
        console.log('MainTab body received:', message.mainTabBody);
    }
});