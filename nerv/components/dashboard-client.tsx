"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  DataGrid,
  Gauge,
  BarChart,
  PieChart,
  TerminalDisplay,
  SyncRatioChart,
  SyncProgressBar,
  MonitorOverlay,
  PhaseStatusStack,
  PatternAlert,
  SeeleMonolith,
  GradientStatusBar,
  EmergencyBanner,
  SegmentDisplay,
  Divider,
  useToast,
  type MagiVote,
} from "@mdrbx/nerv-ui";
import type { Snapshot } from "@/lib/snapshot";

const MagiViz = dynamic(() => import("./magi-viz").then((m) => m.MagiViz), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-16 text-center font-mono text-xs text-nerv-mid-gray">
      INITIALIZING MAGI VIEWPORT…
    </div>
  ),
});

const displayFont = { fontFamily: "var(--font-nerv-display)" };

function glowFor(color: string): string {
  if (color.includes("cyan")) return "nerv-text-shadow-cyan";
  if (color.includes("red")) return "nerv-text-shadow-red";
  if (color.includes("green")) return "nerv-text-shadow-green";
  return "nerv-text-shadow-orange";
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  // hud-style frame: radial sheen + hairline glow ring, same as the example deck.
  return (
    <div
      className="border border-nerv-mid-gray/70 backdrop-blur-sm"
      style={{
        background: "radial-gradient(circle at top left, rgba(255,153,0,0.10) 0%, transparent 56%), #000000",
        boxShadow: "0 0 0 1px rgba(255,153,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 18px rgba(255,153,0,0.10)",
      }}
    >
      <div className="px-1 py-2 text-center">
        <div className={`font-mono text-xl font-black sm:text-2xl ${color} ${glowFor(color)}`}>{value}</div>
        <div
          className="mt-1 text-xs uppercase tracking-wider text-nerv-mid-gray"
          style={displayFont}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

interface SelectProps {
  id: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

/** Clickable section title — selected sections glow. */
function SectionTitle({
  id,
  selected,
  onSelect,
  children,
}: SelectProps & { children: React.ReactNode }) {
  const on = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(on ? null : id)}
      className="flex cursor-pointer items-center gap-2 text-left"
    >
      <span
        className={`h-1.5 w-1.5 transition-all ${on ? "bg-nerv-orange shadow-[0_0_8px_#FF9900]" : "bg-nerv-mid-gray/60"}`}
      />
      <span
        className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${on ? "nerv-text-shadow-orange text-nerv-orange" : "text-nerv-orange/75 hover:text-nerv-orange"}`}
        style={displayFont}
      >
        {children}
      </span>
    </button>
  );
}

/** Clickable full-width section header strip — selected strips glow. */
function SectionHead({
  id,
  selected,
  onSelect,
  title,
  legend,
}: SelectProps & { title: string; legend?: React.ReactNode }) {
  const on = selected === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(on ? null : id)}
      className={`flex w-full cursor-pointer items-center justify-between border-b border-nerv-mid-gray/30 px-4 py-1.5 text-left transition-colors ${
        on ? "bg-nerv-orange/15" : "bg-nerv-dark-gray hover:bg-nerv-panel"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 transition-all ${on ? "bg-nerv-orange shadow-[0_0_8px_#FF9900]" : "bg-nerv-mid-gray/60"}`}
        />
        <span
          className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${on ? "nerv-text-shadow-orange text-nerv-orange" : "text-nerv-orange/80"}`}
          style={displayFont}
        >
          {title}
        </span>
      </span>
      {legend}
    </button>
  );
}

const monoFont = { fontFamily: "var(--font-nerv-mono)" };

const CHANNEL_ACCENTS = ["#00F6FF", "#FF9900", "#7FFF9F", "#00F6FF", "#FF9900", "#7FFF9F", "#00F6FF"];

const SERVICE_PORTS: Record<string, string> = {
  bancho: ":7777",
  forlorn: ":3030",
  omajinai: ":1994",
  mist: ":7273",
  assets: ":9929",
  updater: ":1272",
  beatmap: ":3700",
};

function endpointFor(name: string): string {
  return `LOCALHOST${SERVICE_PORTS[name] ?? ""}`;
}

/** Surveillance-style subject channel for one service. */
function ServiceChannel({
  index,
  name,
  endpoint,
  up,
  ms,
  now,
}: {
  index: number;
  name: string;
  endpoint: string;
  up: boolean;
  ms: number;
  now: string;
}) {
  const accent = up ? CHANNEL_ACCENTS[index % CHANNEL_ACCENTS.length] : "#FF2B1D";
  const signal = up ? Math.max(8, Math.min(100, 100 - ms / 20)) : 4;
  const designation = `SVC-${String(index).padStart(2, "0")}`;
  return (
    <div
      className="relative min-h-[15rem] overflow-hidden bg-black"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}55, 0 0 24px ${accent}22` }}
    >
      {/* animated drifting texture */}
      <div className="feed-texture absolute inset-0" />
      {/* accent tint + vignette */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${accent}2E, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.85))` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.10),transparent_42%)]" />

      <MonitorOverlay
        color={up ? "cyan" : "red"}
        density="dense"
        opacity={0.6}
        animated
        label={designation}
        secondaryLabel={now}
      />

      <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.78rem] uppercase tracking-[0.12em]" style={{ ...displayFont, color: accent }}>
            {designation}
          </div>
          <div
            className="nerv-text-shadow-green mt-1 text-[1.35rem] uppercase leading-none tracking-[0.08em]"
            style={{ ...displayFont, color: up ? "#7FFF9F" : "#FF2B1D" }}
          >
            {name}
          </div>
        </div>
        <div
          className="border px-2 py-1 text-right text-[9px] uppercase tracking-[0.16em]"
          style={{
            ...monoFont,
            color: up ? accent : "#FF9900",
            borderColor: up ? `${accent}55` : "rgba(255,153,0,0.5)",
            backgroundColor: "rgba(0,0,0,0.58)",
          }}
        >
          <div>FEED {up ? "HELD" : "LOST"}</div>
          <div className="mt-1 opacity-70">{up ? `${ms}MS` : "NO CARRIER"}</div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="grid gap-2">
          <div
            className="flex items-center justify-between border px-2 py-1 text-[10px] uppercase tracking-[0.15em]"
            style={{ ...monoFont, color: "#FF7AB9", borderColor: "rgba(255,122,185,0.35)", backgroundColor: "rgba(16,0,18,0.6)" }}
          >
            <span>{endpoint}</span>
            <span>{up ? `${ms}MS` : "DOWN"}</span>
          </div>
          <div className="h-3 overflow-hidden border" style={{ borderColor: `${accent}55`, backgroundColor: "rgba(0,0,0,0.72)" }}>
            <div
              className="h-full transition-[width] duration-1000"
              style={{
                width: `${signal}%`,
                backgroundColor: up ? "#7FFF9F" : "#FF2B1D",
                backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.38) 8px, rgba(0,0,0,0.38) 10px)",
              }}
            />
          </div>
        </div>
        <div
          className="flex min-w-[5.5rem] items-center justify-center border px-2 py-1 text-center text-[0.95rem] uppercase tracking-[0.08em]"
          style={{
            ...displayFont,
            color: up ? "#FF7AB9" : "#FF2B1D",
            borderColor: up ? "rgba(255,122,185,0.35)" : "rgba(255,43,29,0.5)",
            backgroundColor: "rgba(0,0,0,0.68)",
          }}
        >
          {up ? "CHECK O.K." : "CHECK ALT"}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ initial, operator }: { initial: Snapshot; operator: string }) {
  const [snap, setSnap] = useState<Snapshot>(initial);
  const [clockSeconds, setClockSeconds] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const { addToast } = useToast();
  const prevFlags = useRef(initial.totals.openFlags);
  const prevScores = useRef(initial.totals.scores);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockSeconds(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/nerv/api/snapshot", { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as Snapshot;
        if (next.totals.openFlags > prevFlags.current) {
          addToast({
            message: `NEW FLAG: ${next.latestFlags[0]?.kind ?? "unknown"} — ${next.latestFlags[0]?.username ?? "?"}`,
            variant: "warning",
          });
        }
        if (next.totals.scores > prevScores.current) {
          const s = next.latestScores[0];
          if (s) addToast({ message: `SCORE #${s.id} ${s.username} ${s.pp}pp`, variant: "info" });
        }
        prevFlags.current = next.totals.openFlags;
        prevScores.current = next.totals.scores;
        setSnap(next);
      } catch {
        // backend blip — keep last frame
      }
    }, 12000);
    return () => clearInterval(id);
  }, [addToast]);

  const down = snap.services.filter((s) => !s.up);
  const isEmergency = down.length > 0;
  const threat = Math.min(100, snap.totals.openFlags * 4 + down.length * 25);

  const majorFrameBorder = isEmergency ? "border-alert-red" : "border-nerv-orange/45";
  const sectionDivider = isEmergency ? "border-alert-red/60" : "border-nerv-mid-gray/70";

  const votes: MagiVote[] = [
    { name: "MELCHIOR 1", status: snap.services[0]?.up ? "accepted" : "rejected" },
    { name: "BALTHASAR 2", status: snap.services[1]?.up ? "accepted" : "rejected" },
    { name: "CASPER 3", status: snap.services[5]?.up ? "accepted" : "rejected" },
  ];

  const scores24hTotal = snap.scores24h.reduce((a, b) => a + b.value, 0);
  const activity = Math.min(1, scores24hTotal / 200);
  const topPp = Math.max(1, ...snap.topPlayers.map((p) => p.pp));
  const p2 = (n: number) => String(n).padStart(2, "0");
  const clockLabel = `${p2(Math.floor(clockSeconds / 3600))}:${p2(Math.floor((clockSeconds / 60) % 60))}:${p2(clockSeconds % 60)}`;

  const logLines = [
    ...snap.latestScores.map(
      (s) => `SCORE #${s.id} ${s.username} ${s.pp}pp ${s.acc.toFixed(2)}% mode=${s.mode}${s.grade ? ` [${s.grade}]` : ""}`
    ),
    ...snap.latestFlags.map((f) => `FLAG ${f.kind} ${f.username} score #${f.score_id} :: ${f.reason}`),
    ...snap.newestUsers.map((u) => `REGISTER ${u.name} [#${u.id}] (${u.country})`),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full overflow-x-hidden transition-colors duration-500"
      style={{ backgroundColor: isEmergency ? "#1A0000" : "#000000" }}
    >
      {isEmergency && (
        <EmergencyBanner
          text="EMERGENCY"
          subtext={`${down.map((s) => s.name.toUpperCase()).join(" · ")} OFFLINE`}
          visible
          severity="emergency"
        />
      )}

      {/* HEADER — compact command bar */}
      <header className={`w-full border-b-2 ${majorFrameBorder} bg-bg-base`}>
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 lg:flex-row">
          <div className="shrink-0 text-center lg:text-left">
            <h1
              className="nerv-text-shadow-orange text-3xl font-black uppercase leading-none text-white sm:text-4xl"
              style={{ ...displayFont, letterSpacing: "-0.02em" }}
            >
              NERV
            </h1>
            <p
              className="text-xs uppercase tracking-[0.35em] text-nerv-mid-gray"
              style={displayFont}
            >
              OPERATIONS CONSOLE
            </p>
          </div>

          <code className="whitespace-nowrap border border-nerv-cyan/30 bg-nerv-black/60 px-3 py-1.5 font-mono text-xs text-nerv-cyan shadow-[0_0_16px_rgba(0,246,255,0.15)]">
            OPERATOR {operator.toUpperCase()} // {snap.online.count} ACTIVE
          </code>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
            <SegmentDisplay value={clockSeconds} format="H:MM:SS" color="orange" size="sm" />
            <a href="/nerv/flags">
              <Button variant="primary" size="sm">
                FLAGS{snap.totals.openFlags ? ` [${snap.totals.openFlags}]` : ""}
              </Button>
            </a>
            <a href="/nerv/live">
              <Button variant="terminal" size="sm">
                LIVE OPS
              </Button>
            </a>
            <a href="/nerv/beatmaps">
              <Button variant="ghost" size="sm">
                MAPS
              </Button>
            </a>
            <a href="/nerv/api/logout">
              <Button variant="danger" size="sm">
                LOGOUT
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* STATUS BAR — thin info strip */}
      <div
        className={`flex flex-col items-center justify-between gap-2 border-b px-4 py-1.5 sm:flex-row ${sectionDivider} ${
          isEmergency ? "bg-nerv-red/10" : "bg-nerv-dark-gray"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 ${isEmergency ? "animate-pulse bg-nerv-red shadow-[0_0_10px_#FF0000]" : "bg-nerv-orange shadow-[0_0_10px_#FF9900]"}`} />
          <span
            className={`nerv-text-shadow-orange text-xs font-bold uppercase tracking-[0.2em] ${isEmergency ? "text-nerv-red" : "text-nerv-orange"}`}
            style={displayFont}
          >
            {isEmergency ? "CONDITION RED" : "COMMAND GRID STABLE"}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-nerv-white/60">
          <span>USERS {snap.totals.users}</span>
          <span>SCORES {snap.totals.scores}</span>
          <span>RANKED {snap.totals.rankedMaps}</span>
          <span className="nerv-text-shadow-red text-nerv-red">RESTRICTED {snap.totals.restricted}</span>
        </div>
      </div>

      {/* ROW 1 — KPI strip */}
      <section className={`border-b ${sectionDivider} px-4 py-4`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="ONLINE" value={String(snap.online.count)} color="text-nerv-cyan" />
          <KpiCard label="SCORES 24H" value={String(scores24hTotal)} color="text-nerv-orange" />
          <KpiCard
            label="OPEN FLAGS"
            value={String(snap.totals.openFlags)}
            color={snap.totals.openFlags ? "text-nerv-red" : "text-nerv-orange"}
          />
          <KpiCard label="SERVICES UP" value={`${snap.services.length - down.length}/${snap.services.length}`} color="text-nerv-cyan" />
          <KpiCard label="TELEMETRY 24H" value={String(snap.perf.reports24h)} color="text-nerv-orange" />
          <KpiCard label="KEY SYSTEMS" value={`${votes.filter((v) => v.status === "accepted").length}/3`} color="text-nerv-magenta" />
        </div>
      </section>

      {/* ROW 2 — main monitoring grid */}
      <main className={`grid grid-cols-1 gap-0 border-b lg:grid-cols-12 ${majorFrameBorder}`}>
        {/* LEFT (4): pilots + phases + seele */}
        <div className={`col-span-full flex flex-col gap-4 p-3 lg:col-span-4 lg:border-r ${sectionDivider}`}>
          <SectionTitle id="pilots" selected={selected} onSelect={setSelected}>TOP PILOTS // PP</SectionTitle>
          {snap.topPlayers.length ? (
            snap.topPlayers.map((p, i) => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-xs text-nerv-mid-gray">
                  <span>#{i + 1} {p.pp}PP</span>
                  <span className="text-nerv-cyan">{p.name}</span>
                </div>
                <SyncProgressBar value={Math.round((p.pp / topPp) * 100)} label={`${p.name} // ${p.plays} PLAYS ${p.acc.toFixed(2)}%`} blocks={15} />
              </div>
            ))
          ) : (
            <p className="font-mono text-xs text-nerv-mid-gray">NO RANKED PILOTS</p>
          )}

          <Divider color="orange" variant="dashed" />

          <PhaseStatusStack
            title="REQUEST PIPELINE"
            color="orange"
            phases={[
              { label: "BANCHO SESSION", status: snap.services[0]?.up ? "ok" : "danger", value: snap.services[0]?.up ? `${snap.services[0].ms}MS` : "DOWN" },
              { label: "SCORE INTAKE", status: snap.services[1]?.up ? "ok" : "danger", value: snap.services[1]?.up ? `${snap.services[1].ms}MS` : "DOWN" },
              { label: "PP COMPUTE", status: snap.services[2]?.up ? "ok" : "danger", value: snap.services[2]?.up ? `${snap.services[2].ms}MS` : "DOWN" },
              { label: "PUBLIC API", status: snap.services[3]?.up ? "ok" : "danger", value: snap.services[3]?.up ? `${snap.services[3].ms}MS` : "DOWN" },
              { label: "ASSET DELIVERY", status: snap.services[4]?.up && snap.services[5]?.up ? "ok" : "warning", value: "CDN" },
              { label: "BEATMAP MIRROR", status: snap.services[6]?.up ? "ok" : "danger", value: snap.services[6]?.up ? `${snap.services[6].ms}MS` : "DOWN" },
            ]}
          />

          <Divider color="orange" variant="dashed" />

          <SectionTitle id="seele" selected={selected} onSelect={setSelected}>SEELE UPLINK // LIVE OPS</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {snap.services.map((s, i) => (
              <a
                key={s.name}
                href="/nerv/live"
                title={`${s.name.toUpperCase()} — ${s.up ? `${s.ms}MS` : "DOWN"}`}
              >
                <SeeleMonolith id={String(i + 1).padStart(2, "0")} isSpeaking={!s.up} />
              </a>
            ))}
          </div>
        </div>

        {/* CENTER (5): magi viewport + waveform + threat */}
        <div className={`col-span-full flex flex-col lg:col-span-5 lg:border-r ${sectionDivider}`}>
          <div className={`flex min-h-[200px] flex-col border-b lg:min-h-[280px] ${sectionDivider}`}>
            <SectionHead
              id="magi"
              selected={selected}
              onSelect={setSelected}
              title="MAGI YIELD TOPOLOGY"
              legend={
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-nerv-cyan shadow-[0_0_6px_#00F6FF]" />
                    <span className="text-nerv-cyan">MESH</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-nerv-orange shadow-[0_0_6px_#FF9900]" />
                    <span className="text-nerv-orange">FLOW</span>
                  </span>
                </div>
              }
            />
            <MagiViz activity={activity} online={snap.online.count} emergency={isEmergency} height={380} />
            <div className="flex justify-between px-4 py-1 font-mono text-[11px] text-nerv-white/50">
              <span>THROUGHPUT {(activity * 100).toFixed(0)}%</span>
              <span>SCORES/24H {scores24hTotal}</span>
            </div>
          </div>

          <div className={`flex min-h-[200px] flex-col border-b lg:min-h-[240px] ${sectionDivider}`}>
            <SectionHead
              id="waveform"
              selected={selected}
              onSelect={setSelected}
              title="HARMONIC WAVEFORM"
              legend={
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-nerv-cyan shadow-[0_0_6px_#00F6FF]" />
                    <span className="text-nerv-cyan">DATA-BLUE</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-0.5 w-3 bg-nerv-magenta shadow-[0_0_6px_#FF00FF]" />
                    <span className="text-nerv-magenta">MAGENTA</span>
                  </span>
                </div>
              }
            />
            <div className="flex-1">
              <SyncRatioChart
                showGrid
                animated
                frequencyA={0.04 + activity * 0.05}
                frequencyB={0.055 + snap.online.count * 0.002}
                amplitudeA={50}
                amplitudeB={40}
                speed={0.6 + activity}
              />
            </div>
          </div>

          <div className="p-3">
            <GradientStatusBar
              value={threat}
              label="THREAT ASSESSMENT"
              sublabel={`${snap.totals.openFlags} OPEN FLAGS · ${down.length} DOWN`}
              color={threat > 50 ? "red" : "cyan"}
              zones={[
                { start: 0, end: 30, color: "#00FF00", label: "LOW" },
                { start: 30, end: 60, color: "#FF9900", label: "MED" },
                { start: 60, end: 80, color: "#FF4400", label: "HIGH" },
                { start: 80, end: 100, color: "#FF0000", label: "CRIT" },
              ]}
            />
          </div>
        </div>

        {/* RIGHT (3): gauges + grades */}
        <div className="col-span-full flex flex-col gap-4 p-3 lg:col-span-3">
          <SectionTitle id="gauges" selected={selected} onSelect={setSelected}>SYSTEM GAUGES</SectionTitle>
          <div className="flex flex-row flex-wrap items-center justify-around gap-4 lg:flex-col">
            <Gauge label="ONLINE" value={snap.online.count} max={100} color="green" size={110} showTicks />
            <Gauge label="SCORES 24H" value={Math.min(100, scores24hTotal)} max={100} color="cyan" size={110} showTicks />
            <Gauge
              label="AVG FRAMETIME"
              value={Math.min(100, snap.perf.avgFrametime * 2)}
              max={100}
              unit="ms"
              color={snap.perf.avgFrametime > 25 ? "red" : "orange"}
              threshold={50}
              size={110}
              showTicks
            />
            <Gauge label="COMPLETION" value={snap.perf.completionRate || 0} max={100} unit="%" color="green" size={110} showTicks />
          </div>

          <Divider color="cyan" variant="dashed" />

          {snap.grades.length ? (
            <PieChart
              slices={snap.grades.map((g) => ({ label: g.grade, value: g.count }))}
              title="GRADE SPLIT"
              size={160}
              donut
              showLegend
              showLabels
              color="orange"
            />
          ) : (
            <p className="font-mono text-xs text-nerv-mid-gray">NO GRADED SCORES YET</p>
          )}
        </div>
      </main>

      {/* ROW 3 — scores table, full width */}
      <section className={`border-b ${majorFrameBorder}`}>
        <SectionHead
          id="scores-table"
          selected={selected}
          onSelect={setSelected}
          title={`LATEST SCORES // ${snap.latestScores.length} SHOWN`}
        />
        {snap.latestScores.length ? (
          <DataGrid
            columns={[
              { key: "id", header: "SCORE", type: "int", sortable: true },
              { key: "username", header: "PLAYER", sortable: true },
              { key: "pp", header: "PP", type: "int", sortable: true },
              { key: "grade", header: "GRADE", align: "center" },
              { key: "mode", header: "MODE", align: "center" },
            ]}
            data={snap.latestScores.map((s) => ({
              id: s.id,
              username: s.username,
              pp: s.pp,
              grade: s.grade ?? "-",
              mode: s.mode,
            }))}
            color="cyan"
            maxHeight="420px"
          />
        ) : (
          <p className="p-3 font-mono text-xs text-nerv-mid-gray">NO SCORES ON RECORD</p>
        )}
      </section>

      {/* ROW 4 — service channels */}
      <section className={`border-b ${majorFrameBorder}`}>
        <SectionHead
          id="service-grid"
          selected={selected}
          onSelect={setSelected}
          title={`SERVICE GRID // ${snap.services.length - down.length}/${snap.services.length} NOMINAL`}
        />
        <div className="grid grid-cols-1 gap-px bg-nerv-mid-gray/40 sm:grid-cols-2 lg:grid-cols-4">
          {snap.services.map((s, i) => (
            <ServiceChannel
              key={s.name}
              index={i}
              name={s.name}
              endpoint={endpointFor(s.name)}
              up={s.up}
              ms={s.ms}
              now={clockLabel}
            />
          ))}
        </div>
      </section>

      {/* ROW 5 — distribution charts */}
      <section className={`border-b ${majorFrameBorder}`}>
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
          <div className={`col-span-full p-3 lg:col-span-4 lg:border-r ${sectionDivider}`}>
            <SectionTitle id="modes" selected={selected} onSelect={setSelected}>SCORES BY MODE</SectionTitle>
            <div className="mt-2">
              {snap.perMode.length ? (
                <BarChart
                  bars={snap.perMode.map((m) => ({ label: `M${m.mode}`, value: m.count }))}
                  color="orange"
                  direction="horizontal"
                  showValues
                  height={220}
                  stagger={0.02}
                />
              ) : (
                <p className="font-mono text-xs text-nerv-mid-gray">NO MODE DATA</p>
              )}
            </div>
          </div>
          <div className={`col-span-full p-3 lg:col-span-4 lg:border-r ${sectionDivider}`}>
            <SectionTitle id="enlist" selected={selected} onSelect={setSelected}>ENLISTMENT // 7D</SectionTitle>
            <div className="mt-2 overflow-hidden">
              <BarChart
                bars={snap.regs7d.map((r) => ({ label: r.label, value: r.value }))}
                color="green"
                showGrid
                height={220}
                stagger={0.03}
              />
            </div>
          </div>
          <div className="col-span-full p-3 lg:col-span-4">
            <SectionTitle id="origin" selected={selected} onSelect={setSelected}>ORIGIN // TOP COUNTRIES</SectionTitle>
            <div className="mt-2">
              {snap.countries.length ? (
                <BarChart
                  bars={snap.countries.map((c) => ({ label: c.country, value: c.count }))}
                  color="magenta"
                  direction="horizontal"
                  showValues
                  height={220}
                />
              ) : (
                <p className="font-mono text-xs text-nerv-mid-gray">NO DATA</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ROW 6 — flags + arrivals + perf */}
      <section className={`border-b ${majorFrameBorder}`}>
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
          <div className={`col-span-full lg:col-span-5 lg:border-r ${sectionDivider}`}>
            <SectionHead
              id="flags"
              selected={selected}
              onSelect={setSelected}
              title={`FLAG QUEUE // ${snap.totals.openFlags} OPEN`}
            />
            {snap.latestFlags.length ? (
              <DataGrid
                columns={[
                  { key: "score_id", header: "SCORE", type: "int" },
                  { key: "username", header: "PLAYER" },
                  { key: "kind", header: "KIND" },
                ]}
                data={snap.latestFlags.map((f) => ({
                  score_id: f.score_id,
                  username: f.username,
                  kind: f.kind,
                }))}
                color="orange"
                maxHeight="300px"
              />
            ) : (
              <p className="p-3 font-mono text-xs text-nerv-mid-gray">QUEUE EMPTY — ALL CLEAR</p>
            )}
            <div className={`border-t p-3 ${sectionDivider}`}>
              <SectionTitle id="arrivals" selected={selected} onSelect={setSelected}>NEW ARRIVALS</SectionTitle>
              <div className="mt-2 flex flex-col gap-1 font-mono text-xs">
                {snap.newestUsers.length ? (
                  snap.newestUsers.map((u) => (
                    <div key={u.id}>
                      <span className="text-nerv-cyan">{u.name}</span>{" "}
                      <span className="text-nerv-mid-gray">[{u.id}] {u.country}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-nerv-mid-gray">NO USERS</span>
                )}
              </div>
            </div>
          </div>

          <div className={`col-span-full p-3 lg:col-span-4 lg:border-r ${sectionDivider}`}>
            <SectionTitle id="caps" selected={selected} onSelect={setSelected}>CLIENT CAPS // {snap.perf.reports24h} RPTS</SectionTitle>
            <div className="mt-2">
              {snap.perf.fpsCaps.length ? (
                <BarChart
                  bars={snap.perf.fpsCaps.map((f) => ({ label: f.label, value: f.value }))}
                  color="green"
                  direction="horizontal"
                  showValues
                  height={160}
                />
              ) : (
                <p className="font-mono text-xs text-nerv-mid-gray">NO TELEMETRY IN 24H</p>
              )}
            </div>
            <div className="mt-2 font-mono text-[11px] text-nerv-white/50">
              SPIKE FRAMES/24H: {snap.perf.totalSpikes}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <SyncProgressBar label="COMPLETION RATE" value={snap.perf.completionRate || 0} showPercentage blocks={24} />
              <SyncProgressBar
                label="RESTRICTED SHARE"
                value={snap.totals.users ? (snap.totals.restricted / snap.totals.users) * 100 : 0}
                showPercentage
                blocks={24}
              />
            </div>
          </div>

          <div className="col-span-full p-3 lg:col-span-3">
            <SectionTitle id="maps" selected={selected} onSelect={setSelected}>MOST DEPLOYED MAPS</SectionTitle>
            <div className="mt-2">
              {snap.topMaps.length ? (
                <BarChart
                  bars={snap.topMaps.map((m) => ({ label: m.title.slice(0, 18), value: m.plays }))}
                  color="orange"
                  direction="horizontal"
                  showValues
                  height={160}
                  segmented
                />
              ) : (
                <p className="font-mono text-xs text-nerv-mid-gray">NO PLAYS ON RECORD</p>
              )}
            </div>
            <div className="mt-3">
              <SectionTitle id="online" selected={selected} onSelect={setSelected}>ONLINE NOW // {snap.online.count}</SectionTitle>
              <div className="mt-2 font-mono text-xs">
                {snap.online.names.length ? (
                  snap.online.names.map((n) => <div key={n}>{n}</div>)
                ) : (
                  <span className="text-nerv-mid-gray">NOBODY ONLINE</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 7 — event log */}
      <section>
        <SectionHead
          id="log"
          selected={selected}
          onSelect={setSelected}
          title={`OPERATIONS LOG // ${logLines.length} ENTRIES · LIVE`}
        />
        <TerminalDisplay
          lines={logLines.length ? logLines : ["silence. nothing happened yet."]}
          color="green"
        />
      </section>

      {/* FOOTER */}
      <footer className="flex items-center justify-between border-t border-nerv-mid-gray/70 bg-nerv-dark-gray px-4 py-2 font-mono text-[11px] text-nerv-mid-gray">
        <span>
          SNAPSHOT {new Date(snap.at).toLocaleTimeString()} // OPERATOR {operator.toUpperCase()}
        </span>
        <span>GOD&apos;S IN HIS HEAVEN. ALL&apos;S RIGHT WITH THE WORLD.</span>
      </footer>
    </motion.div>
  );
}
