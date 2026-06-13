export function decideReview(findings, policy) {
  const totalScore = findings.reduce((sum, finding) => sum + Number(finding.weightedScore || finding.score || 0), 0);
  const hardFinding = findings.find((finding) => finding.blocking === 'hard');

  if (hardFinding) {
    return { status: 'HARD_BLOCK', totalScore, findings };
  }

  if (totalScore >= policy.hardBlockScore) {
    return { status: 'HARD_BLOCK', totalScore, findings };
  }

  if (totalScore >= policy.softBlockScore) {
    return { status: 'SOFT_BLOCK', totalScore, findings };
  }

  return { status: 'PASS', totalScore, findings };
}
