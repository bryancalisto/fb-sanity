function log (...args) {
    console.log('[FB Sanity]', ...args);
}

function logWarn(...args) {
    console.warn('[FB Sanity]', ...args);
}

function logError (...args) {
    console.error('[FB Sanity]', ...args);
}

/**
 * How hide / show works:
 * - The user can toggle hiding of reactions bar and full container in the extension dropdown.
 * - When the user toggles the setting, the content script receives the change via chrome.storage.onChanged listener and applies the new preferences by calling applyPreferences function.
 * - A MutationObserver is set up to listen for changes in the DOM. Whenever the DOM changes, it re-applies the preferences to ensure that any new content loaded dynamically also adheres to the user's settings.
 * 
 * How should the hiding work:
 * - Only modify the DOM when the toggle in ON (hide) state, when the toggle is OFF (show) state, do not modify the DOM, just leave it as is. This way we minimize the risk of breaking something on Facebook side, as we are not trying to override any Facebook styles, but just hide the elements by setting display:none on them.
 * - For reactions bar, hide the first element child of the full container. Leave the rest untouched.
 * - For full container, hide all element children of the full container. When showing, do not set display back to '' for any of the children, as we don't want to override any Facebook styles, just leave it as is.
 */
const handlers = {
    'reactions-bar': {
        hide: [
            () => document.querySelectorAll('div[data-ad-rendering-role="like_button"]').forEach(item => {
                const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

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
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.style.display !== 'none') {
                            node.style.display = 'none';
                        }

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

                // check if reactions bar is present (sometimes it's not, e.g. for just posted stuff), if not, skip hiding of 1st non comment child
                const hasReactionsBar = container.childNodes.length > 1;
                if (!hasReactionsBar) {
                    logWarn('No reactions bar found for item:', item);
                    return;
                }

                for (const node of container.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE ) {
                        if (node.style.display === 'none') {
                            node.style.display = '';
                        }

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

                if (container.style.display !== 'none') {
                    container.style.display = 'none';
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

                if (container.style.display === 'none') {
                    container.style.display = '';
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