import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface Day {
  date: string;
  count: number;
  level: number;
}
interface ContribData {
  user: string;
  total: number;
  contributions: Day[];
}

const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GitHubContributions = () => {
  const [data, setData] = useState<ContribData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/github-contributions");
        if (!res.ok) throw new Error("bad status");
        const json = (await res.json()) as ContribData;
        if (alive) {
          if (json.contributions?.length) setData(json);
          else setFailed(true);
        }
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Group days into week columns (row = weekday, 0=Sun … 6=Sat).
  const { weeks, monthLabels } = useMemo(() => {
    const days = data?.contributions ?? [];
    const cols: (Day | null)[][] = [];
    let current: (Day | null)[] = new Array(7).fill(null);
    days.forEach((d) => {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      current[dow] = d;
      if (dow === 6) {
        cols.push(current);
        current = new Array(7).fill(null);
      }
    });
    if (current.some(Boolean)) cols.push(current);

    // One label slot per week column; filled only when the month changes.
    const labels: string[] = [];
    let lastMonth = -1;
    cols.forEach((week) => {
      const firstDay = week.find(Boolean);
      if (!firstDay) {
        labels.push("");
        return;
      }
      const m = new Date(firstDay.date + "T00:00:00Z").getUTCMonth();
      if (m !== lastMonth) {
        labels.push(MONTHS[m]);
        lastMonth = m;
      } else {
        labels.push("");
      }
    });
    return { weeks: cols, monthLabels: labels };
  }, [data]);

  if (failed) return null; // fail silently — don't show a broken widget

  const total = data?.total ?? 0;
  const user = data?.user ?? "mjremetio";

  return (
    <section id="github">
      <div className="wrap">
        <motion.div
          className="section-head"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow center">// github.activity</div>
          <h2 className="h2">
            Code <span className="grad">Contributions</span>
          </h2>
          <p className="sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
            {data ? (
              <>
                <strong>{total.toLocaleString()}</strong> contributions in the last year on GitHub.
              </>
            ) : (
              "Loading contribution activity…"
            )}
          </p>
        </motion.div>

        <motion.div
          className="gh-card glass"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="gh-head">
            <a
              className="gh-user"
              href={`https://github.com/${user}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github" /> @{user}
            </a>
            <div className="gh-legend">
              <span>Less</span>
              <i className="gh-cell gh-l0" />
              <i className="gh-cell gh-l1" />
              <i className="gh-cell gh-l2" />
              <i className="gh-cell gh-l3" />
              <i className="gh-cell gh-l4" />
              <span>More</span>
            </div>
          </div>

          <div className="gh-scroll">
            <div className="gh-graph">
              <div className="gh-weekdays">
                {WEEKDAYS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="gh-cols-wrap">
                <div className="gh-months">
                  {monthLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
                <div className="gh-grid">
                  {weeks.map((week, wi) => (
                    <div className="gh-col" key={wi}>
                      {week.map((day, di) =>
                        day ? (
                          <motion.i
                            key={di}
                            className={`gh-cell gh-l${day.level}`}
                            title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                            initial={{ opacity: 0, scale: 0.4 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.25, delay: Math.min(wi * 0.006, 0.6) }}
                          />
                        ) : (
                          <i key={di} className="gh-cell gh-empty" />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubContributions;
