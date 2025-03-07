(function() {
    let fillInterval;
    let isPromptVisible = false; // Track if prompt is currently shown

    // Function to get a future expiration date (2 years from now)
    function getFutureExpirationDate() {
        const date = new Date();
        const futureYear = (date.getFullYear() + 2).toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${month}/${futureYear}`;
    }

    // Function to show the prompt dialog
    function showPromptDialog(cardInput, expInput, cvcInput, nameInput) {
        if (isPromptVisible) return; // Prevent multiple prompts
        isPromptVisible = true;

        // Get the last used name from storage
        chrome.storage.sync.get(['lastUsedName'], function(result) {
            const defaultName = result.lastUsedName || "John Doe";
            
            // Create and show the prompt dialog
            const promptDiv = document.createElement('div');
            promptDiv.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              z-index: 10000;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              min-width: 300px;
              border: 1px solid rgba(0,0,0,0.1);
              animation: slideIn 0.3s ease;
            `;
            
            // Add animation styles
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
            
            promptDiv.innerHTML = `
              <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1a1f36;">Test Environment Detected</h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #4f566b;">Auto-fill the payment form with test data?</p>
                <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px; font-size: 13px; color: #4f566b; font-weight: 500;">
                    Cardholder Name
                  </label>
                  <input 
                    type="text" 
                    id="stripe-autofill-name" 
                    value="${defaultName}"
                    style="
                      width: 100%;
                      padding: 8px 12px;
                      border: 1px solid #e0e0e0;
                      border-radius: 4px;
                      font-size: 14px;
                      box-sizing: border-box;
                      margin-bottom: 10px;
                    "
                  >
                  <div style="font-size: 12px; color: #697386; margin-top: 4px;">
                    Card: 4242 4242 4242 4242<br>
                    Exp: ${getFutureExpirationDate()}<br>
                    CVC: 123
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 10px;">
                <button id="stripe-autofill-yes" style="
                  flex: 1;
                  background: #635bff;
                  color: white;
                  border: none;
                  padding: 10px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                  transition: all 0.2s ease;
                ">Auto-fill</button>
                <button id="stripe-autofill-no" style="
                  flex: 1;
                  background: #f7fafc;
                  color: #1a1f36;
                  border: 1px solid #e0e0e0;
                  padding: 10px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                  transition: all 0.2s ease;
                ">Cancel</button>
              </div>
            `;

            document.body.appendChild(promptDiv);

            // Add hover effects
            const yesButton = document.getElementById('stripe-autofill-yes');
            const noButton = document.getElementById('stripe-autofill-no');
            
            yesButton.addEventListener('mouseover', () => yesButton.style.backgroundColor = '#5851ea');
            yesButton.addEventListener('mouseout', () => yesButton.style.backgroundColor = '#635bff');
            noButton.addEventListener('mouseover', () => noButton.style.backgroundColor = '#f0f4f7');
            noButton.addEventListener('mouseout', () => noButton.style.backgroundColor = '#f7fafc');

            // Add button press effect
            [yesButton, noButton].forEach(button => {
                button.addEventListener('mousedown', () => button.style.transform = 'scale(0.98)');
                button.addEventListener('mouseup', () => button.style.transform = 'scale(1)');
                button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');
            });

            function cleanup() {
                promptDiv.style.animation = 'slideOut 0.2s ease';
                setTimeout(() => {
                    promptDiv.remove();
                    style.remove();
                    isPromptVisible = false;
                }, 200);
            }

            // Handle user's choice
            yesButton.addEventListener('click', function() {
              const customName = document.getElementById('stripe-autofill-name').value.trim();
              
              // Save the name if remember name is enabled
              chrome.storage.sync.get(['rememberName'], function(result) {
                  if (result.rememberName !== false) {
                      chrome.storage.sync.set({ lastUsedName: customName });
                  }
              });

              // Fill card number
              cardInput.value = "4242424242424242";
              cardInput.dispatchEvent(new Event('input', { bubbles: true }));

              // Fill expiration date with future date
              expInput.value = getFutureExpirationDate();
              expInput.dispatchEvent(new Event('input', { bubbles: true }));

              // Fill CVC
              cvcInput.value = "123";
              cvcInput.dispatchEvent(new Event('input', { bubbles: true }));

              // Fill cardholder name with custom value
              nameInput.value = customName || "John Doe";
              nameInput.dispatchEvent(new Event('input', { bubbles: true }));

              console.log("Stripe test credit card details auto-filled.");
              cleanup();
            });

            noButton.addEventListener('click', cleanup);

            // Auto-remove the prompt after 10 seconds if no action is taken
            setTimeout(cleanup, 10000);

            // Handle Escape key to close prompt
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    cleanup();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        });
    }

    // Function to search for input fields and trigger the prompt
    function findFieldsAndShowPrompt() {
        const cardInput = document.querySelector('input[id="cardNumber"]');
        const expInput = document.querySelector('input[id="cardExpiry"]');
        const cvcInput = document.querySelector('input[id="cardCvc"]');
        const nameInput = document.querySelector('input[id="billingName"]');

        if (cardInput && expInput && cvcInput && nameInput) {
            clearInterval(fillInterval); // Stop checking once fields are found
            showPromptDialog(cardInput, expInput, cvcInput, nameInput);
        }
    }

    // Listen for messages from the extension
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showStripeAutofillPrompt') {
            findFieldsAndShowPrompt();
            sendResponse({success: true});
        }
    });

    // Auto-detect test environment and check settings
    if (window.location.href.includes('checkout.stripe.com/c/pay/cs_test_')) {
        chrome.storage.sync.get(['autoPrompt'], function(result) {
            if (result.autoPrompt !== false) {
                fillInterval = setInterval(findFieldsAndShowPrompt, 500);
            }
        });
    }
})();
  