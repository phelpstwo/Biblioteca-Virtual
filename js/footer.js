(() => {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const feedback = document.getElementById('newsletter-feedback');

  if (!form || !emailInput || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      feedback.textContent = 'Por favor, informe um e-mail válido.';
      return;
    }
    feedback.textContent = `Inscrição confirmada para ${email}.`;
    emailInput.value = '';
  });
})();
