# uni-prep-mistral

Site static de studiu + examen simulat pentru **Electronică Medicală (UMFST)**, servit prin GitHub Pages. Fără framework, fără pas de build.

- `index.html` — pagina principală: lista de cursuri + intrarea în examenul simulat
- `curs-1.html` … `curs-5.html` — conspecte de studiu per curs (capitolele păstrate din slide-urile de la curs)
- `exam.html` + `assets/exam.js` — motorul examenului simulat
- `data/questions.json` — banca de întrebări

## Formatul examenului simulat (grilă UMFST / UNIX)

- 24 de întrebări extrase aleator per examen, cronometru de 60 de minute cu auto-trimitere.
- Fiecare întrebare din `data/questions.json` are exact **5 răspunsuri corecte și 5 greșite**. Motorul alege **5 variante aleator** per întrebare, impunând **cel puțin o variantă corectă** (toate cele 5 corecte este permis, toate cele 5 greșite este imposibil) — aceeași regulă ca pe platforma de examen UNIX.
- **Penalizare negativă**: fiecare întrebare valorează `10/24` puncte; fiecare variantă afișată valorează `1/5` din asta. Bifarea unei variante corecte adaugă, bifarea uneia greșite scade (`penaltyFactor` din config), scorul pe întrebare fiind limitat inferior la 0. Totalul se notează din 10, prag de promovare 5.

## Editare

- Adăugare întrebări: se adaugă în `data/questions.json` — păstrați exact câte 5 intrări în `correct` și 5 în `wrong`.
- Reglaj: editați blocul `config` de la începutul lui `data/questions.json` (număr de întrebări, variante per întrebare, limită de timp, factor de penalizare).

## Rulare locală

Orice server static funcționează, ex. `python3 -m http.server` în acest director.
