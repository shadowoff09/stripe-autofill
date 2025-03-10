# Stripe Checkout Autofill Extension

<div align="center">
  <img src="banner.png" alt="stripe-autofill Banner" width="1280"/>
</div>

This browser extension auto-fills test credit card details on `https://checkout.stripe.com/` for testing purposes only.

## Test Details

- **Credit Card Number:** 4242424242424242
- **Expiration Date:** 12/34
- **CVC:** 123

## File Structure
```
stripe-autofill/
├── manifest.json
├── content.js
├── README.md
├── .github/
│   ├── workflows/
│   │   └── release.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
└── icons/
    ├── icon48.png
    └── icon128.png
```


## Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `stripe-autofill` folder.
4. Navigate to `https://checkout.stripe.com/` to test the autofill functionality.

## Development

### Automatic Releases

This repository is configured with GitHub Actions to automatically:
1. Create a new release when changes are pushed to the main branch
2. Generate a ZIP file with all extension files 
3. Attach the ZIP to the release for easy downloading

## Disclaimer

This extension is intended for testing environments only. Do not use in production.
