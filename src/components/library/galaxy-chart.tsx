import { useMemo, useState } from "react";
import type { EcfObject } from "@/lib/pda/ecf.ts";
import {
  axisMax,
  auToSectors,
  bodiesForStar,
  fluxLabel,
  luminosityOf,
  physicsHabitableAU,
  rgbFromField,
  sectorsToAu,
  solarAdvice,
  solarFlux,
  starZoneSpans,
  zoneAtDistance,
  zoneWarnings,
  type SystemBody,
} from "@/lib/pda/galaxy.ts";

export function GalaxyStarChart({ star, bodies }: { star: EcfObject; bodies: SystemBody[] }) {
  const L = luminosityOf(star);
  const spans = starZoneSpans(star);
  const related = bodiesForStar(star, bodies);
  const max = axisMax(star, related);
  const physics = physicsHabitableAU(L);
  const warnings = zoneWarnings(star);
  const [probe, setProbe] = useState(() => {
    const temp = spans.find((s) => s.key === "HabitableTemperate");
    return temp ? Math.round((temp.min + temp.max) / 2) : Math.round(max * 0.4);
  });
  const flux = solarFlux(L, probe);
  const zone = zoneAtDistance(star, probe);
  const color = rgbFromField(star.fields.Color || star.fields.LightColor);
  const w = 720;
  const bandH = 56;
  const fluxH = 110;
  const pad = { l: 44, r: 16, t: 18, b: 28 };
  const innerW = w - pad.l - pad.r;
  const x = (sectors: number) => pad.l + (Math.max(0, Math.min(sectors, max)) / max) * innerW;

  const fluxPts = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const sectors = (i / 40) * max;
      const f = solarFlux(L, Math.max(sectors, 0.2));
      const log = Math.log10(Math.max(f, 0.001));
      const y = pad.t + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
      pts.push({ x: x(sectors), y: Math.max(pad.t, Math.min(pad.t + fluxH, y)) });
    }
    return pts;
  }, [L, max]);

  const earthY = (() => {
    const log = Math.log10(1);
    return pad.t + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
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
            Game ranges are in sectors (10 sectors = 1 AU). Dashed band is physics HZ from luminosity, √L × 0.95–1.67 AU.
          </p>
        </div>
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

      <svg viewBox={`0 0 ${w} ${pad.t + bandH + 36 + pad.t + fluxH + pad.b}`} className="mt-3 w-full">
        <circle cx={22} cy={pad.t + bandH / 2} r={10} fill={color} />
        {spans.map((span) => (
          <g key={span.key}>
            <rect
              x={x(span.min)}
              y={pad.t}
              width={Math.max(2, x(span.max) - x(span.min))}
              height={bandH}
              fill={span.color}
              opacity={0.35}
            />
            <text x={x((span.min + span.max) / 2)} y={pad.t + 16} textAnchor="middle" fill="#9aa3b2" fontSize="10">
              {span.label}
            </text>
            <text x={x((span.min + span.max) / 2)} y={pad.t + 30} textAnchor="middle" fill="#6b7280" fontSize="9">
              {span.min}–{span.max}
            </text>
          </g>
        ))}
        <rect
          x={x(auToSectors(physics.inner))}
          y={pad.t + bandH - 8}
          width={Math.max(2, x(auToSectors(physics.outer)) - x(auToSectors(physics.inner)))}
          height={8}
          fill="none"
          stroke="#f8fafc"
          strokeDasharray="4 3"
          opacity={0.85}
        />
        {related.map((body) => (
          <g key={`${body.system}-${body.name}`}>
            <line x1={x(body.distance)} x2={x(body.distance)} y1={pad.t} y2={pad.t + bandH} stroke="#e2e8f0" strokeWidth={1.5} />
            <text
              x={x(body.distance)}
              y={pad.t + bandH + 14}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="10"
            >
              {body.name}
            </text>
          </g>
        ))}
        <line x1={x(probe)} x2={x(probe)} y1={pad.t} y2={pad.t + bandH} stroke="#fbbf24" strokeWidth={2} />
        <text x={pad.l} y={pad.t + bandH + 32} fill="#6b7280" fontSize="10">
          0 sec / 0 AU
        </text>
        <text x={w - pad.r} y={pad.t + bandH + 32} textAnchor="end" fill="#6b7280" fontSize="10">
          {max.toFixed(0)} sec · {sectorsToAu(max).toFixed(1)} AU
        </text>

        <g transform={`translate(0, ${pad.t + bandH + 40})`}>
          <text x={8} y={pad.t} fill="#6b7280" fontSize="10">
            flux
          </text>
          <line x1={pad.l} x2={w - pad.r} y1={earthY} y2={earthY} stroke="#4ade80" strokeDasharray="3 3" opacity={0.6} />
          <text x={w - pad.r} y={earthY - 4} textAnchor="end" fill="#4ade80" fontSize="9">
            1× Earth
          </text>
          <polyline
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            points={fluxPts.map((p) => `${p.x},${p.y}`).join(" ")}
          />
          {related.map((body) => {
            const f = solarFlux(L, body.distance);
            const log = Math.log10(Math.max(f, 0.001));
            const y = pad.t + fluxH - ((log - Math.log10(0.001)) / (Math.log10(20) - Math.log10(0.001))) * fluxH;
            return <circle key={`f-${body.name}`} cx={x(body.distance)} cy={Math.max(pad.t, Math.min(pad.t + fluxH, y))} r={3} fill="#e2e8f0" />;
          })}
        </g>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="Probe" value={`${probe} sec · ${sectorsToAu(probe).toFixed(2)} AU`} />
        <Stat label="Game zone" value={zone ? `${zone.label} (${zone.hint})` : "Outside defined bands"} />
        <Stat label="Solar vs Earth" value={`${fluxLabel(flux)} · ${solarAdvice(flux)}`} />
      </div>
      {warnings.length ? (
        <ul className="mt-3 space-y-1 text-xs text-warn">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
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
                <tr key={`${body.system}-${body.name}`}>
                  <td className="py-1.5">{body.name}</td>
                  <td className="py-1.5 text-muted">{body.kind}</td>
                  <td className="py-1.5 font-mono text-xs">{body.distance.toFixed(1)}</td>
                  <td className="py-1.5 font-mono text-xs">{sectorsToAu(body.distance).toFixed(2)}</td>
                  <td className="py-1.5">{z?.label || "—"}</td>
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
