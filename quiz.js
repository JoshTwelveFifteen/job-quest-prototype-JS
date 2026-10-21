/* One quiz question per page. Each question page sets data-q on <body> (0-based). */
(function () {
  JQ.chrome('index.html');
  const Q = JQ.QUESTIONS, step = +document.body.dataset.q, q = Q[step];
  const ans = Object.assign({}, JQ.store.get('jq-draft', null) || JQ.answers() || {});
  const prev = step === 0 ? 'index.html' : `question-${step}.html`;
  const next = step === Q.length - 1 ? 'results.html' : `question-${step + 2}.html`;
  const root = document.getElementById('quiz-root');
  document.title = `${q.q} – Job Quest`;

  function render(error) {
    root.innerHTML =
      `<a href="${prev}" class="back">Back</a>` +
      `<form id="quiz" novalidate style="margin-top:20px"><div class="${error ? 'error-group' : ''}"><fieldset${q.hint ? ` aria-describedby="hint-${q.id}"` : ''}>` +
      `<p class="muted" style="margin:0 0 5px">Question ${step + 1} of ${Q.length}</p>` +
      `<legend><h1>${q.q}</h1></legend>` +
      (q.hint ? `<p class="hint" id="hint-${q.id}">${q.hint}</p>` : '') +
      (error ? `<p class="error-msg"><span class="visually-hidden">Error: </span>Select an answer</p>` : '') +
      `<div class="radios">` + q.options.map(([v, t], i) =>
        `<div class="radio"><input type="radio" id="${q.id}-${i}" name="${q.id}" value="${v}"${ans[q.id] === v ? ' checked' : ''}><label for="${q.id}-${i}">${t}</label></div>`).join('') +
      `</div></fieldset></div>` +
      `<button class="btn" type="submit">${step === Q.length - 1 ? 'See my results' : 'Continue'}</button></form>`;
    document.getElementById('quiz').addEventListener('submit', e => {
      e.preventDefault();
      const picked = e.target.querySelector(`input[name="${q.id}"]:checked`);
      if (!picked) { render(true); root.querySelector('input').focus(); return; }
      ans[q.id] = picked.value;
      JQ.store.set('jq-draft', ans);
      if (step === Q.length - 1) JQ.store.set('jq-answers', ans);
      location.href = next;
    });
  }
  render(false);
})();
