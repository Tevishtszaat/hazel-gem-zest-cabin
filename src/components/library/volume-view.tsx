import { useEffect, useRef } from "react";
import type { GalaxyVolume, Vec3, VolumeSystem } from "@/lib/pda/volume.ts";
import { starTint } from "@/lib/pda/volume.ts";

export type ZoneRing = { label: string; min: number; max: number; color: string };

type Cam = { yaw: number; pitch: number; dist: number; target: Vec3 };
type Hit = { id: string; x: number; y: number; depth: number; label: string };

const ZONE_FALLBACK: ZoneRing[] = [
  { label: "Inner", min: 0, max: 40, color: "rgba(255,106,61,0.9)" },
  { label: "Hot", min: 40, max: 70, color: "rgba(255,176,32,0.9)" },
  { label: "Temperate", min: 70, max: 100, color: "rgba(61,255,154,0.9)" },
  { label: "Cold", min: 100, max: 140, color: "rgba(126,203,255,0.9)" },
  { label: "Outer", min: 140, max: 220, color: "rgba(180,190,210,0.7)" },
];

function project(p: Vec3, cam: Cam, w: number, h: number) {
  const x = p[0] - cam.target[0];
  const y = p[1] - cam.target[1];
  const z = p[2] - cam.target[2];
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const depth = cam.dist - z2;
  if (depth < 0.08) return null;
  const f = (Math.min(w, h) * 0.78) / depth;
  return { x: w / 2 + x1 * f, y: h / 2 - y2 * f, depth };
}

function strokeLoop(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[] | null, color: string, width: number, alpha = 1) {
  if (!pts || pts.length < 3) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function shell(ctx: CanvasRenderingContext2D, cam: Cam, w: number, h: number, radius: number, yScale: number, color: string, alpha: number) {
  for (const lat of [-50, -25, 0, 25, 50]) {
    const rad = (lat * Math.PI) / 180;
    const ring = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius * yScale;
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const p = project([Math.cos(a) * ring, y, Math.sin(a) * ring], cam, w, h);
      if (p) pts.push(p);
    }
    strokeLoop(ctx, pts, color, lat === 0 ? 1.4 : 0.7, alpha * (lat === 0 ? 1 : 0.55));
  }
}

const DUST = Array.from({ length: 700 }, (_, i) => {
  const n = (s: number) => {
    const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: n(1), y: n(2), a: 0.15 + n(3) * 0.55, r: n(4) > 0.97 ? 1.4 : 0.6 };
});

export function VolumeViewport({
  space,
  galaxy,
  systems,
  focusSystem,
  focusBody,
  zones,
  onPick,
  layer = "all",
}: {
  space: "galaxy" | "system";
  galaxy: GalaxyVolume | null;
  systems: VolumeSystem[];
  focusSystem?: string;
  focusBody?: string;
  zones?: ZoneRing[];
  onPick?: (pick: { system: string; body?: string }) => void;
  layer?: "galaxy" | "regions" | "territories" | "all";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<Cam>({ yaw: 0.6, pitch: 0.55, dist: 2000, target: [0, 0, 0] });
  const hitsRef = useRef<Hit[]>([]);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null);

  const system = systems.find((item) => item.name === focusSystem) ?? null;
  const frameKey = `${space}:${focusSystem || ""}:${focusBody || ""}:${galaxy?.outer || 0}`;

  useEffect(() => {
    const outer = galaxy?.outer || 1000;
    if (space === "galaxy") {
      camRef.current = { yaw: 0.7, pitch: 0.62, dist: outer * 2.35, target: [0, 0, 0] };
      return;
    }
    const body = system?.bodies.find((item) => item.name === focusBody);
    if (body) {
      const near = system?.bodies.reduce((best, item) => {
        if (item.name === body.name) return best;
        const d = Math.hypot(item.local[0] - body.local[0], item.local[1] - body.local[1], item.local[2] - body.local[2]);
        return Math.min(best, d);
      }, 80);
      camRef.current = { yaw: 0.5, pitch: 0.7, dist: Math.max(28, (near || 40) * 2.4), target: body.local };
      return;
    }
    const far = system?.bodies.reduce((m, item) => Math.max(m, Math.hypot(...item.local)), 80) || 160;
    camRef.current = { yaw: 0.55, pitch: 0.85, dist: Math.max(far * 2.4, 80), target: [0, 0, 0] };
  }, [frameKey, space, system, focusBody, galaxy?.outer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let frame = 0;
    const paint = () => {
      const cssW = wrap.clientWidth || 800;
      const cssH = wrap.clientHeight || 480;
      const dpr = 2;
      if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
      }
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = cssW;
      const h = cssH;
      const cam = camRef.current;
      const hits: Hit[] = [];
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#10182a");
      sky.addColorStop(1, "#05070d");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      for (const star of DUST) {
        ctx.globalAlpha = star.a;
        ctx.fillStyle = "#d5e4ff";
        ctx.fillRect(star.x * w, star.y * h, star.r, star.r);
      }
      ctx.globalAlpha = 1;

      if (space === "galaxy") {
        const showGalaxy = layer === "galaxy" || layer === "all";
        const showRegions = layer === "regions" || layer === "all";
        const showTerritories = layer === "territories" || layer === "all";
        const outer = galaxy?.outer || 1000;
        const yScale = 0.22;
        if (showGalaxy) {
          shell(ctx, cam, w, h, outer, yScale, "rgba(150,186,255,0.85)", 0.35);
          if ((galaxy?.inner || 0) > 1) shell(ctx, cam, w, h, galaxy!.inner, yScale, "rgba(255,220,160,0.8)", 0.28);
        } else {
          shell(ctx, cam, w, h, outer, yScale, "rgba(150,186,255,0.45)", 0.12);
        }
        if (showRegions) {
          const regionLabels: { x: number; y: number; text: string }[] = [];
          for (const region of galaxy?.regions || []) {
            if (region.outer <= 0) continue;
            shell(ctx, cam, w, h, region.outer, region.shape === "elliptical" ? 0.22 : 1, region.color, layer === "regions" ? 0.8 : 0.45);
            const at = project([region.outer, 0, 0], cam, w, h);
            if (at) regionLabels.push({ x: at.x, y: at.y, text: region.name });
          }
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#f4f7ff";
          const drawn: { x: number; y: number }[] = [];
          for (const item of regionLabels) {
            if (drawn.some((prev) => Math.hypot(prev.x - item.x, prev.y - item.y) < 16)) continue;
            if (drawn.length >= 16) break;
            ctx.fillText(item.text, item.x + 6, item.y - 4);
            drawn.push(item);
          }
        }
        if (showGalaxy) {
          const nebulas = (galaxy?.nebulas || []).slice(0, 8);
          nebulas.forEach((nebula, i) => {
            const angle = (i / nebulas.length) * Math.PI * 2;
            const r = outer * (0.35 + (i % 3) * 0.15);
            const at = project([Math.cos(angle) * r, outer * 0.02, Math.sin(angle) * r], cam, w, h);
            const stop = nebula.stops[0];
            if (!at || !stop) return;
            const radius = Math.max(40, Math.min(w, h) * 0.16);
            const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, radius);
            const red = Math.round(Math.min(1, stop[0]) * 255);
            const green = Math.round(Math.min(1, stop[1]) * 255);
            const blue = Math.round(Math.min(1, stop[2]) * 255);
            g.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.28)`);
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        if (showTerritories) {
          const drawn: { x: number; y: number }[] = [];
          for (const territory of galaxy?.territories || []) {
            const center = territory.center;
            shell(ctx, { ...cam, target: [cam.target[0] - center[0], cam.target[1] - center[1], cam.target[2] - center[2]] }, w, h, territory.radius, 1, territory.color, layer === "territories" ? 0.9 : 0.55);
            const at = project(center, cam, w, h);
            if (!at) continue;
            ctx.fillStyle = territory.color;
            ctx.beginPath();
            ctx.arc(at.x, at.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
            if (drawn.some((prev) => Math.hypot(prev.x - at.x, prev.y - at.y) < 14)) continue;
            ctx.font = "11px sans-serif";
            ctx.fillText(territory.faction, at.x + 6, at.y - 6);
            drawn.push(at);
          }
        }
        if (showGalaxy || layer === "all") {
          const projected = systems
            .map((item) => {
              const at = project(item.ly, cam, w, h);
              return at ? { item, at } : null;
            })
            .filter((item): item is { item: VolumeSystem; at: { x: number; y: number; depth: number } } => Boolean(item))
            .sort((a, b) => b.at.depth - a.at.depth);
          for (const { item, at } of projected) {
            const tint = starTint(item.starClass, item.color);
            const focused = item.name === focusSystem;
            ctx.fillStyle = tint;
            ctx.shadowColor = tint;
            ctx.shadowBlur = focused ? 16 : 8;
            ctx.beginPath();
            ctx.arc(at.x, at.y, focused ? 4.5 : 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            hits.push({ id: item.name, x: at.x, y: at.y, depth: at.depth, label: item.name });
          }
          const label = projected.find((item) => item.item.name === focusSystem);
          if (label) {
            ctx.fillStyle = "#f4f7ff";
            ctx.font = "12px sans-serif";
            ctx.fillText(label.item.name, label.at.x + 8, label.at.y - 8);
          }
        }
      } else if (system) {
        const rings = zones?.length ? zones : ZONE_FALLBACK;
        for (const zone of rings) {
          const pts = [];
          for (let i = 0; i <= 72; i++) {
            const a = (i / 72) * Math.PI * 2;
            const p = project([Math.cos(a) * zone.max, 0, Math.sin(a) * zone.max], cam, w, h);
            if (p) pts.push(p);
          }
          strokeLoop(ctx, pts, zone.color, 1.2, 0.55);
        }
        const sun = project([0, 0, 0], cam, w, h);
        if (sun) {
          const tint = starTint(system.starClass, system.color);
          const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 36);
          glow.addColorStop(0, tint);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sun.x, sun.y, 36, 0, Math.PI * 2);
          ctx.fill();
        }
        const bodies = system.bodies
          .map((body) => {
            const at = project(body.local, cam, w, h);
            return at ? { body, at } : null;
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .sort((a, b) => b.at.depth - a.at.depth);
        for (const { body, at } of bodies) {
          if (/sun|star/i.test(body.kind) && Math.hypot(body.local[0], body.local[1], body.local[2]) < 1) continue;
          const orbit = [];
          const radius = Math.hypot(body.local[0], body.local[2]) || Math.hypot(body.local[0], body.local[1], body.local[2]);
          for (let i = 0; i <= 48; i++) {
            const a = (i / 48) * Math.PI * 2;
            const p = project([Math.cos(a) * radius, body.local[1], Math.sin(a) * radius], cam, w, h);
            if (p) orbit.push(p);
          }
          strokeLoop(ctx, orbit, "rgba(180,198,230,0.35)", 1, 0.8);
          const moon = /moon/i.test(body.kind);
          const planet = /planet/i.test(body.kind);
          ctx.fillStyle = moon ? "#d5d8e0" : planet ? "#8ec8ff" : "#b9a6ff";
          const focused = body.name === focusBody;
          ctx.beginPath();
          ctx.arc(at.x, at.y, focused ? 7 : moon ? 3.5 : 5, 0, Math.PI * 2);
          ctx.fill();
          if (focused) {
            ctx.fillStyle = "#f4f7ff";
            ctx.font = "12px sans-serif";
            ctx.fillText(body.name, at.x + 8, at.y - 8);
          }
          hits.push({ id: body.name, x: at.x, y: at.y, depth: at.depth, label: body.name });
        }
      } else {
        ctx.fillStyle = "#9aa6bd";
        ctx.font = "14px sans-serif";
        ctx.fillText("Import Sectors.yaml to place stars in this volume.", 24, 36);
      }
      hitsRef.current = hits;
    };
    const requestDraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };
    requestDraw();
    const observer = new ResizeObserver(requestDraw);
    observer.observe(wrap);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const cam = camRef.current;
      const next = cam.dist * (event.deltaY > 0 ? 1.08 : 0.92);
      const cap = space === "galaxy" ? (galaxy?.outer || 1000) * 8 : 20000;
      cam.dist = Math.max(space === "galaxy" ? 20 : 8, Math.min(next, cap));
      requestDraw();
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("volume-cam", requestDraw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("volume-cam", requestDraw);
    };
  }, [space, galaxy, systems, system, focusSystem, focusBody, zones, frameKey, layer]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full min-h-[420px] w-full overflow-hidden rounded-md border border-border bg-[#05070d]"
      onPointerDown={(event) => {
        drag.current = { x: event.clientX, y: event.clientY, yaw: camRef.current.yaw, pitch: camRef.current.pitch, moved: false };
        (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.hypot(dx, dy) > 3) start.moved = true;
        camRef.current.yaw = start.yaw + dx * 0.008;
        camRef.current.pitch = Math.max(-1.2, Math.min(1.35, start.pitch + dy * 0.006));
        wrapRef.current?.dispatchEvent(new Event("volume-cam"));
      }}
      onPointerUp={(event) => {
        const start = drag.current;
        drag.current = null;
        if (!start || start.moved) return;
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let best: Hit | null = null;
        let bestD = 16;
        for (const hit of hitsRef.current) {
          const d = Math.hypot(hit.x - x, hit.y - y);
          if (d < bestD) {
            best = hit;
            bestD = d;
          }
        }
        if (!best) return;
        if (space === "galaxy") onPick?.({ system: best.id });
        else if (focusSystem) onPick?.({ system: focusSystem, body: best.id });
      }}
    >
      <canvas ref={canvasRef} />
      <div className="pointer-events-none absolute left-3 top-3 text-[11px] uppercase tracking-[0.14em] text-[#9eb0d0]">
        {space === "galaxy"
          ? layer === "regions"
            ? "Region view · star regions"
            : layer === "territories"
              ? "Territory view · faction spheres"
              : layer === "all"
                ? "Combined · galaxy, regions, territories"
                : "Galaxy view · light years"
          : focusBody
            ? `Planet view · ${focusBody}`
            : `Star view · ${focusSystem || "system"}`}
        <span className="mt-1 block normal-case tracking-normal text-[#7f8eab]">Drag to orbit. Scroll to zoom. Click a point to go closer.</span>
      </div>
    </div>
  );
}
