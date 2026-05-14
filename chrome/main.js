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
        hide: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
                const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                console.log('container:', container);

                if (!container){
                    logWarn('Could not find reactions bar container for item:', item);
                    return;
                }

                // check if reactions bar is present (sometimes it's not, e.g. for just posted stuff), if not, skip hiding of 1st non comment child
                const hasReactionsBar = container.childNodes.length > 1;
                if (!hasReactionsBar) {
                    logWarn('No reactions bar found for item:', item);
                    return;
                }

                for (const node of container.childNodes) {
                    if (node.nodeType !== Node.COMMENT_NODE && node.style.display !== 'none') {
                        // node.style.display = 'none';
                        node.style.backgroundColor = 'red';
                        break;
                    }
                }
            }),
        ],
        show: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
                const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                if (!container){
                    logWarn('Could not find reactions bar container for item:', item);
                    return;
                }

                for (const node of container.childNodes) {
                    if (node.nodeType !== Node.COMMENT_NODE && node.style.display === 'none') {
                        node.style.display = '';
                        break;
                    }
                }
            }),
        ]
    },
    'full-container': {
        hide: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
                const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                if (!container){
                    logWarn('Could not find full container for item:', item);
                    return;
                }

                for (const node of container.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.style.display !== 'none') {
                        node.style.display = 'none';
                    }
                }
            })
        ],
        show: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
                const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                if (!container){
                    logWarn('Could not find full container for item:', item);
                    return;
                }

                for (const node of container.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.style.display === 'none') {
                        node.style.display = '';
                    }
                }
            })
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
            logError(`Error applying reactions bar handler (${i}):`, e);
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
            logError(`Error applying full container handler (${i}):`, e);
        }
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
        applyFullContainer(!preferences.hideFullContainer);
    });
}

function setupContentObserver() {
    const observer = new MutationObserver(() => {
        log('DOM changed, reapplying preferences:', new Date().toTimeString());
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