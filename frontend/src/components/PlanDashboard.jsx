import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#5b8def",
  "#48c79c",
  "#f5a623",
  "#9b6cf2",
  "#ef6f6c",
  "#34d3eb",
];

export default function PlanDashboard({ plan, profile }) {
  if (!plan) {
    return (
      <div className="dash empty">
        <h3>Your plan appears here</h3>
        <p>
          Chat with NiveshMitra about your goals, horizon, income and how you
          feel about market dips. Once we know enough, a personalized plan is
          generated automatically.
        </p>
        {profile && <ProfileProgress profile={profile} />}
      </div>
    );
  }

  const pieData = plan.allocation.map((a) => ({
    name: a.asset,
    value: a.percent,
  }));

  return (
    <div className="dash">
      <div className="plan-header">
        <span className="cat-pill">
          {plan.riskCategory || profile?.riskCategory}
        </span>
        <h2>{plan.templateName}</h2>
        <p className="tagline">{plan.tagline}</p>
        <div className="plan-stats">
          <Stat
            label="Risk score"
            value={plan.riskScore ?? profile?.riskScore ?? "—"}
          />
          <Stat label="Target return" value={plan.expectedReturn} />
          <Stat
            label="Monthly SIP"
            value={
              plan.monthlySIP
                ? `₹${plan.monthlySIP.toLocaleString("en-IN")}`
                : "—"
            }
          />
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={(d) => `${d.value}%`}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="alloc-list">
        {plan.allocation.map((a, i) => (
          <div className="alloc-item" key={a.asset}>
            <div className="alloc-top">
              <span
                className="dot"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <strong>{a.asset}</strong>
              <span className="pct">{a.percent}%</span>
            </div>
            <div className="examples">{a.examples.join(" · ")}</div>
          </div>
        ))}
      </div>

      <h3 className="ms-title">Milestones</h3>
      <ul className="milestones">
        {plan.milestones.map((m, i) => (
          <li key={i}>
            <span className="ms-dot" />
            <div>
              <div>{m.label}</div>
              {m.targetYear && <small>by {m.targetYear}</small>}
            </div>
          </li>
        ))}
      </ul>

      <p className="disclaimer">{plan.disclaimer}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ProfileProgress({ profile }) {
  const items = [
    ["Goals", (profile.goals || []).length ? profile.goals.join(", ") : null],
    ["Horizon", profile.horizonYears ? `${profile.horizonYears} yrs` : null],
    [
      "Monthly income",
      profile.monthlyIncome ? `₹${profile.monthlyIncome}` : null,
    ],
    [
      "Investable / mo",
      profile.monthlyInvestable ? `₹${profile.monthlyInvestable}` : null,
    ],
    ["Fear tolerance", profile.fearTolerance],
  ];
  const done = items.filter(([, v]) => v).length;
  return (
    <div className="progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>
      <ul className="progress-list">
        {items.map(([k, v]) => (
          <li key={k} className={v ? "ok" : ""}>
            <span>{v ? "✓" : "○"}</span> {k}
            {v && <em>{v}</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
