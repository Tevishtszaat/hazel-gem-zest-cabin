import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { EcfObject } from "@/lib/pda/ecf.ts";
import {
  applyZoneDrag,
  axisMax,
  auToSectors,
  clusterTicks,
  fluxLabel,
  groupSystems,
  kindGroup,
  luminosityOf,
  overlayBodies,
  physicsHabitableAU,
  pickDefaultSystem,
  placeBodyLabels,
  rgbFromField,
  sectorsToAu,
  solarAdvice,
  solarFlux,
  spansToZoneFields,
  starZoneSpans,
  zoneAtDistance,
  zoneHandleList,
  zoneWarnings,
  type SystemBody,
  type ZoneHandle,
} from "@/lib/pda/galaxy.ts";

function shortName(name: string, max = 14) {
  const clean = name.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function GalaxyStarChart({
  star,
  bodies,
  starterName,
  onPatchStar,
}: {
  star: EcfObject;
  bodies: SystemBody[];
  starterName?: string;
  onPatchStar?: (fields: Record<string, string>) => void;
}) {
  const L = luminosityOf(star);
  const spans = starZoneSpans(star);
  const systems = useMemo(() => groupSystems(bodies), [bodies]);
  const [systemName, setSystemName] = useState(() => pickDefaultSystem(star, systems, starterName));
  const [showMoons, setShowMoons] = useState(false);
  const [showOther, setShowOther] = useState(false);

  useEffect(() => {
    setSystemName(pickDefaultSystem(star, systems, starterName));
  }, [star.name, starterName, systems]);

  const selected = systems.find((s) => s.name === systemName) ?? systems[0];
  const related = overlayBodies(star, selected?.bodies ?? []).filter((body) => {
    const group = kindGroup(body.kind);
    if (group === "planet") return true;
    if (group === "moon") return showMoons;
    return showOther;
  });
  const max = Math.max(axisMax(star, related), 8);
  const inView = related.filter((b) => b.distance <= max);
  const offscale = related.filter((b) => b.distance > max);
  const physics = physicsHabitableAU(L);
  const warnings = zoneWarnings(star);
  const svgRef = useRef<SVGSVGElement>(null);
  const [probe, setProbe] = useState(0);
  const [drag, setDrag] = useState<ZoneHandle | "probe" | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const temp = spans.find((s) => s.key === "HabitableTemperate");
    setProbe(temp ? Math.round((temp.min + temp.max) / 2) : Math.round(max * 0.4));
  }, [star.name]);

  const flux = solarFlux(L, probe);
  const zone = zoneAtDistance(star, probe);
  const color = rgbFromField(star.fields.Color || star.fields.LightColor);
  const w = 760;
  const bandY = 28;
  const bandH = 44;
  const fluxH = 96;
  const pad = { l: 52, r: 18, t: 10, b: 22 };
  const innerW = w - pad.l - pad.r;
  const x = (sectors: number) => pad.l + (Math.max(0, Math.min(sectors, max)) / max) * innerW;
  const handles = zoneHandleList(spans);
  const ticks = clusterTicks(inView, x, 5);
  const { placed, hidden } = placeBodyLabels(inView, x, 70, 3);
  const lanes = Math.max(1, ...placed.map((p) => p.lane + 1), 1);
  const labelH = 8 + lanes * 16;
  const axisY = bandY + bandH + labelH + 18;
  const fluxY = axisY + 14;
  const height = fluxY + fluxH + pad.b;

  const sectorsFromEvent = (event: PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const ctm = svg.getScreenCTM();
    if (!ctm) return 0;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const loc = pt.matrixTransform(ctm.inverse());
    return Math.round(((loc.x - pad.l) / innerW) * max);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const sectors = Math.max(0, sectorsFromEvent(event));
    if (drag === "probe") {
      setProbe(sectors);
      return;
    }
    if (!onPatchStar) return;
    onPatchStar(spansToZoneFields(applyZoneDrag(spans, drag, sectors)));
  };

  const fluxPts = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 48; i++) {
      const sectors = (i / 48) * max;
      const f = solarFlux(L, Math.max(sectors, 0.2));
      const log = Math.log10(Math.max(f, 0.001));
      const y = fluxY + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
      pts.push({ x: x(sectors), y: Math.max(fluxY, Math.min(fluxY + fluxH, y)) });
    }
    return pts;
  }, [L, max, fluxY]);

  const earthY = (() => {
    const log = Math.log10(1);
    return fluxY + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
  })();

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-accent">Habitable zones · solar flux</p>
          <h3 className="mt-1 text-lg font-medium tracking-tight">
            {star.fields.StarClass || star.name}
            <span className="ml-2 font-mono text-sm text-muted">L = {L} Sol</span>
          </h3>
          <p className="mt-1 text-xs text-subtle">
            One solar system, scaled to this star’s outer band. Far playfields stay off-chart so names don’t pile up.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {systems.length ? (
            <label className="text-xs text-muted">
              System
              <select
                className="ml-2 h-8 max-w-48 rounded-sm border border-border bg-bg px-2 text-sm text-fg"
                value={selected?.name || ""}
                onChange={(e) => setSystemName(e.target.value)}
              >
                {systems.map((sys) => (
                  <option key={sys.name} value={sys.name}>
                    {sys.starClass ? `${sys.name} (${sys.starClass})` : sys.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="flex items-center gap-1 text-xs text-muted">
            <input type="checkbox" checked={showMoons} onChange={(e) => setShowMoons(e.target.checked)} />
            Moons
          </label>
          <label className="flex items-center gap-1 text-xs text-muted">
            <input type="checkbox" checked={showOther} onChange={(e) => setShowOther(e.target.checked)} />
            Other
          </label>
        <label className="text-xs text-muted">
          Probe distance
          <input
            className="ml-2 h-8 w-24 rounded-sm border border-border bg-bg px-2 font-mono text-sm text-fg"
            value={probe}
            onChange={(e) => setProbe(Number(e.target.value) || 0)}
          />
          <span className="ml-1 text-subtle">sec</span>
        </label>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${height}`}
        className="mt-3 w-full touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <rect x={pad.l} y={bandY} width={innerW} height={bandH} className="fill-bg" rx="4" />
        {spans.map((span) => {
          const left = x(span.min);
          const width = Math.max(2, x(span.max) - left);
          return (
            <g key={span.key}>
              <rect x={left} y={bandY} width={width} height={bandH} fill={span.color} opacity={0.38} />
              {width >= 36 ? (
                <text
                  x={left + width / 2}
                  y={bandY + 18}
                  textAnchor="middle"
                  className="fill-fg"
                  fontSize="10"
                  fontWeight="500"
                >
                  {span.label}
                </text>
              ) : null}
              {width >= 52 ? (
                <text x={left + width / 2} y={bandY + 32} textAnchor="middle" className="fill-subtle" fontSize="9">
                  {span.min}–{span.max}
                </text>
              ) : null}
            </g>
          );
        })}
        <rect
          x={x(auToSectors(physics.inner))}
          y={bandY + bandH - 7}
          width={Math.max(2, x(auToSectors(physics.outer)) - x(auToSectors(physics.inner)))}
          height={6}
          fill="none"
          className="stroke-fg"
          strokeDasharray="4 3"
          opacity={0.8}
        />

        <circle cx={pad.l} cy={bandY + bandH / 2} r={14} fill={color} opacity={0.35} />
        <circle cx={pad.l} cy={bandY + bandH / 2} r={8} fill={color} />
        <text x={pad.l} y={bandY - 8} textAnchor="middle" className="fill-muted" fontSize="9">
          {star.fields.StarClass || "★"}
        </text>

        {ticks.map((tick) => (
          <line
            key={`t-${tick.x}`}
            x1={tick.x}
            x2={tick.x}
            y1={bandY + 4}
            y2={bandY + bandH - 4}
            className="stroke-fg"
            opacity={tick.bodies.some((b) => b.name === hover) ? 0.95 : 0.35}
            strokeWidth={tick.bodies.some((b) => b.name === hover) ? 2 : 1}
          />
        ))}
        {placed.map((item) => {
          const tick = x(item.body.distance);
          const labelY = bandY + bandH + 14 + item.lane * 16;
          const active = hover === item.body.name;
          return (
            <g
              key={`${item.body.system}-${item.body.name}`}
              onPointerEnter={() => setHover(item.body.name)}
              onPointerLeave={() => setHover(null)}
            >
              <line x1={tick} x2={tick} y1={bandY + bandH} y2={labelY - 8} className="stroke-border" strokeWidth={1} />
              <text
                x={tick}
                y={labelY}
                textAnchor="middle"
                className={active ? "fill-fg" : "fill-muted"}
                fontSize="10"
                stroke="var(--color-surface)"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {shortName(item.body.name)}
              </text>
            </g>
          );
        })}

        <line
          x1={x(probe)}
          x2={x(probe)}
          y1={bandY}
          y2={bandY + bandH}
          className="stroke-accent"
          strokeWidth={2}
          onPointerDown={(e) => {
            svgRef.current?.setPointerCapture(e.pointerId);
            setDrag("probe");
          }}
        />
        {onPatchStar
          ? handles.map((handle) => (
              <circle
                key={handle.id}
                cx={x(handle.sectors)}
                cy={bandY + bandH / 2}
                r={9}
                className="fill-fg cursor-ew-resize"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  svgRef.current?.setPointerCapture(e.pointerId);
                  setDrag(handle);
                }}
              />
            ))
          : null}

        <text x={pad.l} y={axisY} className="fill-subtle" fontSize="10">
          0 AU
        </text>
        <text x={w - pad.r} y={axisY} textAnchor="end" className="fill-subtle" fontSize="10">
          {max.toFixed(0)} sec · {sectorsToAu(max).toFixed(1)} AU
        </text>

        <text x={8} y={fluxY + 10} className="fill-subtle" fontSize="10">
          flux
        </text>
        <line x1={pad.l} x2={w - pad.r} y1={earthY} y2={earthY} className="stroke-ok" strokeDasharray="3 3" opacity={0.6} />
        <text x={w - pad.r} y={earthY - 4} textAnchor="end" className="fill-ok" fontSize="9">
          1× Earth
        </text>
        <polyline fill="none" className="stroke-accent" strokeWidth={2} points={fluxPts.map((p) => `${p.x},${p.y}`).join(" ")} />
        {inView.map((body) => {
          const f = solarFlux(L, body.distance);
          const log = Math.log10(Math.max(f, 0.001));
          const y = fluxY + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
          return (
            <circle
              key={`f-${body.system}-${body.name}`}
              cx={x(body.distance)}
              cy={Math.max(fluxY, Math.min(fluxY + fluxH, y))}
              r={hover === body.name ? 4 : 2.5}
              className="fill-fg"
            />
          );
        })}
      </svg>

      {(hidden > 0 || offscale.length > 0) ? (
        <p className="mt-2 text-xs text-subtle">
          {hidden > 0 ? `${hidden} labels skipped so names don’t overlap. ` : null}
          {offscale.length > 0
            ? `${offscale.length} playfields sit past this star’s outer band (e.g. ${offscale[0]!.name} at ${offscale[0]!.distance.toFixed(0)} sec / ${sectorsToAu(offscale[0]!.distance).toFixed(1)} AU) and are kept off the ruler.`
            : null}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="Probe" value={`${probe} sec · ${sectorsToAu(probe).toFixed(2)} AU`} />
        <Stat label="Game zone" value={zone ? `${zone.label} (${zone.hint})` : "Outside defined bands"} />
        <Stat label="Solar vs Earth" value={`${fluxLabel(flux)} · ${solarAdvice(flux)}`} />
      </div>
      {warnings.length ? (
        <ul className="mt-3 space-y-1 text-xs text-warn">
          {warnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-subtle">
          Physics HZ {auToSectors(physics.inner).toFixed(0)}–{auToSectors(physics.outer).toFixed(0)} sectors (
          {physics.inner.toFixed(2)}–{physics.outer.toFixed(2)} AU). Dashed bar on the zone ruler.
        </p>
      )}
      {related.length ? (
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-subtle">
            <tr>
              <th className="py-1">Playfield</th>
              <th className="py-1">Kind</th>
              <th className="py-1">Sectors</th>
              <th className="py-1">AU</th>
              <th className="py-1">Zone</th>
              <th className="py-1">Solar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {related.map((body) => {
              const z = zoneAtDistance(star, body.distance);
              const f = solarFlux(L, body.distance);
              return (
                <tr
                  key={`${body.system}-${body.name}`}
                  className={hover === body.name ? "bg-elevated" : undefined}
                  onPointerEnter={() => setHover(body.name)}
                  onPointerLeave={() => setHover(null)}
                >
                  <td className="py-1.5">{body.name}</td>
                  <td className="py-1.5 text-muted">{body.kind}</td>
                  <td className="py-1.5 font-mono text-xs">{body.distance.toFixed(1)}</td>
                  <td className="py-1.5 font-mono text-xs">{sectorsToAu(body.distance).toFixed(2)}</td>
                  <td className="py-1.5">{z?.label || (body.distance > max ? "off-scale" : "—")}</td>
                  <td className="py-1.5 font-mono text-xs">{fluxLabel(f)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="mt-3 text-xs text-subtle">
          Import Sectors.yaml to overlay planet distances on this star. Playfield coords are sectors from the local sun.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-bg p-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
