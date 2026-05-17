const logPrefix = '[FB Sanity]';

function log (...args) {
    console.log(logPrefix, ...args);
}

function logWarn(...args) {
    console.warn(logPrefix, ...args);
}

function logError (...args) {
    console.error(logPrefix, ...args);
}

function logDebug (...args) {
    console.debug(logPrefix, ...args);
}

const LIKE_BTN_SELECTOR = 'div[data-ad-rendering-role="like_button"]';

const handlers = {
    'reactions-bar': {
        hide: () => document.querySelectorAll(LIKE_BTN_SELECTOR).forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find reactions bar container for item:', item);
                return;
            }

            const hasReactionsBar = container.children.length > 1;

            if (!hasReactionsBar) {
                logDebug('No reactions bar found for item:', item);
                return;
            }

            const firstChild = container.firstElementChild;
            if (firstChild && firstChild.style.display !== 'none') {
                firstChild.style.display = 'none';
            }
        }),
        show: () => document.querySelectorAll(LIKE_BTN_SELECTOR).forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            const hasReactionsBar = container.children.length > 1;

            if (!hasReactionsBar) {
                logDebug('No reactions bar found for item:', item);
                return;
            }

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
        hide: () => document.querySelectorAll(LIKE_BTN_SELECTOR).forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find full container for item:', item);
                return;
            }

            container.style.display = 'none';
        }),
        show: () => document.querySelectorAll(LIKE_BTN_SELECTOR).forEach(item => {
            const container = item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (!container){
                logWarn('Could not find full container for item:', item);
                return;
            }

            container.style.display = '';
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
let observer = null;

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
    observer = new MutationObserver(() => {
        logDebug('DOM changed, reapplying preferences:', new Date().toTimeString());
        applyPreferences();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        for (const change in changes) {
            cachedPreferences[change] = changes[change].newValue;
        }

        if (!cachedPreferences?.hideReactionsBar && !cachedPreferences?.hideFullContainer ) {
            logDebug('disabling observer');
            observer.disconnect();
        }
        else {
            logDebug('re-enabling observer');
            observer.observe(document.body, { childList: true, subtree: true });
        }

        applyPreferences();
    }
});

setupContentObserver();
applyPreferences();

log('Extension loaded');