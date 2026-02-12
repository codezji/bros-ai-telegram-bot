/**
 * uiController.js
 * Handles DOM rendering and visualization of analysis output.
 */
const UIController = (() => {
  const history = [];

  const refs = {
    statusBadge: document.getElementById('statusBadge'),
    riskScoreText: document.getElementById('riskScoreText'),
    riskMeterFill: document.getElementById('riskMeterFill'),
    threatLevelText: document.getElementById('threatLevelText'),
    threatCategoryText: document.getElementById('threatCategoryText'),
    confidenceText: document.getElementById('confidenceText'),
    priorityBadge: document.getElementById('priorityBadge'),
    indicatorsList: document.getElementById('indicatorsList'),
    historyList: document.getElementById('historyList'),
    analysisState: document.getElementById('analysisState')
  };

  function getRiskColor(score) {
    if (score >= 75) return '#ff4b5c';
    if (score >= 40) return '#f7c948';
    return '#30d158';
  }

  function getPriorityMeta(score) {
    if (score >= 75) return { label: 'RED - HIGH RISK', className: 'priority-high', statusClass: 'status-danger' };
    if (score >= 40) return { label: 'YELLOW - SUSPICIOUS', className: 'priority-medium', statusClass: 'status-processing' };
    return { label: 'GREEN - SAFE', className: 'priority-safe', statusClass: 'status-safe' };
  }

  function renderIndicators(indicators) {
    refs.indicatorsList.innerHTML = '';

    if (!indicators.length) {
      refs.indicatorsList.innerHTML = '<li>No strong indicators found. Message appears safe.</li>';
      return;
    }

    indicators.slice(0, 12).forEach((item) => {
      const li = document.createElement('li');
      li.className = 'indicator-hit';
      li.innerHTML = `<span class="indicator-phrase">"${item.phrase}"</span> → ${item.reason} <em>(${item.layer})</em>`;
      refs.indicatorsList.appendChild(li);
    });
  }

  function renderHistory() {
    refs.historyList.innerHTML = '';

    if (!history.length) {
      refs.historyList.innerHTML = '<li>No scans performed yet.</li>';
      return;
    }

    history.forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `[${entry.time}] ${entry.category} | ${entry.score}/100 | ${entry.preview}`;
      refs.historyList.appendChild(li);
    });
  }

  function addToHistory(text, result) {
    const preview = text.length > 75 ? `${text.slice(0, 75)}...` : text;
    const time = new Date().toLocaleTimeString();
    history.unshift({ time, category: result.category, score: result.riskScore, preview });

    if (history.length > 8) {
      history.pop();
    }

    renderHistory();
  }

  function renderResult(result, sourceText) {
    refs.riskScoreText.textContent = `${result.riskScore} / 100`;
    refs.riskMeterFill.style.width = `${result.riskScore}%`;
    refs.riskMeterFill.style.backgroundColor = getRiskColor(result.riskScore);
    refs.threatLevelText.textContent = result.threatLevel;
    refs.threatCategoryText.textContent = result.category;
    refs.confidenceText.textContent = `${result.confidence}%`;

    const priority = getPriorityMeta(result.riskScore);
    refs.priorityBadge.textContent = priority.label;
    refs.priorityBadge.className = `priority-badge ${priority.className}`;

    refs.statusBadge.textContent = result.riskScore >= 40 ? 'THREAT MONITOR ALERT' : 'SYSTEM READY';
    refs.statusBadge.className = `status-badge ${priority.statusClass}`;

    refs.analysisState.textContent = `Layer scores → keyword: ${result.layers.keywordScore}, context: ${result.layers.contextScore}, behavior: ${result.layers.behaviorScore}`;

    renderIndicators(result.indicators);
    addToHistory(sourceText, result);
  }

  function setProcessingState(isProcessing) {
    if (isProcessing) {
      refs.analysisState.textContent = 'AI engine analyzing intent patterns...';
      refs.statusBadge.textContent = 'PROCESSING';
      refs.statusBadge.className = 'status-badge status-processing';
      return;
    }
  }

  return {
    renderResult,
    setProcessingState
  };
})();
