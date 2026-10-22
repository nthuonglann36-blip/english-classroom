# Self-study · Grades 10 and 11

Published content includes the teacher's 17 original Wordwall URLs and two
pronunciation pages: `practice.html?unit=1&skill=pronunciation` and Unit 2.
Grade 11 supplementary listening was approved for publication in chat.
`listening.html?grade=11&unit=1` (also Units 2 and 3) contains six activities
and 42 questions based on teacher-supplied transcripts. Unit 2 video 3 is
excluded at the teacher's request. YouTube players load only when selected;
whole-video activities omit an end time. Original playback is not independently
verified, and every activity has an official YouTube fallback link.

Grade 11 Writing and Pronunciation Units 1–3 were also approved in chat.
`skills.html?grade=11&unit=1&skill=writing` (or `skill=pronunciation`, Units
1–3) provides three writing tasks and 24 new pronunciation questions.
Writing Unit 2 follows the textbook opinion essay: why parents should NOT
strictly limit teenagers' screen time, 120–150 words. Draft and revision are
saved per unit in the student's browser when storage is available. The learner
explicitly copies the draft with prepared feedback instructions, opens their
own ChatGPT account and pastes it. Clipboard failures provide manual copy.

Grade 11 pronunciation uses existing lesson recordings, not new synthetic
speech: `grade11/assets/audio/u01-track03.mp3`, `u01-track04.mp3`,
`u02-track11.mp3`, `u02-track12.mp3`, `u03-track18.mp3`, `u03-track19.mp3`.
They provide model/listen-and-repeat practice; the 24 new written application
questions test strong/weak auxiliaries, contractions and consonant–vowel linking.

Grade 10 Writing and supplementary listening remain unpublished pending
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
