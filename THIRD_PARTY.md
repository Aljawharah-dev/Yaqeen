# Third-party services and content

## Data sources (queried live)

- **Quran text:** [Quranpedia API](https://api.quranpedia.net/), Hafs mushaf endpoint. This project queries the API live and does not bundle or republish a Quran dataset. Quranpedia permits live app integrations; attribution is appreciated, and bulk scraping or republishing is not allowed. [Usage policy](https://quranpedia.net/api-docs#usage-policy).
- **Hadith search and grading:** [Dorar Hadith Encyclopedia API](https://dorar.net/article/389). Hadith text and scholarly grading are returned from Dorar. This repository's MIT license does not license Dorar's content; follow the source's terms for its use.

## Software and assets

- **Tesseract.js 6:** Arabic OCR runtime used by the website and Chrome extension. [Apache License 2.0](https://github.com/naptha/tesseract.js/blob/master/LICENSE.md).
- **esbuild:** Chrome extension build tool (development dependency). [MIT License](https://github.com/evanw/esbuild/blob/main/LICENSE.md).
- **IBM Plex Sans Arabic:** font loaded from Google Fonts. [SIL Open Font License 1.1](https://github.com/IBM/plex/blob/master/LICENSE.txt).

## Project license

The root [LICENSE](LICENSE) applies only to original project code. It does not change the terms for Quranpedia or Dorar content, Tesseract.js, esbuild, or the IBM Plex font.
