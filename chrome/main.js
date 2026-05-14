const handlers = {
    'reactions-bar': {
        hide: [
            // () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.style.backgroundColor = 'blue'),
            // () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling.style.backgroundColor = 'blue'),
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.style.display = 'none'),
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling.style.display = 'none'),
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => console.log(item.parentNode.parentNode)),
        ],
        show: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.style.display = ''),
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.previousSibling.style.display = ''),
        ]
    },
    'full-container': {
        hide: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
        ],
        show: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = '')
        ]
    }
}

function applyReactionsBar(show) {
    const action = show ? 'show' : 'hide';
    for (let i=0; i < handlers['reactions-bar'][action].length; i++) {
        const handler = handlers['reactions-bar'][action][i];
        try {
            handler();
        } catch(e){
            console.error(`Error applying reactions bar handler (${i}):`, e);
        }
    }
}

function applyFullContainer(show) {
    const action = show ? 'show' : 'hide';

    for (let i=0; i < handlers['full-container'][action].length; i++) {
        const handler = handlers['full-container'][action][i];
        try {
            handler();
        } catch(e){
            console.error(`Error applying full container handler (${i}):`, e);
        }
    }
}

let cachedPreferences = null;

function applyPreferences() {
    if (cachedPreferences) {
        applyReactionsBar(!cachedPreferences.hideReactionsBar);
        applyFullContainer(!cachedPreferences.hideFullContainer);
        return;
    }

    chrome.storage.sync.get({
        hideReactionsBar: true,
        hideFullContainer: true
    }, preferences => {
        cachedPreferences = preferences;
        applyReactionsBar(!preferences.hideReactionsBar);
        applyFullContainer(!preferences.hideFullContainer);
    });
}

function setupContentObserver() {
    const observer = new MutationObserver(() => {
        console.log('DOM changed, reapplying preferences:', new Date().toTimeString());
        applyPreferences();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        cachedPreferences = null;
        applyPreferences();
    }
});

setupContentObserver();
applyPreferences();

console.log('FB Sanity extension loaded');