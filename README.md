# Axis 2026 Creator Particlewave

Local Empyrion workshop for PDA missions, dialogues, items, blocks, and localization.

Everything stays on the machine that runs it. No account. Import a real scenario folder, edit, export YAML / CSV / ECF.

## What you get

- **PDA** — chapters, tasks, actions, BBCode colors, pictures
- **Dialogues** — states, Next / Execute, variables, CSV keys
- **Import** — scenario folder, configs, localization, icons, PDA.yaml/csv, dialogues, factions, sectors, playfields, blueprints
- **Library** — items & blocks with editable stats, compare similar blocks, localization
- **Debug** — problems, suggested fixes, select / accept / delete in bulk

FAQ chapters are listed last so missions show first.

## Run it

Needs Node 22+.

```bash
npm install
npm run dev
```

Open the address it prints (port 8080). Drop your scenario on **Import**.

Production build:

```bash
npm run build
npm run preview
```

## Typical flow

1. Import the scenario folder (or the twelve slots one by one)
2. Edit PDA and dialogues
3. Fix names in Debug
4. Tweak item/block stats in Library
5. Export YAML + CSV (and copy edited configs back into the scenario)

Icons resolve from `SharedData/Content/Bundles/ItemIcons` and `CustomIcon` names.

## Data

Project state is stored in the browser (IndexedDB). Clearing site data wipes the workshop copy, not your original scenario files. Export before you close a borrowed machine.
