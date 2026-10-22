# Self-study · Grades 10 and 11

Published content includes the teacher's 17 original Wordwall URLs and two
pronunciation pages: `practice.html?unit=1&skill=pronunciation` and Unit 2.
Grade 11 supplementary listening was approved for publication in chat.
`listening.html?grade=11&unit=1` (also Units 2 and 3) contains six activities
and 42 questions based on teacher-supplied transcripts. Unit 2 video 3 is
excluded at the teacher's request. YouTube players load only when selected;
whole-video activities omit an end time. Original playback is not independently
verified, and every activity has an official YouTube fallback link.

Writing and Grade 10 supplementary listening remain unpublished pending
review/source confirmation. Do not restore the earlier synthetic listening
drafts. Original teacher-supplied Wordwall activities are kept.

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
