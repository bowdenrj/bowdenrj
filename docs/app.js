/* Evidence Paths: static website, no dependencies, no analytics or user tracking. */
(async function () {
  'use strict';
  const main = document.getElementById('investigation');
  const routeEl = document.getElementById('route');
  const progressLabel = document.getElementById('progress-label');
  const progressTrack = document.querySelector('.progress-track');
  const progressFill = document.getElementById('progress-fill');
  const resetButton = document.getElementById('reset');
  let caseFile, clues, byId;
  let steps = []; // [{id, choiceIndex}]; the last entry is the current unanswered clue.
  let started = false;
  let revealed = false;

  const element = (tag, className, content) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  };
  function appendText(parent, tag, className, content) {
    const item = element(tag, className, content);
    parent.append(item);
    return item;
  }
  function addButton(parent, label, className, handler) {
    const button = element('button', `button ${className || ''}`, label);
    button.type = 'button';
    button.addEventListener('click', handler);
    parent.append(button);
    return button;
  }
  function clear() { main.replaceChildren(); }
  function scrollToCase() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      main.scrollIntoView({ block: 'start' });
    } else {
      main.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }
  function chosenSteps() { return steps.filter(s => Number.isInteger(s.choiceIndex)); }
  function updateRoute() {
    const completed = chosenSteps();
    const n = completed.length;
    progressLabel.textContent = !started ? 'Not started' : revealed ? 'Completed' : `${n} of ${caseFile.totalSteps} choices`;
    progressTrack.setAttribute('aria-valuemax', String(caseFile.totalSteps));
    progressTrack.setAttribute('aria-valuenow', String(n));
    progressFill.style.width = `${100 * n / caseFile.totalSteps}%`;
    routeEl.replaceChildren();
    if (!started) {
      appendText(routeEl, 'li', 'route-empty', 'Your decisions will appear here as you go.');
      return;
    }
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const clue = byId[s.id];
      const li = element('li', Number.isInteger(s.choiceIndex) ? 'complete' : 'active');
      const btn = element('button');
      btn.type = 'button';
      appendText(btn, 'span', 'route-label', `EVIDENCE ${clue.number}`);
      appendText(btn, 'strong', '', clue.title);
      if (Number.isInteger(s.choiceIndex)) {
        appendText(btn, 'span', 'route-decision', clue.choices[s.choiceIndex].label);
      } else {
        appendText(btn, 'span', 'route-decision', revealed ? 'Investigation complete' : 'Considering…');
      }
      btn.addEventListener('click', () => goBackTo(i));
      li.append(btn);
      routeEl.append(li);
    }
  }
  function restart() {
    steps = [];
    started = false;
    revealed = false;
    render();
    scrollToCase();
  }
  function start() {
    started = true;
    steps = [{ id: caseFile.start, choiceIndex: null }];
    revealed = false;
    render();
    scrollToCase();
  }
  function goBackTo(index) {
    if (!started || index < 0 || index >= steps.length) return;
    steps = steps.slice(0, index + 1);
    steps[index].choiceIndex = null;
    revealed = false;
    render();
    scrollToCase();
  }
  function choose(index) {
    const active = steps[steps.length - 1];
    const clue = byId[active.id];
    const choice = clue?.choices[index];
    if (!choice || revealed || Number.isInteger(active.choiceIndex)) return;
    active.choiceIndex = index;
    if (choice.next) {
      steps.push({ id: choice.next, choiceIndex: null });
    } else {
      revealed = true;
    }
    render();
    scrollToCase();
  }
  function renderIntro() {
    appendText(main, 'div', 'scene-label', 'BEFORE THE FIRST CLUE');
    appendText(main, 'div', 'intro-mark', '◇');
    appendText(main, 'h2', 'intro-title', caseFile.title);
    appendText(main, 'p', 'intro-p', caseFile.setup);
    appendText(main, 'p', 'intro-detail', caseFile.instruction);
    const row = element('div', 'main-actions');
    addButton(row, 'Begin the investigation  →', 'primary-button', start);
    main.append(row);
  }
  function renderClue() {
    const active = steps[steps.length - 1];
    const clue = byId[active.id];
    const label = element('div', 'scene-label');
    appendText(label, 'span', '', `CLUE ${clue.number} / ${String(caseFile.totalSteps).padStart(2, '0')}`);
    appendText(label, 'em', '', clue.kind);
    main.append(label);
    const visual = element('div', 'case-visual');
    visual.setAttribute('aria-hidden', 'true');
    appendText(visual, 'span', 'symbol', '⌁');
    appendText(visual, 'span', 'visual-id', `Archive · ${clue.number}`);
    main.append(visual);
    appendText(main, 'div', 'eyebrow', 'WHAT WE KNOW');
    appendText(main, 'h2', 'clue-heading', clue.title);
    appendText(main, 'p', 'observation', clue.observation);
    appendText(main, 'p', 'context', `Additional context: ${clue.context}`);
    appendText(main, 'h3', 'prompt-title', 'How do you interpret this?');
    appendText(main, 'p', 'prompt-description', 'Neither option is a confirmed fact. Select one to continue.');
    const stack = element('div', 'choice-stack');
    clue.choices.forEach((option, index) => {
      const button = element('button', 'choice');
      button.type = 'button';
      appendText(button, 'span', 'choice-icon', String.fromCharCode(65 + index));
      appendText(button, 'span', 'choice-text', option.label);
      appendText(button, 'span', 'choice-arrow', '→');
      button.setAttribute('aria-label', `Interpretation ${index + 1}: ${option.label}`);
      button.addEventListener('click', () => choose(index));
      stack.append(button);
    });
    main.append(stack);
    const actions = element('div', 'main-actions');
    if (steps.length > 1) addButton(actions, '← Previous clue', 'back-button', () => goBackTo(steps.length - 2));
    main.append(actions);
  }
  function renderConclusion() {
    const history = chosenSteps();
    const scores = { a: 0, b: 0 };
    for (const step of history) scores[byId[step.id].choices[step.choiceIndex].leans] += 1;
    // Five choices means no tied result. If you change totalSteps to an even number,
    // add a suitable tie policy before publishing your own case.
    const outcome = scores.a > scores.b ? caseFile.outcomes.a : caseFile.outcomes.b;
    appendText(main, 'div', 'reveal-tag', '✦  THE REVEAL');
    appendText(main, 'div', 'scene-divider');
    appendText(main, 'p', 'eyebrow', outcome.eyebrow);
    appendText(main, 'h2', 'reveal-title', outcome.title);
    appendText(main, 'p', 'reveal-blurb', outcome.description);
    const recap = element('section', 'recap');
    appendText(recap, 'h3', '', 'How you reached this explanation');
    const list = element('ol');
    for (const step of history) {
      const item = element('li');
      appendText(item, 'strong', '', byId[step.id].title);
      appendText(item, 'span', '', byId[step.id].choices[step.choiceIndex].meaning);
      list.append(item);
    }
    recap.append(list);
    main.append(recap);
    const verify = element('div', 'result-row');
    appendText(verify, 'strong', '', 'What would test this explanation?');
    appendText(verify, 'p', '', outcome.verify);
    main.append(verify);
    appendText(main, 'p', 'outcome-disclaimer', outcome.caution + ' Your selections shaped the narrative; they did not create new evidence. Other interpretations remain possible.');
    const actions = element('div', 'main-actions');
    addButton(actions, 'Try a different route  ↻', 'primary-button', restart);
    addButton(actions, '← Change final choice', 'back-button', () => goBackTo(steps.length - 1));
    main.append(actions);
  }
  function render() {
    clear();
    if (!started) renderIntro();
    else if (revealed) renderConclusion();
    else renderClue();
    updateRoute();
  }
  function validate(data) {
    if (!data?.case?.start || !Array.isArray(data.clues)) throw Error('Missing case or clues');
    const lookup = new Map(data.clues.map(clue => [clue.id, clue]));
    if (!lookup.has(data.case.start)) throw Error('Start clue not found');
    for (const clue of data.clues) {
      if (!Array.isArray(clue.choices) || clue.choices.length < 2) throw Error(`Clue ${clue.id} needs choices`);
      for (const choice of clue.choices) {
        if (choice.next && !lookup.has(choice.next)) throw Error(`Unknown linked clue: ${choice.next}`);
        if (!['a', 'b'].includes(choice.leans)) throw Error(`Invalid outcome for ${clue.id}`);
      }
    }
  }
  resetButton.addEventListener('click', restart);
  try {
    const response = await fetch('./evidence.json');
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const payload = await response.json();
    validate(payload);
    caseFile = payload.case;
    clues = payload.clues;
    byId = Object.fromEntries(clues.map(clue => [clue.id, clue]));
    render();
  } catch (error) {
    clear();
    appendText(main, 'h2', '', 'Case file unavailable');
    appendText(main, 'p', 'error', 'Could not load evidence.json. Upload all four website files together and open them through your web host (or use a local web server).');
    console.error(error);
  }
})();
