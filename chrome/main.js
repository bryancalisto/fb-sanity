const handlers = {
    'en': {
        'reactions-bar': {
            hide: () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.style.display = 'none'),
            show: () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.style.display = '')
        },
        'full-container': {
            hide: () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
            show: () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.style.display = '')
        }
    },
    'es': {
        'reactions-bar': {
            hide: () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
            show: () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = '')
        },
        'full-container': {
            hide: () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
            show: () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = '')
        }
    }
}

function applyReactionsBar(show) {
    const lang = document.documentElement.lang;
    if (handlers[lang]) {
        const action = show ? 'show' : 'hide';
        handlers[lang]['reactions-bar'][action]();
    }
}

function applyFullContainer(show) {
    const lang = document.documentElement.lang;
    if (handlers[lang]) {
        const action = show ? 'show' : 'hide';
        handlers[lang]['full-container'][action]();
    }
}

function applyPreferences() {
    chrome.storage.sync.get({
        hideReactionsBar: true,
        hideFullContainer: true
    }, preferences => {
        applyReactionsBar(!preferences.hideReactionsBar);
        applyFullContainer(!preferences.hideFullContainer);
    });
}

function setupContentObserver() {
    const observer = new MutationObserver(() => {
        applyPreferences();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        applyPreferences();
    }
});

setupContentObserver();
applyPreferences();

console.log('FB Sanity extension loaded');