document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['apiKey', 'urlEndpoint', 'userPrompt', 'response'], (data) => {
        document.getElementById('apiKey').value = data.apiKey || 'DEADBEEF';
        document.getElementById('urlEndpoint').value = data.urlEndpoint || 'https://<your-resource-name>.openai.azure.com/openai/deployments/<your-deployment-id>/chat/completions?api-version=<api-version>';
        document.getElementById('userPrompt').value = data.userPrompt || 'OpenAI について説明してください。';
        document.getElementById('response').innerText = data.response || '';
    });
});

document.getElementById('apiKey').addEventListener('input', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey }, () => {
        console.log('APIキーが保存されました。');
    });
});

document.getElementById('urlEndpoint').addEventListener('input', () => {
    const urlEndpoint = document.getElementById('urlEndpoint').value;
    chrome.storage.sync.set({ urlEndpoint }, () => {
        console.log('エンドポイントが保存されました。');
    });
});

document.getElementById('userPrompt').addEventListener('input', () => {
    const userPrompt = document.getElementById('userPrompt').value;
    chrome.storage.sync.set({ userPrompt }, () => {
        console.log('プロンプトが保存されました。');
    });
});

document.getElementById('requestButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const urlEndpoint = document.getElementById('urlEndpoint').value;
    const userPrompt = document.getElementById('userPrompt').value;

    // バックグラウンドスクリプトにAPIキーとエンドポイント、プロンプトを送信
    chrome.runtime.sendMessage({
        action: 'sendOpenAIRequest',
        apiKey: apiKey,
        urlEndpoint: urlEndpoint,
        userPrompt: userPrompt
    });
});

document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('response').innerText = '';
    chrome.storage.sync.set({ response: '' }, () => {
        console.log('レスポンスがクリアされました。');
    });
});

// バックグラウンドスクリプトからのメッセージを受信して表示
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.response) {
        document.getElementById('response').innerText = changes.response.newValue;
        console.log('レスポンスが更新されました。');
    }
});

// MainTab を取得ボタンのイベントリスナー
document.getElementById('getMainTabButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const mainTab = tabs[0];
            const mainTabInfo = `URL: ${mainTab.url}\nTitle: ${mainTab.title}`;
            document.getElementById('mainTabInfo').innerText = mainTabInfo;
            console.log('MainTab info:', mainTabInfo);

            // メインタブの <body> 情報を取得
            chrome.scripting.executeScript({
                target: { tabId: mainTab.id },
                func: () => document.body.innerHTML
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const mainTabBody = results[0].result;
                    console.log('MainTab body:', mainTabBody);

                    // 取得したデータをバックグラウンドスクリプトに送信
                    chrome.runtime.sendMessage({
                        action: 'logMainTabInfo',
                        mainTabInfo: mainTabInfo,
                        mainTabBody: mainTabBody
                    });
                } else {
                    console.log('Failed to retrieve main tab body.');
                }
            });
        } else {
            console.log('No active tab found.');
        }
    });
});