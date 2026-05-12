const handlers = {
    'en': {
        'reactions-bar': {
            hide: [
                // () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.style.display = 'none'),
                // () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.previousSibling.style.display = 'none'),
                () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling.style.backgroundColor = 'blue'),
                () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.style.backgroundColor = 'red'),
                () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.previousSibling.style.backgroundColor = 'yellow'),
                () => document.querySelectorAll('div[aria-label="Like"').forEach(item => console.log(item.parentNode.parentNode)),
                // () => document.querySelectorAll('div[aria-label="Like"').forEach(item => console.log(item.parentNode.parentNode)),
            ],
            show: [
                () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.previousSibling.style.display = ''),
                () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.previousSibling.style.display = ''),
            ]
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
        for (let i=0; i < handlers[lang]['reactions-bar'][action].length; i++) {
            const handler = handlers[lang]['reactions-bar'][action][i];
            try {
                handler();
                break;
            } catch(e){
                console.error(`Error applying reactions bar handler (${i}):`, e);
            }
        }
    }
}

function applyFullContainer(show) {
    const lang = document.documentElement.lang;
    if (handlers[lang]) {
        const action = show ? 'show' : 'hide';
        handlers[lang]['full-container'][action]();
    }
}

let cachedPreferences = null;

function applyPreferences() {
    if (cachedPreferences) {
        applyReactionsBar(!cachedPreferences.hideReactionsBar);
        // applyFullContainer(!cachedPreferences.hideFullContainer);
        return;
    }

    chrome.storage.sync.get({
        hideReactionsBar: true,
        hideFullContainer: true
    }, preferences => {
        cachedPreferences = preferences;
        applyReactionsBar(!preferences.hideReactionsBar);
        // applyFullContainer(!preferences.hideFullContainer);
    });
}

function setupContentObserver() {
    const observer = new MutationObserver(() => {
        console.log('DOM changed, reapplying preferences:', new Date().toISOString());
        applyPreferences();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function setupOnScrollListener() {
    let timeoutId = null;

    window.addEventListener('scroll', () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            console.log('Scrolled, reapplying preferences:', new Date().toISOString());
            applyPreferences();
        }, 500);
    });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        applyPreferences();
    }
});

setupContentObserver();
// setupOnScrollListener();
applyPreferences();

console.log('FB Sanity extension loaded');