(() => {
  const form = document.querySelector('#report-form');
  const description = document.querySelector('#edition-description');
  if (!form) return;

  form.classList.add('form-shell');
  const guide = document.createElement('div');
  guide.className = 'form-guide';
  guide.innerHTML = '<div class="guide-icon" aria-hidden="true">✦</div><div><strong id="guide-title">Your personal profile</strong><p id="guide-copy">Enter the main details once. Extra fields will appear only when your selected edition needs them.</p></div>';
  form.parentNode.insertBefore(guide, form);

  const content = {
    classic: ['Your personal profile', 'Enter your name and birth date. This edition only needs the basic personal details.','✦'],
    cosmic: ['Your celestial profile', 'Enter the basic birth details. The report will use a cosmic visual theme and symbolic narrative.','☾'],
    story: ['Build a birthday story', 'Enter the birthday details that will guide the narrative-focused keepsake.','❧'],
    couples: ['Create two connected profiles', 'Enter the first person above, then complete the clearly marked second-profile section.','♡'],
    family: ['Create a family keepsake', 'Enter the first family member above, then add the remaining members in the green family section.','♧'],
    gift: ['Prepare a birthday gift', 'Enter the recipient first. Then add the sender and personal message in the pink gift section.','🎁']
  };

  function refresh() {
    const edition = document.querySelector('#selectedEdition')?.value || 'classic';
    const item = content[edition] || content.classic;
    form.dataset.edition = edition;
    guide.querySelector('#guide-title').textContent = item[0];
    guide.querySelector('#guide-copy').textContent = item[1];
    guide.querySelector('.guide-icon').textContent = item[2];
    if (description) description.textContent = item[1];
  }

  document.querySelectorAll('.edition-card').forEach(card => card.addEventListener('click', () => {
    window.setTimeout(refresh, 0);
  }));
  refresh();
})();
