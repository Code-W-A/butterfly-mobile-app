# UX Recommendation Flow

## Flow

`RecommendationQuestionnaire -> RecommendationMicroLoading -> RecommendationResultsWOW -> RecommendationConfiguratorStart`

The legacy `RecommendationResults` screen remains in code for fallback/non-regression, but the active questionnaire submit flow now goes through `RecommendationMicroLoading` and `RecommendationResultsWOW`.

## Data Passing (No Extra Reads)

After questionnaire validation:

1. `RecommendationQuestionnaire` navigates to `RecommendationMicroLoading` with:
   - `questionnaireId`
   - `answers`
   - `contact`
   - `note`
   - `debug`
2. `RecommendationMicroLoading` runs `computeRecommendations` callable.
3. On success, `RecommendationMicroLoading` builds view-model data (`wowItems`, `heroItem`) in memory and calls:
   - `navigation.replace(RECOMMENDATION_ROUTES.RESULTS_WOW, params)`
4. `RecommendationResultsWOW` renders strictly from navigation params and local state.

No Firestore reads are triggered by `RecommendationResultsWOW`.

## Firestore Cost Guarantees

- No `onSnapshot` listeners added.
- `RecommendationMicroLoading` uses callable compute only.
- `RecommendationResultsWOW` uses params/memory only.
- Existing async local+remote history/favorites behavior stays unchanged.

## MicroLoading Timing + Reliability

- Minimum visible loading time: `900ms`.
- Timeout: `4000ms`.
- If timeout/error occurs, an error state with `Reîncearcă` is shown.
- Retry reruns callable once per attempt.
- Attempt guard (`attemptIdRef`) prevents stale async results from older attempts from affecting navigation.

## Navigation + Tab Bar

Bottom tab bar is hidden on:

- `RecommendationQuestionnaire`
- `RecommendationMicroLoading`
- `RecommendationResultsWOW`

This keeps the guided flow focused. Returning from configurator uses standard stack back to `RecommendationResultsWOW`.

## Notes

- Project is JS-only. No TypeScript setup was introduced.
- Template architecture (mStore navigation/theme/component style) is preserved.
