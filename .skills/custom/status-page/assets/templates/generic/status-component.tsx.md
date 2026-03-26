# Status Page Component -- Generic

> Framework-agnostic React status page component. No design system dependency. Portable to any project.

---

## StatusPage Component

```tsx
"use client";

import { useEffect, useState } from "react";

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
}

const STATUS_LABELS: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
  maintenance: "Maintenance",
};

const STATUS_COLORS: Record<string, string> = {
  operational: "#22c55e",
  degraded: "#eab308",
  partial_outage: "#ef4444",
  major_outage: "#ef4444",
  maintenance: "#3b82f6",
};

function StatusDot({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: STATUS_COLORS[status] ?? "#eab308",
      }}
    />
  );
}

export function StatusPage() {
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [overall, setOverall] = useState("operational");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services ?? []);
        setOverall(data.overall_status ?? "operational");
        setIncidents(data.active_incidents ?? []);
      });
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui" }}>
      {/* Overall Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <StatusDot status={overall} />
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>
          {overall === "operational" ? "All Systems Operational" : "Service Disruption"}
        </h1>
      </div>

      {/* Service List */}
      <div>
        {services.map((svc) => (
          <div
            key={svc.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusDot status={svc.status} />
              <span>{svc.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              {svc.latencyMs !== null && <span>{svc.latencyMs}ms</span>}
              {" "}
              <span>{svc.uptimePercent.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Incidents */}
      {incidents.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Active Incidents</h2>
          {incidents.map((incident) => (
            <div
              key={incident.id}
              style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 16, marginBottom: 12 }}
            >
              <div style={{ fontWeight: 500, marginBottom: 8 }}>{incident.title}</div>
              {incident.updates.map((update, j) => (
                <div key={j} style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                  <strong>{update.status}</strong> - {update.message}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```
