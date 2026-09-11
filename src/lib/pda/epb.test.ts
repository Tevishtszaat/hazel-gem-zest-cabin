import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTestEpb, parseEpbHeader } from "./epb.ts";

describe("epb header", () => {
  it("reads GroupName and SpawnName from header tags, not the file name", () => {
    const bytes = buildTestEpb({ groupName: "CivilSettlement", spawnName: "Farm" });
    const meta = parseEpbHeader(bytes, "Prefabs/BA_CivilFarm.epb");
    assert.equal(meta.fileName, "BA_CivilFarm");
    assert.equal(meta.groupName, "CivilSettlement");
    assert.equal(meta.spawnName, "Farm");
  });

  it("finds GroupName even if extra header bytes sit in front of the tag list", () => {
    const inner = buildTestEpb({ groupName: "JunkT1", spawnName: "Wreck" });
    const padded = new Uint8Array(inner.length + 12);
    padded.set(inner.subarray(0, 8), 0);
    padded.set(inner.subarray(8), 20);
    const meta = parseEpbHeader(padded, "BA_Junk.epb");
    assert.equal(meta.groupName, "JunkT1");
    assert.equal(meta.spawnName, "Wreck");
  });
});
