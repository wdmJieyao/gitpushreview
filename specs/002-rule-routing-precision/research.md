# Research: Rule Routing Precision

## Decision: Preserve legacy `capabilities` OR matching, add `requiredCapabilities` AND matching

**Rationale**: Existing user rules depend on `capabilities` behaving as "any of these capabilities can make the rule relevant". Changing that field to AND semantics would silently break custom rules. A new `requiredCapabilities` metadata field lets high-risk default rules require multiple facts, such as `persistence.sql` plus `persistence.sql.mysql`, without invalidating legacy rules.

**Alternatives considered**:

- Change `capabilities` to AND semantics: rejected because it is a breaking change for existing initialized workspaces.
- Encode requirements through `signalContent` only: rejected because signals are currently evidence and unknown expansion helpers, not the main candidate gate for recognized files.

## Decision: Make database dialect routing evidence-backed and non-generic

**Rationale**: Generic SQL capability should route generic SQL rules only. Dialect-specific rules should require concrete dialect capabilities such as `persistence.sql.mysql`, `persistence.sql.oracle`, `persistence.sql.postgresql`, or `persistence.sql.oceanbase`, and those capabilities should only appear when path or content evidence is specific enough. Generic MyBatis XML must not expand into all dialect families.

**Alternatives considered**:

- Keep dialects as `dialectCandidates` only: rejected because rule routing needs a first-class capability gate.
- Let model choose the dialect from all dialect rules: rejected because it recreates the unstable candidate set problem.

## Decision: Separate generic frontend files from Vue-specific files

**Rationale**: `.vue` files are high-confidence Vue. Plain `.js`, `.ts`, `.jsx`, and `.tsx` can be frontend, Node, tests, configs, or build scripts. They should receive generic JS/TS/frontend/common rules unless Vue evidence is present, such as `.vue` extension, Vue imports, Vue compiler/config files, or project profile confirmation.

**Alternatives considered**:

- Continue mapping all JS/TS to `frontend.vue`: rejected because it over-routes Vue rules into unrelated files.
- Remove frontend capability from JS/TS entirely: rejected because common frontend/security rules still need a broad non-Vue signal.

## Decision: Narrow Java subdomain rules with concrete subdomain capabilities

**Rationale**: `language.java` is too broad for Redis, MQ, MyBatis, Spring, Drools, and inline SQL rules. Java subdomain rules should require the matching subdomain capability or specific evidence, while ordinary Java service files should keep only Java/common/backend rules.

**Alternatives considered**:

- Use path globs alone: rejected because Java projects often mix technology concerns under shared package trees.
- Ask the model to ignore irrelevant Java subdomain rules: rejected because the model should not receive irrelevant candidates.

## Decision: Require stronger MQ evidence than generic terms

**Rationale**: Words such as `exchange`, `routing-key`, or `consumer group` can appear in non-MQ config or business text. Generic MQ capability should require vendor-specific tokens, framework annotations/classes, known config keys, or multiple corroborating signals. Vendor capabilities such as RabbitMQ and Kafka should remain separate.

**Alternatives considered**:

- Keep single-word detection and rely on route confidence: rejected because current rule routing does not consistently use confidence as a hard gate.
- Disable MQ detection for config files: rejected because config files are a primary MQ surface.

## Decision: Promote routing diagnostics to stable contract fields

**Rationale**: Maintainers need to see candidate IDs, source/category counts, match reasons, skip reasons, and rejected model findings without parsing free-form text. JSON output should be stable enough for tests and external debug tooling; human output should summarize the same information in Chinese.

**Alternatives considered**:

- Keep diagnostics only inside `ruleRouting.decisions`: rejected because it is too verbose and hard to scan.
- Only improve human explain output: rejected because automated regression tests and downstream tools need direct JSON fields.

## Decision: Detect duplicate rule IDs deterministically

**Rationale**: Duplicate rule IDs can cause one stage to use first-match semantics and another stage to use map overwrite semantics. Rule loading or routing must expose duplicate IDs in diagnostics and use deterministic ordering so duplicates cannot silently change accepted findings or block status.

**Alternatives considered**:

- Fail hard on duplicate IDs immediately: deferred because existing user workspaces may already contain duplicates; diagnostics-first avoids abrupt breakage while still surfacing the issue.
- Ignore duplicate IDs because selection is ordered: rejected because finding normalization already uses a `Map` keyed by rule ID.

## Decision: Keep review modes unchanged

**Rationale**: `skip`, `log`, and `normal` already define whether checks run and whether decisions block. Routing precision and diagnostics should not change those semantics: `skip` still avoids actual check work, `log` runs without blocking, and `normal` blocks according to accepted findings.

**Alternatives considered**:

- Run full model review in `skip` for diagnostics: rejected because skip means no check starts. `explain` remains available as an explicit diagnostic command.
