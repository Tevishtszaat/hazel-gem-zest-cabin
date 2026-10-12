import assert from "node:assert/strict";
import test from "node:test";
import { parseEcfObjects } from "./ecf.ts";
import {
  addPlayfield,
  parsePlayfieldLine,
  parseVolumeSystems,
  patchPlayfield,
  patchSystemCoordinates,
  patchSystemStarClass,
  readGalaxyVolume,
  removePlayfield,
} from "./volume.ts";

const YAML = `Sectors:
- Coordinates: [134, 25, 126]
  SectorName: Ellyon
  StarClass: G2
  Color: 1, 0.9, 0.4
  Playfields:
  - ['0, 0, 0', Ellyon, Sun]
  - ['70, 10, 5', Akua, Planet, Temperate]
  - ['78, 12, 8', Akua Moon, Moon, Barren]
- Coordinates: [-40, 10, 80]
  SectorName: Omicron
  StarClass: M
  Playfields:
  - [0, 0, 0, Omicron, Sun]
  - [30, 0, 0, Ember, Planet, Lava]
`;

test("reads light-year systems and local playfields", () => {
  const systems = parseVolumeSystems(YAML);
  assert.equal(systems.length, 2);
  assert.equal(systems[0]?.name, "Ellyon");
  assert.deepEqual(systems[0]?.ly, [134, 25, 126]);
  assert.equal(systems[0]?.starClass, "G2");
  assert.equal(systems[0]?.bodies[1]?.name, "Akua");
  assert.deepEqual(systems[0]?.bodies[1]?.local, [70, 10, 5]);
  assert.equal(systems[0]?.bodies[1]?.playfieldType, "Temperate");
  assert.equal(systems[1]?.bodies[1]?.name, "Ember");
  assert.equal(systems[1]?.bodies[1]?.quoted, false);
  const quoted = parsePlayfieldLine("  - ['12, 0, 4', Luna, Moon, Barren]");
  assert.equal(quoted?.name, "Luna");
  assert.deepEqual(quoted?.local, [12, 0, 4]);
});

test("patches coordinates, class, and playfields without dropping the other system", () => {
  const systems = parseVolumeSystems(YAML);
  const ellyon = systems[0]!;
  const akua = ellyon.bodies[1]!;
  let next = patchSystemCoordinates(YAML, ellyon, [10, 20, 30]);
  next = patchSystemStarClass(next, parseVolumeSystems(next)[0]!, "K");
  next = patchPlayfield(next, parseVolumeSystems(next)[0]!.bodies[1]!, {
    ...akua,
    local: [80, 0, 0],
    name: "Akua",
    kind: "Planet",
    playfieldType: "Temperate",
  });
  next = addPlayfield(next, parseVolumeSystems(next)[0]!, {
    local: [90, 0, 0],
    name: "New Moon",
    kind: "Moon",
    playfieldType: "Barren",
  });
  let parsed = parseVolumeSystems(next);
  assert.deepEqual(parsed[0]?.ly, [10, 20, 30]);
  assert.equal(parsed[0]?.starClass, "K");
  assert.deepEqual(parsed[0]?.bodies[1]?.local, [80, 0, 0]);
  assert.equal(parsed[0]?.bodies.some((body) => body.name === "New Moon"), true);
  assert.equal(parsed[1]?.name, "Omicron");
  next = removePlayfield(next, parseVolumeSystems(next)[0]!.bodies.find((body) => body.name === "New Moon")!);
  parsed = parseVolumeSystems(next);
  assert.equal(parsed[0]?.bodies.some((body) => body.name === "New Moon"), false);
});

test("reads map, list, and name-first planet coordinates", () => {
  const named = parsePlayfieldLine("  - [Pearls Eye, AscArcticWater, '-12000, 0, 4000']");
  assert.equal(named?.name, "Pearls Eye");
  assert.deepEqual(named?.local, [-12000, 0, 4000]);
  const map = parseVolumeSystems(`- Name: Pearl
  StarClass: R
  Coordinates:
    - 0
    - 0
    - 0
  Playfields:
    - Name: Pearls Eye
      PlayfieldType: AscArcticWater
      Coordinates: [-12000, 0, 4000]
    - - -8000, 200, 1000
      - Pearls Moon
      - MoonBarren
`);
  assert.deepEqual(map[0]?.ly, [0, 0, 0]);
  assert.equal(map[0]?.bodies[0]?.name, "Pearls Eye");
  assert.deepEqual(map[0]?.bodies[0]?.local, [-12000, 0, 4000]);
  assert.equal(map[0]?.bodies[0]?.playfieldType, "AscArcticWater");
  assert.deepEqual(map[0]?.bodies[1]?.local, [-8000, 200, 1000]);
  assert.equal(map[0]?.bodies[1]?.name, "Pearls Moon");
});

test("reads galaxy radius, regions, territories, and nebula stops", () => {
  const general = parseEcfObjects(`{ GalaxyConfig, Name: General
  Radius: "0, 11000"
  SectorsPerLY: 100000
  NebulaColors1: "1, 0.3, 0,  0.2, 0, 0"
  { Child StarRegion_1
    Name: "The Center"
    Shape: Sphere
    RadiusMinMax: "0, 2"
    LabelColor: "0.15, 0.63, 0.91"
  }
  { Child Territory_1
    Faction: Zirax
    Center: "130, 0, 206"
    Radius: 75
  }
}
`)[0]!;
  const volume = readGalaxyVolume(general);
  assert.equal(volume.outer, 11000);
  assert.equal(volume.regions[0]?.name, "The Center");
  assert.equal(volume.regions[0]?.outer, 2);
  assert.equal(volume.territories[0]?.faction, "Zirax");
  assert.deepEqual(volume.territories[0]?.center, [130, 0, 206]);
  assert.equal(volume.nebulas[0]?.stops.length, 2);
});
