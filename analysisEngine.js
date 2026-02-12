/**
 * analysisEngine.js
 * Rule-based + ML-simulation threat analysis engine.
 * Multi-layer scoring:
 * 1) weighted signal detection
 * 2) context awareness
 * 3) behavioral indicators
 * 4) aggregated risk + category classification
 */
const ThreatAnalysisEngine = (() => {
  const keywordSignals = [
    { pattern: /\bkill|shoot|stab|murder\b/gi, weight: 18, type: 'Violence verb' },
    { pattern: /\bbomb|explode|detonate|blast\b/gi, weight: 24, type: 'Explosive reference' },
    { pattern: /\bweapon|gun|rifle|knife|pistol\b/gi, weight: 20, type: 'Weapon reference' },
    { pattern: /\bkidnap|hostage|abduct\b/gi, weight: 20, type: 'Abduction indicator' },
    { pattern: /\bhack|breach|phish|ransomware|malware\b/gi, weight: 16, type: 'Cyber attack indicator' },
    { pattern: /\bpoison|toxic|chemical\b/gi, weight: 14, type: 'Harmful substance' },
    { pattern: /\bbreak\s?in|rob|steal|smuggle\b/gi, weight: 12, type: 'Illegal activity reference' }
  ];

  const planningPatterns = [
    /\bi\s+will\b/gi,
    /\bwe\s+are\s+going\s+to\b/gi,
    /\bgoing\s+to\b/gi,
    /\bplan\s+to\b/gi,
    /\btomorrow|tonight|next\s+week|at\s+\d{1,2}(:\d{2})?\b/gi
  ];

  const targetPatterns = [
    /\bschool|station|airport|hospital|mall|office|embassy\b/gi,
    /\bpolice|security|guards|civilians|crowd\b/gi,
    /\bmy\s+boss|that\s+guy|target\b/gi
  ];

  const instructionPatterns = [
    /\bbring|plant|hide|execute|enter|open|take\s+out\b/gi,
    /\bmake\s+sure|step\s+1|step\s+2|instructions\b/gi
  ];

  const secrecyPatterns = [/\bsecret|don't tell|nobody knows|quiet\b/gi, /\bencrypted|burn after reading\b/gi];
  const urgencyPatterns = [/\bnow|urgent|asap|immediately|right away\b/gi, /\bno time|hurry\b/gi];
  const coordinationPatterns = [/\bmeet|coordinate|sync|team|crew\b/gi, /\bconfirm|ready\?|execute\b/gi];

  const safeContextPatterns = [
    /\bmovie|game|series|fiction|news\b/gi,
    /\battack on titan\b/gi,
    /\bscript|story|novel|roleplay\b/gi
  ];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function collectMatches(text, pattern, baseReason, weightPerHit) {
    const matches = text.match(pattern) || [];
    return matches.map((hit) => ({ phrase: hit, reason: baseReason, weight: weightPerHit }));
  }

  function scoreKeywordSignals(text) {
    let score = 0;
    const indicators = [];

    keywordSignals.forEach((signal) => {
      const matches = text.match(signal.pattern) || [];
      if (!matches.length) return;

      matches.forEach((hit) => {
        score += signal.weight;
        indicators.push({
          phrase: hit,
          reason: `${signal.type} detected`,
          weight: signal.weight,
          layer: 'Keyword Signals'
        });
      });
    });

    return { score: clamp(score, 0, 55), indicators };
  }

  function scoreContext(text, keywordDetected) {
    let score = 0;
    const indicators = [];

    planningPatterns.forEach((pattern) => {
      indicators.push(
        ...collectMatches(text, pattern, 'Planning or future intent indicator', 8).map((item) => ({ ...item, layer: 'Context Analysis' }))
      );
    });
    targetPatterns.forEach((pattern) => {
      indicators.push(
        ...collectMatches(text, pattern, 'Potential target/location mention', 10).map((item) => ({ ...item, layer: 'Context Analysis' }))
      );
    });
    instructionPatterns.forEach((pattern) => {
      indicators.push(
        ...collectMatches(text, pattern, 'Instructional or action-oriented language', 9).map((item) => ({ ...item, layer: 'Context Analysis' }))
      );
    });

    indicators.forEach((item) => {
      score += item.weight;
    });

    if (!keywordDetected && indicators.length > 0) {
      score *= 0.6;
    }

    return { score: clamp(score, 0, 30), indicators };
  }

  function scoreBehavior(text) {
    const indicators = [];

    secrecyPatterns.forEach((pattern) => {
      indicators.push(...collectMatches(text, pattern, 'Secrecy behavior signal', 7).map((item) => ({ ...item, layer: 'Behavioral Indicators' })));
    });
    urgencyPatterns.forEach((pattern) => {
      indicators.push(...collectMatches(text, pattern, 'Urgency pressure signal', 6).map((item) => ({ ...item, layer: 'Behavioral Indicators' })));
    });
    coordinationPatterns.forEach((pattern) => {
      indicators.push(...collectMatches(text, pattern, 'Coordination behavior signal', 7).map((item) => ({ ...item, layer: 'Behavioral Indicators' })));
    });

    const score = clamp(indicators.reduce((sum, i) => sum + i.weight, 0), 0, 20);
    return { score, indicators };
  }

  function applySafetyOffsets(text, currentScore) {
    const safeHits = [];

    safeContextPatterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      safeHits.push(...matches);
    });

    if (safeHits.length === 0) {
      return { adjustedScore: currentScore, safeHits };
    }

    const reduction = clamp(safeHits.length * 8, 0, 25);
    return {
      adjustedScore: clamp(currentScore - reduction, 0, 100),
      safeHits
    };
  }

  function classifyCategory(score, indicators) {
    const reasons = indicators.map((i) => i.reason.toLowerCase());
    const phrases = indicators.map((i) => i.phrase.toLowerCase());

    if (score < 20) return { category: 'Safe', threatLevel: 'LOW' };
    if (phrases.some((p) => /bomb|detonate|blast/.test(p)) && score >= 55) {
      return { category: 'Terror Related', threatLevel: score >= 80 ? 'CRITICAL' : 'HIGH' };
    }
    if (phrases.some((p) => /hack|phish|ransomware|breach/.test(p)) && score >= 45) {
      return { category: 'Illegal Activity', threatLevel: score >= 70 ? 'HIGH' : 'MEDIUM' };
    }
    if (phrases.some((p) => /kill|shoot|weapon|knife|gun|stab/.test(p)) && score >= 45) {
      return { category: 'Violent Intent', threatLevel: score >= 75 ? 'HIGH' : 'MEDIUM' };
    }
    if (reasons.some((r) => r.includes('urgency')) && score >= 40) {
      return { category: 'Emergency Warning', threatLevel: score >= 70 ? 'HIGH' : 'MEDIUM' };
    }
    return { category: 'Suspicious', threatLevel: score >= 65 ? 'HIGH' : 'MEDIUM' };
  }

  function calculateConfidence(score, indicatorsCount) {
    const confidence = clamp(Math.round(score * 0.65 + indicatorsCount * 2.4), 15, 99);
    return confidence;
  }

  function analyze(rawText) {
    const text = (rawText || '').trim();
    if (!text) {
      return {
        riskScore: 0,
        category: 'Safe',
        threatLevel: 'LOW',
        confidence: 0,
        indicators: []
      };
    }

    const lowerText = text.toLowerCase();

    const keywordLayer = scoreKeywordSignals(lowerText);
    const contextLayer = scoreContext(lowerText, keywordLayer.score > 0);
    const behaviorLayer = scoreBehavior(lowerText);

    const rawScore = keywordLayer.score + contextLayer.score + behaviorLayer.score;
    const safetyAdjusted = applySafetyOffsets(lowerText, rawScore);
    const riskScore = clamp(Math.round(safetyAdjusted.adjustedScore), 0, 100);

    const indicators = [...keywordLayer.indicators, ...contextLayer.indicators, ...behaviorLayer.indicators];

    if (safetyAdjusted.safeHits.length) {
      indicators.push({
        phrase: safetyAdjusted.safeHits.join(', '),
        reason: 'Benign context reduced risk (fiction/media context)',
        weight: -8,
        layer: 'Context Analysis'
      });
    }

    const classification = classifyCategory(riskScore, indicators);
    const confidence = calculateConfidence(riskScore, indicators.length);

    return {
      riskScore,
      category: classification.category,
      threatLevel: classification.threatLevel,
      confidence,
      indicators,
      layers: {
        keywordScore: keywordLayer.score,
        contextScore: contextLayer.score,
        behaviorScore: behaviorLayer.score
      }
    };
  }

  return { analyze };
})();
