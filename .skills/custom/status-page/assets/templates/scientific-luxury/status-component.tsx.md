# Status Page Component -- Scientific Luxury

> React status page with OLED black background, spectral colour indicators, Framer Motion animations, and per-service status display for NodeJS-Starter-V1.

---

## StatusPage Component

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ServiceEntry {
  name: string;
  status: string;
  latencyMs: number | null;
  uptimePercent: number;
}

interface IncidentEntry {
  id: string;
  title: string;
  severity: string;
  status: string;
  updates: { status: string; message: string; created_at: string }[];
  started_at: string;
  resolved_at: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  operational: "#00FF88",     // Emerald
  degraded: "#FFB800",       // Amber
  partial_outage: "#FF4444", // Red
  major_outage: "#FF4444",   // Red
  maintenance: "#00F5FF",    // Cyan
};

const STATUS_LABELS: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Under Maintenance",
};

function StatusIndicator({ status }: { status: string }) {
  const colour = STATUS_COLOURS[status] ?? "#FFB800";
  return (
    <div className="relative h-3 w-3">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: colour,
          animation: status === "operational" ? "none" : "pulse 2s ease-in-out infinite",
        }}
      />
      {status !== "operational" && (
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{ backgroundColor: colour, animation: "ping 2s ease-in-out infinite" }}
        />
      )}
    </div>
  );
}

export function StatusPage() {
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [overall, setOverall] = useState("operational");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services);
        setOverall(data.overall_status);
        setIncidents(data.active_incidents ?? []);
        setLastUpdated(data.last_updated);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-white/90">
      <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        {/* Overall Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 border-b border-white/[0.06] pb-6"
        >
          <StatusIndicator status={overall} />
          <h1 className="text-lg">
            {overall === "operational" ? "All Systems Operational" : "Service Disruption"}
          </h1>
        </motion.div>

        {/* Service List */}
        <div className="space-y-1">
          {services.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between border-b border-white/[0.03] py-3"
            >
              <div className="flex items-center gap-3">
                <StatusIndicator status={svc.status} />
                <span className="text-sm text-white/70">{svc.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                {svc.latencyMs !== null && <span>{svc.latencyMs}ms</span>}
                <span>{svc.uptimePercent.toFixed(2)}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Incidents */}
        {incidents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xs uppercase tracking-[0.3em] text-white/30">
              Active Incidents
            </h2>
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-sm border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="text-xs uppercase"
                    style={{
                      color: incident.severity === "critical"
                        ? "#FF4444"
                        : incident.severity === "major"
                          ? "#FFB800"
                          : "#00F5FF",
                    }}
                  >
                    {incident.severity}
                  </span>
                  <span className="text-white/70">{incident.title}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {incident.updates.map((update, j) => (
                    <div key={j} className="text-xs text-white/40">
                      <span className="uppercase text-white/30">{update.status}</span>
                      {" - "}
                      {update.message}
                      <span className="ml-2 text-white/20">
                        {new Date(update.created_at).toLocaleString("en-AU")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-xs text-white/20">
          {lastUpdated && (
            <span>Last updated: {new Date(lastUpdated).toLocaleString("en-AU")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
```
