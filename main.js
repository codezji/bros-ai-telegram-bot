/**
 * main.js
 * Wires user events to analysis and UI rendering.
 */
(() => {
  const messageInput = document.getElementById('messageInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const sampleButtons = document.querySelectorAll('.sample-btn');

  const sampleMessages = {
    safe: 'We watched a movie about a bomb disposal team yesterday. The story was intense but purely fictional.',
    suspicious: 'Let\'s meet tonight near the office. Bring the tools and keep this plan quiet for now.',
    critical: 'We are going to attack the station tomorrow at 9. Bring the gun and make sure nobody knows.'
  };

  let debounceTimer = null;

  function runAnalysis() {
    const text = messageInput.value.trim();
    UIController.setProcessingState(true);

    window.setTimeout(() => {
      const result = ThreatAnalysisEngine.analyze(text);
      UIController.renderResult(result, text);
      UIController.setProcessingState(false);
    }, 1000);
  }

  function handleRealtimeInput() {
    window.clearTimeout(debounceTimer);

    debounceTimer = window.setTimeout(() => {
      if (messageInput.value.trim().length < 10) return;
      runAnalysis();
    }, 500);
  }

  analyzeBtn.addEventListener('click', runAnalysis);
  messageInput.addEventListener('input', handleRealtimeInput);

  sampleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sampleKey = button.getAttribute('data-sample');
      messageInput.value = sampleMessages[sampleKey] || '';
      runAnalysis();
    });
  });
})();
