document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('autofillButton');
    const status = document.getElementById('status');
    const autoPromptCheckbox = document.getElementById('autoPrompt');
    const rememberNameCheckbox = document.getElementById('rememberName');

    // Load saved settings
    chrome.storage.sync.get(['autoPrompt', 'rememberName'], function(result) {
        autoPromptCheckbox.checked = result.autoPrompt !== false; // Default to true
        rememberNameCheckbox.checked = result.rememberName !== false; // Default to true
    });

    // Save settings when changed
    autoPromptCheckbox.addEventListener('change', function() {
        chrome.storage.sync.set({ autoPrompt: this.checked });
    });

    rememberNameCheckbox.addEventListener('change', function() {
        chrome.storage.sync.set({ rememberName: this.checked });
    });

    // Check if we're on a valid Stripe checkout page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        if (!currentUrl.includes('checkout.stripe.com')) {
            button.disabled = true;
            status.textContent = 'Please navigate to a Stripe Checkout page';
            return;
        }

        // Only enable if it's a test page
        if (!currentUrl.includes('/cs_test_')) {
            button.disabled = true;
            status.textContent = 'This is not a test checkout page';
            return;
        }
    });

    function triggerAutofill() {
        if (button.disabled) return;
        
        button.disabled = true;
        status.textContent = 'Triggering autofill...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showStripeAutofillPrompt'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Error: Could not communicate with the page';
                } else if (response && response.success) {
                    status.textContent = 'Autofill prompt shown!';
                    // Close the popup after a short delay
                    setTimeout(() => window.close(), 1000);
                }
                button.disabled = false;
            });
        });
    }

    // Handle button click
    button.addEventListener('click', triggerAutofill);

    // Handle keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.shiftKey && e.code === 'KeyF') {
            triggerAutofill();
        }
    });
}); 