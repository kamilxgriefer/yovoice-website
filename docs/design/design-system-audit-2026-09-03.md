# Design-system audit — Build 19 website sync

Date: 2026-09-03

## Summary

Components reviewed: 9 | Issues found: 5 | Resolved in this pass: 5

The existing YO Voice website already had a strong Dark foundation, exact
semantic palette mapping and a coherent glass-card language. The main gap was
release hierarchy: the live Build 18 tester state and the unfinished Build 19
scope had no shared, visually distinct pattern. Updates also kept too much
August work in the current wave, which made the newest release harder to scan.

## Findings and resolutions

| Priority | Finding | Resolution |
| --- | --- | --- |
| High | No release-candidate pattern shared by Home and Updates | Added the token-driven release spotlight, build orb, scope cards and featured ledger card |
| High | Build 19 scope was absent from the public release ledger | Added one source-of-truth entry with an explicit verification boundary |
| Medium | Current-wave hierarchy mixed August and September work | Current wave now begins on 1 September; earlier work remains available in the disclosure |
| Medium | The featured release resembled every historical card | Added a restrained brand-light border, build identity and stronger information hierarchy |
| Low | Desktop update dates wrapped incidentally | Split the semantic “Updated” label from a compact day-first date |

## Token coverage

| Category | Defined | Notes |
| --- | --- | --- |
| Semantic colours | Yes | Exact Flutter Dark values remain unchanged |
| Composite depth | Yes | Four derived glass/glow tokens now cover release surfaces |
| Radius | Yes | Existing small through pill scale is reused |
| Focus | Yes | Interactive release links keep the global `--focus` outline |
| Motion | Yes | Hover lift is optional enrichment and collapses under reduced motion |

## Component completeness

| Component | States | Responsive | Accessibility | Result |
| --- | --- | --- | --- | --- |
| Release spotlight | Default, hover link | 320–1440 px checked | Labelled section, semantic list and heading | Pass |
| Build orb | Static identity | Compact and desktop sizes | Explicit Build 19 name | Pass |
| Scope card | Default, hover | One or two columns | Icons decorative; visible labels retained | Pass |
| Featured update | Four semantic status variants | Stacked and two-column | Article labelled by its heading | Pass |
| Status legend | Four semantic status variants | One, two or four columns | Icon and text convey each state | Pass |

## Release-truth rule

Build 19 is represented as `verification`, not `testing`, `ready` or
`live`. The copy explicitly says that tester-channel confirmation and
physical-device checks are still required. It does not promise one-millisecond
delivery, universal cross-version behavior or application-level end-to-end
encryption.
