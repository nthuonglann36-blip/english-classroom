# Self-study · Grades 10 and 11

Offline support is available through `../offline.html`. Save the Self-study
package to keep all local activities and pronunciation audio on this device.
YouTube, Wordwall and ChatGPT still require Internet. Before publishing any
public content changes, run `python tools/build-offline-manifest.py`; see
[`OFFLINE.md`](../OFFLINE.md) for the package/update workflow.

## Personal Dong Ho print studio

The teacher chose five layers: Vocabulary / Wordwall (yellow), Pronunciation
(pink), Grammar (green), Listening (indigo), and Writing (final black ink).
Grade 10 Units 1–2 reuse the existing Lợn đàn and Cây đa bến nước SVGs; Grade 11
Units 1–2 reuse Đào tiên – rùa and Gà đàn. Unit 3 adds Hoà ca (Grade 10) and
Thành phố xanh (Grade 11), two original AI-generated illustrations inspired by
Vietnamese folk-print imagery. They are contemporary illustrations, not copies
of historical Dong Ho prints. Each skill adds its own complete
colour layer. Writing can be recorded first, but black ink and the red seal
appear only after all five skills are complete. Resetting or retrying a quiz
does not remove an earned layer. No classroom game files are changed.

`journey-content.js` holds the original artwork and exact published activity
IDs. `journey-store.js` keeps progress in `ec:self-study:journey:v1` in the
current browser's localStorage, isolated by grade, unit, skill and activity.
It does not send student data to any server. Existing writing draft keys are
unchanged. If storage is blocked or full, progress remains in memory for the
current visit and the interface explains that it is not saved. Other browsers,
devices, private sessions or cleared site storage do not share this progress.

Completion rules are visible in the studio:

- Grammar / Listening: answer every question and submit each activity for
  feedback. A colour rewards completing the practice, without a score cutoff.
- Pronunciation: check all quiz questions and explicitly confirm listening and
  speaking practice before finishing.
- Writing: save a distinct revised draft within the task's existing word limit,
  review all checklist items and choose Finish my writing. This is learner
  confirmation, not a claim that ChatGPT has graded or verified the writing.
- Wordwall: open the original link, return and explicitly confirm completion.
  Opening a link alone never completes an activity. Wordwall does not return
  scores or completion events to this website.

Only visible, focused local practice pages add study time. The gallery and
external Wordwall / ChatGPT tabs do not count. A short localStorage lease
prevents multiple tabs from counting the same time twice; visibility, focus
and page lifecycle events flush the current interval. Long suspended intervals
and clock jumps do not add idle time. Time is split at local midnight. A day
qualifies at 300,000 milliseconds; the weekly strip runs Monday–Sunday using
the device's local date. Before today's five-minute target is reached, the
streak can continue through yesterday; a missed completed day breaks it.

`journey-practice.js` adds completion hooks after the existing exercise scripts.
It never changes the original questions, answer keys or marking. Units 1–3
keep their existing routes and content. Grade 10 Unit 3 has no published
Vocabulary / Wordwall activity yet: its yellow layer is explicitly unavailable,
the other four skills remain accessible, and the final ink/seal waits for all
five skills. It is never counted complete just because no vocabulary activity
exists. Units 4–10 have muted “Chưa mở” frames because their
Self-study activities are not yet available. The teacher chose personal
progress first, so the class market and shared participation counts are
deferred. No sample classroom totals are presented as real data.

### Unit 3 artwork

The original generated PNGs were copied to WebP files under `assets/prints/`
for delivery (about 550 KiB total). `journey-art.js` renders the source colours
as four independent pigment layers plus ink on the learner's device. It keeps
the source files unchanged, uses only local assets, and caches the rendered
layers in memory. The completed rendering reconstructs the source artwork;
initial ink appears as a faint guide. Writing reveals the final ink, and the
same completion rule adds the red seal. Reduced-motion settings are respected.
“View finished artwork” opens the full-colour source without awarding progress.
The offline manifest includes both sources and the renderer. The four earlier
SVG prints and all saved progress keys/activity IDs remain unchanged.

## Approved Grammar practice

The teacher approved Grammar publication in chat. `grammar.html?grade=10&unit=1` (Grades 10 and
11, Units 1–3). Each unit contains three short rules and 18 new questions:
six multiple-choice, six completion and six correction questions. All 108
sentences relate to their unit topic; feedback explains the answer in Vietnamese.
The worksheets check each activity independently and accept listed contractions
and British/American spelling variants. Changing an answer clears stale feedback;
reset clears only that activity. No account or AI service is needed.

Focus: Grade 10—present simple/continuous; will, be going to and passive voice;
compound sentences and to-/bare infinitives. Grade 11—past simple/present perfect;
must, have to and should; stative and linking verbs. Five Language lesson pages
were checked in this repository. Grade 10 Unit 3 has no Language page yet;
its compound-sentence and infinitive focus was included in the approved review.

## Existing published practice

Published content includes 28 teacher-supplied Wordwall URLs (17 Grade 10,
11 Grade 11) and two
pronunciation pages: `practice.html?unit=1&skill=pronunciation` and Unit 2.
Grade 11 Wordwall has five activities for Unit 1, four for Unit 2 and two for
Unit 3, preserving the exact URLs and supplied order within each unit. The two
descriptive URL slugs supply their display names; nine numeric-only URLs use
neutral numbered labels because Wordwall title retrieval is blocked. Do not
infer lesson names or activity formats for those links without confirmation.
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

Grade 10 Writing and supplementary Listening Units 1–3 have now been approved
for publication. `listening.html?grade=10&unit=1` (also Units 2 and 3) has five
transcript-based activities and 38 questions. Laundry uses the first teacher
Unit 1 URL (BlqJiujHqfI), consistent with the transcript supplied in response
to that source request. The teacher subsequently approved all Grade 10 parts;
source playback was not independently verified. The rejected BBC True/False
and the earlier synthetic listening passages remain excluded.

`skills.html?grade=10&unit=1&skill=writing` (also Units 2 and 3) has an email
about family routines, a general greener-life paragraph (not school-only), and
a blog about a real or imaginary music event. All three are 120–150 words.
Saved drafts are isolated by grade and unit; the same guided ChatGPT workflow
is used for both grades.

Grade 10 Pronunciation Unit 3 practises stress in two-syllable words with eight
listening items, model/repeat audio, and phoneme-checked synthetic American
English samples. New files are `audio/g10-u3-stress-*.mp3`. This synthetic
practice audio is labelled and is separate from authentic supplementary
Listening. Units 1–2 keep their existing 21 consonant-blend questions.
Old `practice.html` writing/listening/Unit 3 routes forward to the new pages.
All 17 original Grade 10 teacher-supplied Wordwall URLs remain unchanged.

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
