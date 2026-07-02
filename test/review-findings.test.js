import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptedFinding, rejectedFinding } from './helpers/review-fixtures.js';
import { splitFindingsByCandidateSet } from '../src/review/findings.js';

test('splitFindingsByCandidateSet accepts only candidate rule IDs', () => {
  const result = splitFindingsByCandidateSet([
    acceptedFinding({ ruleId: 'RULE-A' }),
    rejectedFinding({ ruleId: 'RULE-X' }),
  ], [{ id: 'RULE-A' }]);

  assert.deepEqual(result.accepted.map((item) => item.ruleId), ['RULE-A']);
  assert.deepEqual(result.rejected.map((item) => item.ruleId), ['RULE-X']);
  assert.equal(result.rejected[0].rejectReason, 'rule-not-in-candidate-set');
});

test('splitFindingsByCandidateSet downgrades soft-only hard findings', () => {
  const result = splitFindingsByCandidateSet([
    acceptedFinding({ ruleId: 'RULE-SOFT', blocking: 'hard' }),
  ], [{ id: 'RULE-SOFT', hardBlock: false }], [{ id: 'RULE-SOFT', hardBlock: false }]);

  assert.equal(result.accepted[0].blocking, 'soft');
});

test('splitFindingsByCandidateSet sorts accepted and rejected findings deterministically', () => {
  const result = splitFindingsByCandidateSet([
    acceptedFinding({ ruleId: 'B', file: 'b.js' }),
    acceptedFinding({ ruleId: 'A', file: 'a.js' }),
    rejectedFinding({ ruleId: 'Z', file: 'z.js' }),
    rejectedFinding({ ruleId: 'C', file: 'c.js' }),
  ], [{ id: 'A' }, { id: 'B' }]);

  assert.deepEqual(result.accepted.map((item) => item.ruleId), ['A', 'B']);
  assert.deepEqual(result.rejected.map((item) => item.ruleId), ['C', 'Z']);
});
