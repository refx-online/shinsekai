import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MonitorOverlay, InputField, Button, Divider, StatusStamp } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { verifyPassword, createSession, currentSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/privs";

async function loginAction(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) redirect("/signin?error=missing");

  const db = await getMySQLDatabase();
  if (!db) redirect("/signin?error=backend");
  const user = await db("users").where("name", username).first();
  if (!user) redirect("/signin?error=invalid");
  const ok = await verifyPassword(password, user.pw_bcrypt);
  if (!ok) redirect("/signin?error=invalid");
  if (!isStaff(user.priv)) redirect("/signin?error=priv");

  const token = await createSession(user.id);
  const store = await cookies();
  store.set("sessionToken", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/nerv");
}

const ERRORS: Record<string, string> = {
  missing: "OPERATOR ID AND ACCESS CODE REQUIRED.",
  backend: "MAGI LINK DOWN. TRY AGAIN.",
  invalid: "INVALID CREDENTIALS. ATTEMPT LOGGED.",
  priv: "INSUFFICIENT CLEARANCE. STAFF ONLY.",
};

const displayFont = { fontFamily: "var(--font-nerv-display)" };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const existing = await currentSessionUser();
  if (existing && isStaff(existing.priv)) redirect("/nerv");

  const { error } = await searchParams;
  const appUrl = process.env.PUBLIC_APP_URL ?? "https://refx.041095.xyz";

  return (
    <div className="relative min-h-screen bg-nerv-black">
      <div className="absolute inset-0">
        <MonitorOverlay color="orange" opacity={0.26} density="normal" animated />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="border border-nerv-mid-gray/30 bg-nerv-dark-gray/70 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-nerv-orange">
                ACCESS CHECKPOINT
              </div>
              <h1
                className="nerv-text-shadow-orange mt-3 text-3xl font-black uppercase tracking-[0.2em] text-nerv-white"
                style={displayFont}
              >
                PERSONNEL GATE
              </h1>
              <p className="mt-3 font-mono text-xs leading-relaxed text-nerv-white/65">
                Authentication is handled as a control-room checkpoint: operator ID,
                access code and MAGI confirmation in a single rail. Sessions persist
                30 days on this terminal.
              </p>
            </div>

            <div className="border border-nerv-mid-gray/30 bg-nerv-black/80 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-nerv-cyan">
                REQUIREMENTS
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs text-nerv-white/70">
                <div className="flex items-center justify-between border-b border-nerv-mid-gray/20 pb-2">
                  <span>TERMINAL STATE</span>
                  <span className="nerv-text-shadow-green text-nerv-green">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between border-b border-nerv-mid-gray/20 pb-2">
                  <span>AUTH CHANNEL</span>
                  <span className="nerv-text-shadow-cyan text-nerv-cyan">MAGI LINK</span>
                </div>
                <div className="flex items-center justify-between border-b border-nerv-mid-gray/20 pb-2">
                  <span>CLASSIFICATION</span>
                  <span className="nerv-text-shadow-orange text-nerv-orange">LEVEL 02</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>FAIL MODE</span>
                  <span className="nerv-text-shadow-red text-nerv-red">LOCKDOWN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-nerv-orange/30 bg-nerv-black/80 shadow-[0_0_32px_rgba(255,153,0,0.08)]">
            <div className="border-b border-nerv-orange/30 px-6 py-5 sm:px-8">
              <div className="text-[10px] uppercase tracking-[0.24em] text-nerv-white/35">
                NERV HEADQUARTERS / GEOFRONT LEVEL 02
              </div>
              <h2
                className="nerv-text-shadow-orange mt-2 text-4xl font-black uppercase tracking-[0.24em] text-nerv-orange"
                style={displayFont}
              >
                AUTH TERMINAL
              </h2>
            </div>

            <form action={loginAction} className="space-y-5 px-6 py-6 sm:px-8">
              <Divider label="AUTHENTICATION REQUIRED" color="orange" />

              <InputField label="OPERATOR ID" name="username" autoComplete="username" color="orange" />
              <InputField
                label="ACCESS CODE"
                name="password"
                type="password"
                autoComplete="current-password"
                color="orange"
              />

              {error && (
                <div className="space-y-2">
                  <StatusStamp text="REFUSED" color="red" bordered rotation={-4} />
                  <p className="nerv-text-shadow-red font-mono text-xs text-nerv-red">
                    {ERRORS[error] ?? "LOGIN FAILED."}
                  </p>
                </div>
              )}

              <Button variant="primary" type="submit" fullWidth>
                AUTHENTICATE
              </Button>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-nerv-white/40">
                <a href={appUrl} className="transition-colors hover:text-nerv-orange">
                  ← back to main site
                </a>
                <span className="text-nerv-white/20">/</span>
                <span>SESSIONS PERSIST 30 DAYS</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nerv-mid-gray/50">
          NERV HEADQUARTERS — GEOFRONT LEVEL 02
        </p>
      </div>
    </div>
  );
}
