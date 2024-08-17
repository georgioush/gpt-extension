document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['apiKey', 'urlEndpoint'], (data) => {
        document.getElementById('apiKey').value = data.apiKey || 'DEADBEEF';
        document.getElementById('urlEndpoint').value = data.urlEndpoint || 'https://<your-resource-name>.openai.azure.com/openai/deployments/<your-deployment-id>/chat/completions?api-version=<api-version>';
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

document.getElementById('requestButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const urlEndpoint = document.getElementById('urlEndpoint').value;

    // バックグラウンドスクリプトにAPIキーとエンドポイントを送信
    chrome.runtime.sendMessage({
        action: 'sendOpenAIRequest',
        apiKey: apiKey,
        urlEndpoint: urlEndpoint
    });
});