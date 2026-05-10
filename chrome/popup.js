const DEFAULTS = {
    hideReactionsBar: true,
    hideFullContainer: true
};

const reactionsBarCheckbox = document.getElementById('hideReactionsBar');
const fullContainerCheckbox = document.getElementById('hideFullContainer');

function loadPreferences() {
    chrome.storage.sync.get(DEFAULTS, preferences => {
        reactionsBarCheckbox.checked = preferences.hideReactionsBar;
        fullContainerCheckbox.checked = preferences.hideFullContainer;
    });
}

function savePreferences() {
    chrome.storage.sync.set({
        hideReactionsBar: reactionsBarCheckbox.checked,
        hideFullContainer: fullContainerCheckbox.checked
    });
}

reactionsBarCheckbox.addEventListener('change', savePreferences);
fullContainerCheckbox.addEventListener('change', savePreferences);

loadPreferences();
