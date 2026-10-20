# Grade 10 self-study

`index.html` keeps the teacher's 17 original Wordwall URLs and links to six
skills pages. `practice.html?unit=1&skill=listening` selects a unit and skill;
supported units are 1 and 2, and skills are listening, pronunciation and writing.
Invalid parameters fall back to Unit 1 listening. No build step is needed.

## Content

Edit the passages, answers, explanations, sound groups and writing tasks in
`practice-content.js`. This is original supplementary material based on the
themes and consonant blends taught in Global Success 10; it is not a textbook
transcript. There are four listening passages with eight questions each,
21 pronunciation questions and 12 writing preparation questions, plus four
extended writing tasks. Model texts are examples, not automatic corrections.

Audio lives in `audio/`. The recordings are computer-generated American English
using Piper and the LibriTTS high voice, speaker 0, length scale 1.65. The voice
model is not distributed in this repository. Source model:
https://github.com/rhasspy/piper/releases/tag/v0.0.2
(voice-en-us-libritts-high.tar.gz). Its model card credits the LibriTTS dataset,
https://www.openslr.org/60/, licensed under CC BY 4.0:
https://creativecommons.org/licenses/by/4.0/. New scripts were synthesised and
converted to mono MP3 with normalised volume; the dataset recordings are not
copied into this website. Replace the MP3 and matching transcript together when
editing a passage. Keep filenames stable or update the corresponding content.

## Writing and ChatGPT

Writing uses the teacher-selected external ChatGPT workflow. The copy button
copies the student's first draft and task-specific feedback instructions.
Students open https://chatgpt.com/ separately and paste/send the text themselves.
No draft is put in a URL, sent automatically, or graded by a simulated AI.
The copy instructions request Vietnamese explanations and student-led revision.
Clipboard access failure reveals a selectable manual-copy field.

First and revised drafts are saved in localStorage separately for each unit and
task. The page explains that drafts stay in the current browser and offers a
clear action with confirmation. Storage failures leave editing and copying
available. No account, server, API key or submission database is used here.

## Check changes

Serve the repository root with `python -m http.server 8000`, then open
`http://localhost:8000/self-study/`. Check all six skill links, correct and
incorrect quiz answers, reset, audio playback, mobile wrapping, draft persistence,
copying and manual-copy fallback. Syntax checks:

    node --check self-study/practice.js
    node --check self-study/practice-content.js

Use a local server or HTTPS for clipboard access. GitHub Pages uses HTTPS.
