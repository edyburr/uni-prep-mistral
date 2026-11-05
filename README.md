# uni-prep-mistral

Static study + mock-exam site for **Electronică Medicală (UMFST)**, served via GitHub Pages. No framework, no build step.

- `index.html` — home: course list + mock exam entry
- `curs-1.html` … `curs-5.html` — study notes per course (chapters preserved from the lecture slides)
- `exam.html` + `assets/exam.js` — mock exam engine
- `data/questions.json` — question bank

## Mock exam format (UMFST / UNIX grilă)

- 24 questions drawn at random per exam, 60-minute timer with auto-submit.
- Each question in `data/questions.json` has exactly **5 correct and 5 wrong answers**. The engine picks **5 options at random** per question, enforcing **at least one correct option** (all five correct is allowed, all five wrong is impossible) — same rule as the UNIX exam platform.
- **Negative marking**: each question is worth `10/24` points; every displayed option is worth `1/5` of that. Ticking a correct option adds, ticking a wrong option subtracts (`penaltyFactor` in the config), per-question score floored at 0. Total graded out of 10, pass mark 5.

## Editing

- Add questions: append to `data/questions.json` — keep exactly 5 entries in `correct` and 5 in `wrong`.
- Tuning: edit the `config` block at the top of `data/questions.json` (number of questions, options per question, time limit, penalty factor).

## Local run

Any static server works, e.g. `python3 -m http.server` in this directory.
