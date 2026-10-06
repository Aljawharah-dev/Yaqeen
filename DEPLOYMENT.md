# Deployment notes

The Node server is the API bridge and serves the website on port 3000. Deploy it to a Node-compatible host with outbound HTTPS access. Do not put service tokens in client code. Current source APIs require no token.

For a remote Chrome extension build, update `extension/manifest.json` host permissions and the API URL in `extension/popup.html` and `extension/popup.js` to the final HTTPS deployment domain. The local-development extension is intentionally restricted to localhost.
