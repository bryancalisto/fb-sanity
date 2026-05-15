function log (...args) {
    console.log('[FB Sanity]', ...args);
}

function logWarn(...args) {
    console.warn('[FB Sanity]', ...args);
}

function logError (...args) {
    console.error('[FB Sanity]', ...args);
}

const handlers = {
    'reactions-bar': {
        hide: () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find reactions bar container for item:', item);
                return;
            }

            const firstChild = container.firstElementChild;
            if (firstChild && firstChild.style.display !== 'none') {
                firstChild.style.display = 'none';
            }
        }),
        show: () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find reactions bar container for item:', item);
                return;
            }

            const firstChild = container.firstElementChild;
            if (firstChild && firstChild.style.display === 'none') {
                firstChild.style.display = '';
            }
        })
    },
    'full-container': {
        hide: () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find full container for item:', item);
                return;
            }

            if (container.style.display !== 'none') {
                container.style.display = 'none';
            }
        }),
        show: () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find full container for item:', item);
                return;
            }

            if (container.style.display === 'none') {
                container.style.display = '';
            }
        })
    }
}

function applyReactionsBar(show) {
    const action = show ? 'show' : 'hide';
    try {
        handlers['reactions-bar'][action]();
    } catch(e){
        logError(`Error applying reactions bar handler:`, e);
    }
}

function applyFullContainer(show) {
    const action = show ? 'show' : 'hide';
    try {
        handlers['full-container'][action]();
    } catch(e){
        logError(`Error applying full container handler:`, e);
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
        // log('DOM changed, reapplying preferences:', new Date().toTimeString()); // debug
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

log('Extension loaded');