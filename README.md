# يقين | Yaqeen Verify

An original Arabic text-matching prototype for Quranic verses and hadith. Includes a responsive website, local API bridge, image OCR in the browser, and a Chrome Manifest V3 popup.

## Run locally

Requires Node.js 20 or later. From the project folder run `npm start`, then open `http://localhost:3000`.

## Try the Chrome extension

1. Start the local server with `npm start`.
2. Build the extension: `cd extension`, `npm install`, then `npm run build`.
3. Open `chrome://extensions` and enable Developer mode.
4. Choose **Load unpacked** and select `extension/dist`.
5. The extension popup connects to the local server at `http://localhost:3000`.

For hosted use, configure the extension host permission and API base URL for your HTTPS deployment before publishing.

See [FEATURES.md](FEATURES.md) for the clean-room feature scope compared with the supplied ZIP.

## Sources and limitations

- Quran text is requested live from [Quranpedia API](https://api.quranpedia.net/), using the Hafs mushaf endpoint. Its [usage policy](https://quranpedia.net/api-docs#usage-policy) asks integrations not to scrape and republish the corpus. This project does not bundle Quran text.
- Hadith lookup uses the [Dorar Hadith Encyclopedia JSON API](https://dorar.net/article/389). Results and scholarly grading are displayed as returned by the service. Contact Dorar for permission before extensive use, as its API documentation advises.
- Website OCR runs in the browser through Tesseract.js; extension OCR bundles the runtime locally and downloads only Arabic recognition data when needed. Image contents are not uploaded to this app server.
- Exact Quran text matches can be identified; fuzzy Quran candidates are explicitly labeled as candidates. Hadith matching is approximate and does not independently authenticate a narration or issue a religious ruling. “No match” is not evidence that a text is fabricated.
- This prototype sends the submitted text to Quranpedia and/or Dorar to perform a live search. Do not enter private or sensitive content.

## Privacy

No accounts or analytics are included. The server does not write submitted text to disk. Network requests to source providers are required to return results.

## License

Original project code: MIT. Third-party services and source content remain under their respective terms. See `THIRD_PARTY.md`.

