# Feature scope recreated from the supplied ZIP

This repository is a clean-room implementation of the Yaqeen product behavior described in the supplied archive. It does not contain source files, bundled datasets, generated embeddings, OCR model weights, build output, screenshots, or other copied assets from that archive.

Implemented in this version:

- Arabic-first website with text and image input.
- In-browser Arabic OCR; the image file stays in the browser.
- Quran exact-match and typo-tolerant candidate search, with surah and ayah citation.
- Hadith lookup through the Dorar JSON API and a source-linked result.
- Separate result states for exact Quran text, likely Quran wording, hadith match or wording difference, weak/fabricated only when the source returns such a grade, uncertain match, not found, and source unavailable.
- Chrome Manifest V3 popup for the same check flow.
- Explicit non-fatwa and privacy language.

Differences from the supplied ZIP are intentional: this copy does not include its bundled Quran/Hadith corpora, model files, social-network post injection, or copied OCR assets. Current user-approved sources are Quranpedia and Dorar; the extension submits a query to the local service, which queries those sources live. There is no confidence claim that a “not found” result proves fabrication.

The hadith API's exact result schema and field completeness must be confirmed against live responses before relying on scholarly grading in a public release. The service only displays judgment fields returned by Dorar; it must not infer a grade from similarity.
