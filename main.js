const handlers = {
    'en': {
        'reactions-bar': () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
        'all-bars': () => document.querySelectorAll('div[aria-label="Like"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.style.display = 'none')
    },
    'es': {
        'reactions-bar': () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none'),
        'all-bars': () => document.querySelectorAll('div[aria-label*="Me gusta:"').forEach(item => item.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none')
    }
}

function hideReactionsBar() {
    const lang = document.documentElement.lang;
    if (handlers[lang]) {
        handlers[lang]['reactions-bar']();
    }
}

function hideAllBars() {
    const lang = document.documentElement.lang;
    if (handlers[lang]) {
        handlers[lang]['all-bars']();
    }
}

/**
 * Hides new bars on dynamic content changes
 */
function setupContentObserver() {
    const observer = new MutationObserver(() => {
        // hideReactionsBar();
        hideAllBars();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// hideReactionsBar();
hideAllBars();
setupContentObserver();