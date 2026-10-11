# PulsePDA

Local-first Empyrion Galactic Survival PDA editor. No account, no server, nothing leaves the browser.

Open `index.html` in Chrome or Edge.

## What this MVP does

- Chapter → task → action tree
- Inspector forms for the fields you actually edit every day
- Live PDA-style preview
- Validation (missing tasks/actions, HUD title length, check field hints)
- Import `PDA.yaml` + optional `PDA.csv`
- Export `PDA.yaml` + `PDA.csv` (keys generated from your readable titles)
- Autosave to `localStorage`
- Undo (toolbar or Ctrl+Z when not in a field)
- Ctrl+S exports both files

## What it is not (yet)

Not a 1:1 eWPDA replacement. No ECF item autocomplete, no merge-conflict UI, no image gallery, no full PlayfieldOps/PlayerOps matrix, no multi-language grid. Those can be layered on.

## How to use the export

1. Export both files.
2. Copy them into your scenario:

`Content/Scenarios/<YourScenario>/Extras/PDA/PDA.yaml`  
`Content/Scenarios/<YourScenario>/Extras/PDA/PDA.csv`

3. In game, `pda rd` reloads PDA data (this can reset mission progress).

Export mode writes CSV keys into YAML (`ch_first_landing`, `tk_secure_the_pod`, …) and puts the human text in `PDA.csv`. That is the usual Empyrion pattern.

## Checks included

Inventory, crafting, combat, building, discovery, signals, windows, playfields, and an **AllowManual** helper that exports as `WindowOpened` + `AllowManualCompletion: true`.

## Privacy

All project data stays in this browser profile. Use Clear project in Import if you want a blank slate.
