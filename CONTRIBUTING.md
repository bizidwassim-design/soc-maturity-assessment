# Contributing

Thanks for helping improve this tool. Welcome contributions: clearer questions, better level wording,
more useful next steps, translations of the question bank, accessibility fixes, and documentation.

## Ground rules

* **Fictional data only.** Sample assessments use fictional organisations (Northwind Logistics, Contoso,
  Fabrikam). Never commit a real assessment, real people, hostnames or internal details.
* **Original content.** Reference standards by name and clause (ISO/IEC 27001, NIST CSF, CIS Controls,
  MITRE ATT&CK); never paste their text.
* **No build step, no dependencies, no network.** The app must keep working when opened as a local file
  with the Content-Security-Policy in `index.html` unchanged: no external scripts, styles, fonts or fetches.
* Be kind — see the [Code of Conduct](CODE_OF_CONDUCT.md).

## Where things live

| Path | Change it when |
|------|----------------|
| `data/questions.js` | You add, reword or re-level a question. This is the single source of truth. |
| `data/sample.js` | You change the fictional sample answers. |
| `data/questions.csv`, `examples/northwind-sample.json` | Never by hand: run `node scripts/build_data.js`. |
| `assets/app.js`, `assets/style.css`, `index.html` | Behaviour, styling, markup. |
| `docs/` | Level definitions and roadmap guidance. Keep them consistent with the question bank. |

## Making a change

1. Fork and branch (`fix/gov-03-wording`, `feat/french-question-bank`).
2. Edit the source files.
3. Run the checks that CI runs:

   ```bash
   node --check assets/app.js data/questions.js data/sample.js scripts/*.js
   node scripts/check_questions.js
   node scripts/build_data.js && git diff --exit-code -- data/questions.csv examples/
   npx --yes html-validate@8 index.html
   ```

4. Open `index.html` in a browser, load the sample, answer a few questions, export and re-import the JSON.
5. Commit the source **and** the regenerated files, then open a pull request describing what changed and why.

## Style notes

* Question ids are `DOM-NN` (`GOV`, `PPL`, `PRC`, `DET`, `IR`, `TEC`). Renumbering breaks old exports — append instead.
* Each question keeps exactly 5 level texts and 4 next steps. The next step for level *n* must move the
  question to level *n + 1*, not to level 4.
* Level texts describe observable facts ("a procedure exists and is used"), not feelings ("the team is confident").
* British English in prose; keep sentences short.

## Licensing of contributions

By contributing you agree that your work is released under the repository's [MIT License](LICENSE).
