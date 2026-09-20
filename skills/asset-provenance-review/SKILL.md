# Asset Provenance Review Skill

## Purpose

Review whether bundled images, audio, datasets, models, fonts, icons and other third-party assets have a documented and defensible redistribution path.

## Input

- tracked asset inventory;
- README/credits/notices;
- source links;
- LICENSE and third-party notices;
- generated-asset scripts;
- public Pages/build packaging configuration.

## Checklist

- Is every material bundled asset category attributable to a source?
- Does “downloadable/public/open” get incorrectly treated as permission to redistribute?
- Are dataset access rights being confused with rights to republish derivatives?
- Are model weights covered by a different license than code?
- Are branded/vendor assets bundled without an explicit redistribution basis?
- Does Pages/release packaging publish assets that were intended to stay local?
- Are generated assets tied to a generator/style/model whose license or attribution matters?
- Are unresolved rights clearly marked as a publication/IP gate rather than hidden?
- Has the owner been asked to decide before destructive removal, relicensing, or history rewriting?

## Output

Return:
- asset category;
- source/provenance evidence;
- redistribution status: verified / unresolved / restricted / unknown;
- severity;
- confidence;
- release impact;
- recommended replacement or documentation path;
- owner decision required.

Never infer a license from repository visibility or from the existence of a download URL.
