import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import "@/admin.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Learn whether this server requires a 2FA code, and skip the login page if
  // an existing session is already valid.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cfg, status] = await Promise.all([
          fetch("/api/admin/config").then((r) => r.json()).catch(() => ({})),
          fetch("/api/admin/status", { credentials: "include" }).then((r) => r.json()).catch(() => ({})),
        ]);
        if (!alive) return;
        setTwoFactorEnabled(Boolean(cfg?.twoFactorEnabled));
        if (status?.isAuthenticated) setLocation("/admin");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, code: code || undefined }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Welcome back", description: "Signed in successfully." });
        setLocation("/admin");
        return;
      }

      if (data.twoFactorRequired) {
        setTwoFactorEnabled(true);
        setError(data.message || "Enter your authentication code.");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page flex items-center justify-center p-6">
      <div className="admin-card w-full max-w-md p-8 sm:p-10">
        <div className="admin-brand mb-7">
          <span className="admin-brand-mark">&lt;/&gt;</span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[color:var(--ink)]">Mark Remetio</div>
            <div className="admin-eyebrow">// admin.console</div>
          </div>
        </div>

        <h1 className="admin-h1 text-2xl mb-1">
          Admin <span className="admin-grad">Access</span>
        </h1>
        <p className="admin-muted text-sm mb-7">
          Sign in to manage your portfolio content.
        </p>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="admin-label">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="admin-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {twoFactorEnabled && (
            <div>
              <label htmlFor="code" className="admin-label">
                <ShieldCheck className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                Authentication code
              </label>
              <input
                id="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                className="admin-mono tracking-[0.4em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={isLoading}
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="text-sm rounded-lg px-3 py-2.5"
              style={{
                color: "#ffb3b3",
                background: "rgba(255,90,90,0.1)",
                border: "1px solid rgba(255,90,90,0.3)",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Sign in
              </>
            )}
          </button>
        </form>

        <p className="admin-muted text-xs text-center mt-6">
          Protected area · unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
