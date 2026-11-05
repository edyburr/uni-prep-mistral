/* Motor de examen simulat în stil UMFST.
   Formatul băncii de întrebări (data/questions.json): fiecare întrebare are exact
   5 răspunsuri corecte și 5 greșite. Pentru fiecare întrebare se aleg 5 variante
   aleator cu constrângerea ca cel puțin una să fie corectă (toate 5 corecte este
   permis, toate 5 greșite nu) — la fel ca pe platforma UNIX.
   Notare: penalizare negativă, scor pe întrebare limitat inferior la 0, total scalat la 10. */
(function () {
  const startView = document.getElementById('startView');
  const examView = document.getElementById('examView');
  const resultView = document.getElementById('resultView');
  const examForm = document.getElementById('examForm');
  const examBar = document.getElementById('examBar');
  const timerEl = document.getElementById('timer');
  const qCountEl = document.getElementById('qCount');

  let CONFIG = null;
  let exam = null;
  let deadline = 0;
  let timerId = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOptions(q, cfg) {
    const pool = shuffle(
      q.correct.map(t => ({ text: t, ok: true }))
        .concat(q.wrong.map(t => ({ text: t, ok: false })))
    );
    const n = cfg.optionsPerQuestion;
    for (let attempt = 0; attempt < 200; attempt++) {
      const pick = shuffle(pool).slice(0, n);
      const correctCount = pick.filter(o => o.ok).length;
      if (correctCount >= cfg.minCorrectPerQuestion) return shuffle(pick);
    }
    const fallback = shuffle(q.correct.map(t => ({ text: t, ok: true }))).slice(0, n);
    return shuffle(fallback);
  }

  function buildExam(data) {
    CONFIG = data.config;
    const questions = shuffle(data.questions).slice(0, CONFIG.questionsPerExam);
    return questions.map(q => ({ source: q, options: pickOptions(q, CONFIG) }));
  }

  function renderExam() {
    examForm.innerHTML = '';
    exam.forEach((item, i) => {
      const box = document.createElement('div');
      box.className = 'q';
      box.id = 'q' + i;
      const head = document.createElement('div');
      head.className = 'qhead';
      head.innerHTML = '<span class="num">' + (i + 1) + '.</span>' + escapeHtml(item.source.question);
      box.appendChild(head);
      item.options.forEach((opt, j) => {
        const label = document.createElement('label');
        label.className = 'opt';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.name = 'q' + i;
        cb.value = j;
        label.appendChild(cb);
        label.appendChild(document.createTextNode(opt.text));
        box.appendChild(label);
      });
      examForm.appendChild(box);
    });
    qCountEl.textContent = exam.length;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function grade() {
    const perQ = 10 / exam.length;
    const optW = perQ / CONFIG.optionsPerQuestion;
    let total = 0;
    const review = [];
    exam.forEach((item, i) => {
      const picked = new Set(
        Array.from(examForm.querySelectorAll('input[name="q' + i + '"]:checked')).map(cb => Number(cb.value))
      );
      let correctMarked = 0, wrongMarked = 0;
      item.options.forEach((opt, j) => {
        if (!picked.has(j)) return;
        if (opt.ok) correctMarked++; else wrongMarked++;
      });
      let pts = (correctMarked - CONFIG.penaltyFactor * wrongMarked) * optW;
      pts = Math.max(0, pts);
      total += pts;
      review.push({ item, picked, correctMarked, wrongMarked, pts });
    });
    return { total: Math.round(total * 100) / 100, review, perQ };
  }

  function remark(grade) {
    if (grade >= 9) return 'Prea bine ca să fie adevărat. Ai tras cu ochiul la grilă?';
    if (grade >= 7) return 'Solid. Profu\' ar da din cap, cu reținere.';
    if (grade >= 5) return 'Ai trecut. La limită. Profu\' zâmbește.';
    if (grade >= 3) return 'Un eșec cu pași în plus.';
    return 'Grila a vorbit. Mai citește conspectul.';
  }

  function showResult() {
    clearInterval(timerId);
    examBar.hidden = true;
    examView.hidden = true;
    resultView.hidden = false;
    const { total, review } = grade();
    const pass = total >= CONFIG.passMark;
    const res = document.createElement('div');
    res.className = 'result';
    res.innerHTML =
      '<div class="grade ' + (pass ? 'pass' : 'fail') + '">' + total.toFixed(2) + ' / 10</div>' +
      '<div>' + (pass ? 'ADMIS' : 'RESPINS') + ' (prag de promovare ' + CONFIG.passMark + ')</div>' +
      '<div class="remark">' + remark(total) + '</div>' +
      '<p style="margin-top:20px"><button class="btn" id="againBtn">Examen nou aleator</button> ' +
      '<a class="btn secondary" href="index.html">Studiu</a></p>';
    resultView.appendChild(res);

    review.forEach((r, i) => {
      const box = document.getElementById('q' + i);
      if (!box) return;
      const full = r.correctMarked === r.item.options.filter(o => o.ok).length && r.wrongMarked === 0;
      box.classList.add(full ? 'correct' : 'wrong');
      Array.from(box.querySelectorAll('label.opt')).forEach((label, j) => {
        const opt = r.item.options[j];
        label.style.opacity = opt.ok ? '1' : '0.55';
        if (opt.ok) label.style.background = 'var(--accent-soft)';
        if (!opt.ok && r.picked.has(j)) label.style.background = '#fdecec';
        label.querySelector('input').disabled = true;
      });
      const v = document.createElement('div');
      v.className = 'verdict ' + (full ? 'ok' : 'no');
      v.textContent = (full ? 'Corect' : 'Greșit') + ' — ' + r.pts.toFixed(2) + ' pct' +
        (r.wrongMarked ? ' (' + r.wrongMarked + ' bifate greșit, −' + (r.wrongMarked * (10 / exam.length / CONFIG.optionsPerQuestion)).toFixed(2) + ')' : '');
      box.appendChild(v);
    });
    resultView.appendChild(examForm);
    examView.hidden = true;
    document.getElementById('againBtn').addEventListener('click', () => location.reload());
    window.scrollTo(0, 0);
  }

  function tick() {
    const left = Math.max(0, deadline - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    timerEl.classList.toggle('low', left <= 5 * 60000);
    if (left <= 0) showResult();
  }

  document.getElementById('startBtn').addEventListener('click', async () => {
    const res = await fetch('data/questions.json');
    const data = await res.json();
    exam = buildExam(data);
    renderExam();
    startView.hidden = true;
    examView.hidden = false;
    examBar.hidden = false;
    deadline = Date.now() + CONFIG.timeMinutes * 60000;
    tick();
    timerId = setInterval(tick, 1000);
  });

  document.getElementById('submitBtn').addEventListener('click', showResult);
})();
