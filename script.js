(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menuButton.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Ouvrir le menu'); menuButton.textContent = '☰';
    }));
  }
  const jobSelect = document.getElementById('jobSelect');
  document.querySelectorAll('[data-job]').forEach(link => link.addEventListener('click', () => {
    if (jobSelect) jobSelect.value = link.dataset.job || '';
  }));
  const form = document.getElementById('applicationForm');
  const result = document.getElementById('formResult');
  if (form && result) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      result.className = 'form-result';
      if (!form.reportValidity()) {
        result.classList.add('error');
        result.textContent = 'Veuillez vérifier les champs obligatoires.';
        return;
      }
      const data = new FormData(form);
      const motivation = String(data.get('motivation') || '').trim();
      if (motivation.length < 20) {
        result.classList.add('error');
        result.textContent = 'Votre motivation doit contenir au moins 20 caractères.';
        return;
      }
      result.classList.add('success');
      result.textContent = 'Votre formulaire est valide. Cette version de démonstration ne transmet pas encore votre candidature. Connectez un serveur ou un bot Discord pour activer la réception.';
    });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
