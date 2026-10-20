# Grade 10 self-study

Published content includes the teacher's 17 original Wordwall URLs and two
pronunciation pages: `practice.html?unit=1&skill=pronunciation` and Unit 2.
Writing and supplementary listening materials have been withdrawn from the
current public site pending explicit teacher approval. Do not republish them
without that approval. Original teacher-supplied Wordwall activities are kept.

The pronunciation pages contain 21 identification questions and six practice
sentences. Audio is computer-generated American English using Piper, LibriTTS
high, speaker 0, length scale 1.65. Source model:
https://github.com/rhasspy/piper/releases/tag/v0.0.2
(voice-en-us-libritts-high.tar.gz). Its model card credits LibriTTS,
https://www.openslr.org/60/, licensed under CC BY 4.0:
https://creativecommons.org/licenses/by/4.0/. New scripts were synthesised and
converted to mono MP3 with normalised volume. The model is not included here.

Serve the repository root with `python -m http.server 8000` to preview.
Syntax checks: `node --check self-study/practice.js` and
`node --check self-study/practice-content.js`.
