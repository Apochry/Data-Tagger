# Security Review

## Overview
This document outlines the security measures and practices implemented to protect API keys and user data.

## API Key Protection

### ✅ Secure Practices Implemented

1. **Memory-Only Storage for Sensitive Data**
   - **API keys stored ONLY in React component state (memory)**
   - **API keys are NEVER persisted to localStorage, sessionStorage, or cookies**
   - API keys are cleared when the page is closed or refreshed
   - **Non-sensitive data** (CSV data, tags, column selection) **IS** stored in localStorage for convenience
   - This allows users to resume their work after page refresh without re-uploading data

2. **Header-Based Authentication**
   - All API keys transmitted via HTTP headers, never in URLs
   - Google AI: Uses `x-goog-api-key` header
   - OpenAI: Uses `Authorization: Bearer` header
   - OpenRouter: Uses `Authorization: Bearer` header

3. **Direct API Communication**
   - All requests go directly from user's browser to AI provider APIs
   - No intermediate servers or proxies
   - No third-party services that could intercept keys

4. **Input Security**
   - API key input field uses `type="password"` attribute
   - Prevents visual shoulder-surfing
   - Not shown in plain text in the UI

5. **Logging Safety**
   - Console logs only show API key LENGTH, never the actual key
   - Example: `console.log('API Key length:', apiKey?.length || 0)`
   - No full key values logged anywhere

6. **HTTPS Everywhere**
   - All API endpoints use HTTPS
   - Encrypted transmission over the network
   - Protection against man-in-the-middle attacks

7. **No Server-Side Storage**
   - Application runs entirely client-side
   - No backend server to store or log keys
   - API keys never leave the user's browser except for direct API calls

## Data Privacy

### User Data Protection

1. **CSV Processing**
   - All CSV data processed locally in the browser
   - No data uploaded to any servers except AI provider APIs
   - Data cleared from memory when session ends

2. **Tagged Results**
   - Processed data only exists in browser memory
   - Download happens client-side using Blob URLs
   - No server-side storage or persistence

## Browser Security Considerations

### User Responsibilities

1. **Secure Environment**
   - Users should use the application on trusted devices
   - Avoid using on public/shared computers
   - Use secure, private networks when possible

2. **Browser Extensions**
   - Be aware that malicious browser extensions could potentially access page memory
   - Use trusted browsers and extensions only
   - Keep browser updated with security patches

3. **Network Security**
   - Public WiFi networks may be monitored
   - Consider using VPN on untrusted networks
   - All API calls use HTTPS for encryption

## Potential Attack Vectors & Mitigations

### ❌ Attack Vector: XSS (Cross-Site Scripting)
**Mitigation**: 
- React automatically escapes all rendered content
- No use of `dangerouslySetInnerHTML`
- All user input sanitized by React's rendering

### ❌ Attack Vector: Man-in-the-Middle
**Mitigation**: 
- All API calls use HTTPS
- Browsers enforce HTTPS for all connections
- No mixed content (HTTP/HTTPS)

### ❌ Attack Vector: Browser History/Cache
**Mitigation**: 
- API keys never passed in URLs
- All keys passed in POST bodies or headers
- No URL query parameters containing sensitive data

### ❌ Attack Vector: Network Logs
**Mitigation**: 
- Header-based authentication (not URL parameters)
- HTTPS encryption prevents plaintext logging
- No intermediate proxy servers

### ❌ Attack Vector: Local Storage Theft
**Mitigation**: 
- **API keys NEVER stored in localStorage, sessionStorage, or cookies**
- API keys only exist in component state (memory)
- API keys cleared immediately on page close
- **Non-sensitive data** (CSV, tags) stored in localStorage for UX convenience
- Users can clear localStorage with "Start Over" button
- No personal or sensitive information stored persistently

## Security Audit History

### 2024-09-30 - Initial Security Audit
- **Issue Found**: Google API keys passed in URL query parameters
- **Severity**: Critical
- **Fixed**: Changed to use `x-goog-api-key` header instead
- **Files Updated**: 
  - `src/components/ModelSelectionStep.jsx`
  - `src/components/ProcessingStep.jsx`

## Best Practices for Users

1. **API Key Management**
   - Never share your API key
   - Rotate keys regularly
   - Use API provider's dashboard to monitor usage
   - Set spending limits on your API accounts

2. **Browser Security**
   - Keep browser updated
   - Use reputable browsers (Chrome, Firefox, Edge, Safari)
   - Avoid untrusted browser extensions
   - Clear browser data periodically

3. **Network Security**
   - Use trusted networks
   - Consider VPN on public WiFi
   - Verify HTTPS padlock in browser

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not open a public issue
2. Contact the repository maintainer directly
3. Allow time for the issue to be addressed before public disclosure

## Compliance

This application:
- Does not collect or store personal data
- Does not use tracking or analytics
- Does not require user accounts or authentication
- Processes all data client-side
- Makes no guarantee about API provider data handling (see their privacy policies)

## Disclaimer

While we implement security best practices for client-side applications, users should:
- Review the privacy policies of AI providers they choose
- Understand that API providers (Google, OpenAI, OpenRouter) will process the data sent to them
- Be aware that once data is sent to AI providers, their privacy policies apply
- Not send sensitive or confidential information through this tool

---

Last Updated: September 30, 2024

