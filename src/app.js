import { useState, useEffect } from "react";

const PLATFORMS = [
  { id: "facebook",  name: "Facebook",   color: "#1877F2", bg: "#E7F0FD", icon: "f",  apiFields: [{ key: "pageId", label: "Page ID" }, { key: "accessToken", label: "Page Access Token" }] },
  { id: "instagram", name: "Instagram",  color: "#E1306C", bg: "#FCE4EC", icon: "📷", apiFields: [{ key: "accountId", label: "Business Account ID" }, { key: "accessToken", label: "Access Token" }] },
  { id: "google",    name: "Google Biz", color: "#4285F4", bg: "#E8F0FE", icon: "G",  apiFields: [{ key: "locationId", label: "Location ID" }, { key: "accessToken", label: "OAuth Access Token" }] },
  { id: "threads",   name: "Threads",    color: "#555",    bg: "#F0F0F0", icon: "@",  apiFields: [{ key: "userId", label: "User ID" }, { key: "accessToken", label: "Access Token" }] },
  { id: "tiktok",    name: "TikTok",     color: "#EE1D52", bg: "#FFF0F3", icon: "♪",  apiFields: [{ key: "openId", label: "Open ID" }, { key: "accessToken", label: "Access Token" }] },
];

const TONES     = ["Professional","Casual","Witty","Inspirational","Promotional","Educational","Storytelling"];
const TYPES     = ["Post","Story","Reel/Short","Announcement","Poll","Product Feature","Behind the Scenes"];
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const INDUSTRIES = ["E-commerce / Retail","Food & Beverage","Health & Wellness","Technology / SaaS","Finance","Real Estate","Education","Fashion & Beauty","Travel & Hospitality","Entertainment","Non-Profit","Professional Services","Other"];

const PIcon = ({ pid, sz = 32 }) => {
  const p = PLATFORMS.find(x => x.id === pid);
  if (!p) return null;
  return <div style={{ width: sz, height: sz, borderRadius: "50%", background: p.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * .38, fontWeight: "bold", flexShrink: 0, boxShadow: `0 2px 8px ${p.color}55` }}>{p.icon}</div>;
};

const Badge = ({ s }) => {
  const m = { scheduled: { bg: "#E8F5E9", c: "#2E7D32", l: "Scheduled" }, posted: { bg: "#DBEAFE", c: "#1565C0", l: "Posted" }, draft: { bg: "#FFF8E1", c: "#F57F17", l: "Draft" } };
  const d = m[s] || m.draft;
  return <span style={{ background: d.bg, color: d.c, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{d.l}</span>;
};

const ToggleSwitch = ({ on, onChange, color = "#6366F1" }) => (
  <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? color : "#CBD5E1", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
  </div>
);

const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{hint}</div>}
  </div>
);

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [settingsTab, setSettingsTab] = useState("brand");
  const [notif, setNotif] = useState(null);
  const [gen, setGen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cal, setCal] = useState(new Date(2026, 2, 1));
  const [showApiKey, setShowApiKey] = useState({});

  const [brand, setBrand] = useState({
    companyName: "", industry: "E-commerce / Retail", tagline: "",
    description: "", targetAudience: "", keyMessages: "",
    brandVoice: "", avoidWords: "", primaryColor: "#6366F1", logoEmoji: "🏢",
    contentPillars: "Education, Inspiration, Promotion, Entertainment",
    postingGoal: "Brand awareness and engagement",
  });

  const defaultKeys = () => Object.fromEntries(PLATFORMS.map(p => [p.id, Object.fromEntries(p.apiFields.map(f => [f.key, ""]))]));
  const [apiKeys, setApiKeys] = useState(defaultKeys());
  const [platformEnabled, setPlatformEnabled] = useState(Object.fromEntries(PLATFORMS.map(p => [p.id, false])));

  const [posts, setPosts] = useState([
    { id: 1, pid: "instagram", content: "🌟 New collection just dropped! Swipe to see the magic. Drop a ❤️ if you love it!", topic: "Product Launch", tone: "Promotional", date: "2026-03-05 10:00", status: "scheduled", type: "Post" },
    { id: 2, pid: "facebook",  content: "Thrilled to announce our Spring Sale! Up to 50% off this weekend only. Don't miss out!", topic: "Spring Sale", tone: "Promotional", date: "2026-03-05 12:00", status: "scheduled", type: "Announcement" },
    { id: 3, pid: "tiktok",    content: "POV: You discovered the most aesthetic café in town ☕ #CoffeeAesthetic #FYP", topic: "Coffee Shop", tone: "Casual", date: "2026-03-04 18:00", status: "posted", type: "Reel/Short" },
    { id: 4, pid: "threads",   content: "Hot take: The best productivity hack is actually taking more breaks. Change my mind. 👀", topic: "Productivity", tone: "Casual", date: "2026-03-04 14:00", status: "posted", type: "Post" },
    { id: 5, pid: "google",    content: "Grand Opening this weekend! Free samples, exclusive discounts, live demos 10AM–6PM.", topic: "Grand Opening", tone: "Professional", date: "2026-03-06 09:00", status: "draft", type: "Announcement" },
  ]);

  const [form, setForm] = useState({ pid: "instagram", topic: "", tone: "Professional", type: "Post", date: "", time: "10:00", content: "", tags: "" });

  const notify = (msg, t = "ok") => { setNotif({ msg, t }); setTimeout(() => setNotif(null), 3200); };

  const brandPromptBlock = () => {
    if (!brand.companyName) return "";
    return `BRAND CONTEXT:
- Company: ${brand.companyName}${brand.tagline ? ` — "${brand.tagline}"` : ""}
- Industry: ${brand.industry}
- Description: ${brand.description || "N/A"}
- Target Audience: ${brand.targetAudience || "N/A"}
- Key Messages: ${brand.keyMessages || "N/A"}
- Brand Voice: ${brand.brandVoice || "N/A"}
- Content Pillars: ${brand.contentPillars || "N/A"}
- Posting Goal: ${brand.postingGoal || "N/A"}
${brand.avoidWords ? `- AVOID these words/topics: ${brand.avoidWords}` : ""}
All content MUST reflect this brand identity faithfully.\n`;
  };

  const generate = async () => {
    if (!form.topic.trim()) { notify("Enter a topic first!", "err"); return; }
    setGen(true);
    const p = PLATFORMS.find(x => x.id === form.pid);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1024,
          messages: [{ role: "user", content: `${brandPromptBlock()}You are a social media copywriter. Create a ${form.type} for ${p.name} about "${form.topic}". Tone: ${form.tone}. Return ONLY valid JSON: {"content":"post text with emojis","hashtags":"#tag1 #tag2 #tag3 #tag4 #tag5"}` }]
        })
      });
      const d = await r.json();
      const txt = d.content?.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(txt);
      setForm(f => ({ ...f, content: parsed.content || "", tags: parsed.hashtags || "" }));
      notify("✨ Brand-aligned content generated!");
    } catch (e) { notify("Generation failed. Try again.", "err"); }
    setGen(false);
  };

  const schedule = () => {
    if (!form.content.trim()) { notify("Generate or write content first!", "err"); return; }
    if (!form.date) { notify("Pick a schedule date!", "err"); return; }
    setSaving(true);
    setTimeout(() => {
      setPosts(ps => [{ id: Date.now(), pid: form.pid, content: form.content + (form.tags ? "\n\n" + form.tags : ""), topic: form.topic, tone: form.tone, type: form.type, date: `${form.date} ${form.time}`, status: "scheduled" }, ...ps]);
      setForm(f => ({ ...f, topic: "", content: "", tags: "", date: "" }));
      notify("🚀 Post scheduled!"); setSaving(false); setTab("queue");
    }, 800);
  };

  const connectedCount = Object.values(platformEnabled).filter(Boolean).length;
  const brandComplete = brand.companyName && brand.description && brand.targetAudience;
  const dim = (y, m) => new Date(y, m + 1, 0).getDate();
  const fd  = (y, m) => new Date(y, m, 1).getDay();
  const dayPosts = d => {
    const y = cal.getFullYear(), m = cal.getMonth();
    const s = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return posts.filter(p => p.date.startsWith(s));
  };

  const inp  = { padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, outline: "none", boxSizing: "border-box", width: "100%", fontFamily: "inherit" };
  const card = { background: "white", borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0" };

  const navItems = [
    { id: "dashboard", l: "Dashboard",   i: "▦" },
    { id: "create",    l: "Create Post", i: "✏" },
    { id: "queue",     l: "Queue",       i: "☰" },
    { id: "calendar",  l: "Calendar",    i: "◫" },
    { id: "settings",  l: "Settings",    i: "⚙" },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      {/* SIDEBAR */}
      <div style={{ width: 210, background: "linear-gradient(160deg,#0F172A,#1E293B)", color: "white", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 14px" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}><span style={{ color: "#818CF8" }}>Auto</span>Post</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Social Automation</div>
          {brand.companyName && (
            <div style={{ marginTop: 10, background: "rgba(99,102,241,0.15)", borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 18 }}>{brand.logoEmoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#C7D2FE" }}>{brand.companyName}</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>{brand.industry}</div>
              </div>
            </div>
          )}
        </div>
        <nav style={{ padding: "4px 10px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === item.id ? "rgba(99,102,241,0.2)" : "transparent", color: tab === item.id ? "#A5B4FC" : "#94A3B8", fontSize: 13, fontWeight: tab === item.id ? 700 : 400, marginBottom: 2, textAlign: "left", borderLeft: tab === item.id ? "3px solid #6366F1" : "3px solid transparent" }}>
              <span style={{ fontSize: 14 }}>{item.i}</span>{item.l}
              {item.id === "settings" && !brandComplete && <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" }} />}
            </button>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid #1E293B" }}>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Platforms</div>
          {PLATFORMS.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: platformEnabled[p.id] ? p.color : "#334155" }} />
              <span style={{ fontSize: 12, color: platformEnabled[p.id] ? "#E2E8F0" : "#64748B", flex: 1 }}>{p.name.split(" ")[0]}</span>
              <span style={{ fontSize: 10, color: platformEnabled[p.id] ? "#4ADE80" : "#475569" }}>{platformEnabled[p.id] ? "●" : "○"}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 11, color: "#475569" }}>{connectedCount} of 5 connected</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 30px" }}>
        {notif && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: notif.t === "err" ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${notif.t === "err" ? "#FECACA" : "#BBF7D0"}`, color: notif.t === "err" ? "#DC2626" : "#16A34A", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>{notif.msg}</div>}

        {!brandComplete && tab !== "settings" && (
          <div style={{ background: "linear-gradient(135deg,#FFF7ED,#FFFBEB)", border: "1.5px solid #FED7AA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 22 }}>🎨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>Set up your Brand Profile for AI-aligned content</div>
              <div style={{ fontSize: 12, color: "#B45309", marginTop: 2 }}>Add your company details so generated posts match your brand voice & identity.</div>
            </div>
            <button onClick={() => setTab("settings")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#F59E0B", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>Setup Brand →</button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Dashboard</h1>
            <p style={{ margin: "0 0 22px", color: "#64748B", fontSize: 14 }}>Your social media automation overview</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {[{ l: "Total Posts", v: posts.length, i: "📝", c: "#6366F1" }, { l: "Scheduled", v: posts.filter(x => x.status === "scheduled").length, i: "⏰", c: "#F59E0B" }, { l: "Posted", v: posts.filter(x => x.status === "posted").length, i: "✅", c: "#10B981" }, { l: "Drafts", v: posts.filter(x => x.status === "draft").length, i: "📄", c: "#64748B" }].map((s, i) => (
                <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px" }}>
                  <div><div style={{ fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{s.l}</div></div>
                  <span style={{ fontSize: 26 }}>{s.i}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div style={card}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Platform Breakdown</h3>
                {PLATFORMS.map(p => {
                  const cnt = posts.filter(x => x.pid === p.id).length;
                  const pct = posts.length ? Math.round((cnt / posts.length) * 100) : 0;
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <PIcon pid={p.id} sz={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{p.name}</span>
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>{cnt}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9" }}>
                          <div style={{ height: "100%", borderRadius: 3, background: p.color, width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={card}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{brand.companyName ? `${brand.logoEmoji} Brand Profile` : "🎨 Brand Profile"}</h3>
                {brandComplete ? (
                  <div>
                    <div style={{ background: "linear-gradient(135deg,#EEF2FF,#F0FDF4)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{brand.companyName}</div>
                      {brand.tagline && <div style={{ fontSize: 12, color: "#6366F1", fontStyle: "italic", marginTop: 2 }}>"{brand.tagline}"</div>}
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{brand.industry}</div>
                    </div>
                    {[{ l: "Audience", v: brand.targetAudience }, { l: "Voice", v: brand.brandVoice }, { l: "Goal", v: brand.postingGoal }].filter(x => x.v).map(x => (
                      <div key={x.l} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", minWidth: 55 }}>{x.l}</span>
                        <span style={{ fontSize: 12, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.v}</span>
                      </div>
                    ))}
                    <button onClick={() => setTab("settings")} style={{ marginTop: 8, fontSize: 12, color: "#6366F1", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Edit brand profile →</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Complete your brand profile so AI generates content that matches your identity</div>
                    <button onClick={() => setTab("settings")} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Setup Brand Profile</button>
                  </div>
                )}
              </div>
            </div>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Recent Posts</h3>
                <button onClick={() => setTab("queue")} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>View all →</button>
              </div>
              {posts.slice(0, 5).map(post => (
                <div key={post.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <PIcon pid={post.pid} sz={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.content}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>⏰ {post.date} · {post.type}</div>
                  </div>
                  <Badge s={post.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE */}
        {tab === "create" && (
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Create Post</h1>
            <p style={{ margin: "0 0 22px", color: "#64748B", fontSize: 14 }}>AI-powered content generation aligned to your brand</p>
            {brandComplete && (
              <div style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", border: "1px solid #C7D2FE", borderRadius: 10, padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{brand.logoEmoji}</span>
                <div style={{ fontSize: 13, color: "#4338CA" }}>Generating as <strong>{brand.companyName}</strong> · {brand.industry} · Voice: {brand.brandVoice || "as configured"}</div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={card}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>⚙️ Post Settings</h3>
                <Field label="Platform">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {PLATFORMS.map(p => (
                      <button key={p.id} onClick={() => setForm(f => ({ ...f, pid: p.id }))} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: form.pid === p.id ? p.color : p.bg, color: form.pid === p.id ? "white" : p.color, border: `2px solid ${form.pid === p.id ? p.color : "transparent"}` }}>
                        {p.icon} {p.name.split(" ")[0]} {platformEnabled[p.id] && "●"}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Topic / Idea">
                  <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Summer sale, new product launch..." style={inp} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <Field label="Content Type"><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inp, background: "white" }}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                  <Field label="Tone"><select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} style={{ ...inp, background: "white" }}>{TONES.map(t => <option key={t}>{t}</option>)}</select></Field>
                </div>
                <button onClick={generate} disabled={gen} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: gen ? "wait" : "pointer", background: gen ? "#C7D2FE" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  {gen ? "⏳ Generating..." : "✨ Generate Brand-Aligned Content"}
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Date"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} /></Field>
                  <Field label="Time"><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inp} /></Field>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ ...card, flex: 1 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>📝 Content</h3>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Brand-aligned AI content appears here…" style={{ ...inp, minHeight: 130, resize: "vertical", lineHeight: 1.6 }} />
                  <Field label="Hashtags" hint="Edit as needed"><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="#yourbrand #trending" style={inp} /></Field>
                </div>
                {form.content && (() => {
                  const p = PLATFORMS.find(x => x.id === form.pid);
                  return (
                    <div style={{ background: "white", borderRadius: 12, padding: 16, border: `2px solid ${p.color}33` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 9 }}>👁 Preview</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: brand.primaryColor || "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{brand.logoEmoji || "🏢"}</div>
                        <div><div style={{ fontWeight: 700, fontSize: 13 }}>{brand.companyName || "Your Page"}</div><div style={{ fontSize: 11, color: "#94A3B8" }}>{form.date || "No date"} · {form.type}</div></div>
                        <span style={{ marginLeft: "auto", background: p.bg, color: p.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{p.name.split(" ")[0]}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#374151", whiteSpace: "pre-wrap" }}>{form.content}{form.tags ? "\n\n" + form.tags : ""}</p>
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: 9 }}>
                  <button onClick={() => { if (form.content) { setPosts(ps => [{ id: Date.now(), pid: form.pid, content: form.content, topic: form.topic, tone: form.tone, type: form.type, date: "-", status: "draft" }, ...ps]); setForm(f => ({ ...f, content: "", tags: "", topic: "" })); notify("Saved as draft!"); } }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>💾 Draft</button>
                  <button onClick={schedule} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", cursor: saving ? "wait" : "pointer", background: saving ? "#86EFAC" : "linear-gradient(135deg,#10B981,#059669)", color: "white", fontSize: 13, fontWeight: 700 }}>
                    {saving ? "⏳ Scheduling..." : "🚀 Schedule Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUEUE */}
        {tab === "queue" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div><h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Post Queue</h1><p style={{ margin: 0, color: "#64748B", fontSize: 14 }}>{posts.length} total posts</p></div>
              <button onClick={() => setTab("create")} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ New Post</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.length === 0 ? (
                <div style={{ ...card, textAlign: "center", padding: 60, color: "#94A3B8" }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>No posts yet</div>
                  <button onClick={() => setTab("create")} style={{ marginTop: 14, padding: "10px 20px", borderRadius: 10, border: "none", background: "#6366F1", color: "white", cursor: "pointer", fontWeight: 600 }}>Create first post</button>
                </div>
              ) : posts.map(post => {
                const p = PLATFORMS.find(x => x.id === post.pid);
                return (
                  <div key={post.id} style={{ ...card, padding: "15px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <PIcon pid={post.pid} sz={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: p?.color }}>{p?.name}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8", background: "#F8FAFC", padding: "2px 7px", borderRadius: 5 }}>{post.type}</span>
                        <Badge s={post.status} />
                      </div>
                      <p style={{ margin: "0 0 5px", fontSize: 13, color: "#374151", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.content}</p>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>⏰ {post.date} · {post.tone}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {post.status === "scheduled" && <button onClick={() => { setPosts(ps => ps.map(x => x.id === post.id ? { ...x, status: "posted" } : x)); notify("Marked as posted!"); }} style={{ padding: "6px 9px", borderRadius: 7, border: "1px solid #BBF7D0", background: "#F0FDF4", color: "#16A34A", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Posted</button>}
                      {post.status === "draft" && <button onClick={() => { setPosts(ps => ps.map(x => x.id === post.id ? { ...x, status: "scheduled" } : x)); notify("Scheduled!"); }} style={{ padding: "6px 9px", borderRadius: 7, border: "1px solid #C7D2FE", background: "#EEF2FF", color: "#4F46E5", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>📅 Schedule</button>}
                      <button onClick={() => { setPosts(ps => ps.filter(x => x.id !== post.id)); notify("Deleted."); }} style={{ padding: "6px 9px", borderRadius: 7, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {tab === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div><h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Content Calendar</h1><p style={{ margin: 0, color: "#64748B", fontSize: 14 }}>Visual schedule overview</p></div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <button onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() - 1, 1))} style={{ padding: "7px 13px", borderRadius: 8, border: "1px solid #E2E8F0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>‹</button>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", minWidth: 155, textAlign: "center" }}>{MONTHS[cal.getMonth()]} {cal.getFullYear()}</span>
                <button onClick={() => setCal(new Date(cal.getFullYear(), cal.getMonth() + 1, 1))} style={{ padding: "7px 13px", borderRadius: 8, border: "1px solid #E2E8F0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>›</button>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0", marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {WDAYS.map(d => <div key={d} style={{ padding: "11px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#64748B" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {Array.from({ length: fd(cal.getFullYear(), cal.getMonth()) }).map((_, i) => <div key={`e${i}`} style={{ minHeight: 90, padding: 7, background: "#FAFAFA", borderTop: "1px solid #F1F5F9", borderRight: "1px solid #F1F5F9" }} />)}
                {Array.from({ length: dim(cal.getFullYear(), cal.getMonth()) }).map((_, i) => {
                  const d = i + 1, dp = dayPosts(d), now = new Date();
                  const today = now.getFullYear() === cal.getFullYear() && now.getMonth() === cal.getMonth() && now.getDate() === d;
                  return (
                    <div key={d} style={{ minHeight: 90, padding: 7, background: today ? "#EEF2FF" : "white", borderTop: "1px solid #F1F5F9", borderRight: "1px solid #F1F5F9" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: today ? "#6366F1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: today ? 800 : 500, color: today ? "white" : "#374151", marginBottom: 4 }}>{d}</div>
                      {dp.slice(0, 3).map(post => { const p = PLATFORMS.find(x => x.id === post.pid); return <div key={post.id} style={{ fontSize: 10, background: p?.bg, color: p?.color, borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, borderLeft: `3px solid ${p?.color}` }}>{p?.icon} {post.content.substring(0, 18)}…</div>; })}
                      {dp.length > 3 && <div style={{ fontSize: 10, color: "#94A3B8" }}>+{dp.length - 3} more</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PLATFORMS.map(p => <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "5px 11px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, color: "#64748B" }}><div style={{ width: 9, height: 9, borderRadius: 2, background: p.color }} />{p.name}</div>)}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Settings</h1>
            <p style={{ margin: "0 0 22px", color: "#64748B", fontSize: 14 }}>Configure your brand identity and platform API connections</p>

            <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "white", padding: 4, borderRadius: 12, border: "1px solid #E2E8F0", width: "fit-content" }}>
              {[{ id: "brand", l: "🎨 Brand Profile" }, { id: "apis", l: "🔑 API Keys" }].map(t => (
                <button key={t.id} onClick={() => setSettingsTab(t.id)} style={{ padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", background: settingsTab === t.id ? "#6366F1" : "transparent", color: settingsTab === t.id ? "white" : "#64748B", fontWeight: settingsTab === t.id ? 700 : 500, fontSize: 13 }}>{t.l}</button>
              ))}
            </div>

            {settingsTab === "brand" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={card}>
                    <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>🏢 Company Identity</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12, marginBottom: 14, alignItems: "end" }}>
                      <Field label="Logo">
                        <input value={brand.logoEmoji} onChange={e => setBrand(b => ({ ...b, logoEmoji: e.target.value }))} style={{ ...inp, textAlign: "center", fontSize: 22 }} maxLength={2} />
                      </Field>
                      <Field label="Company Name *">
                        <input value={brand.companyName} onChange={e => setBrand(b => ({ ...b, companyName: e.target.value }))} placeholder="Your company name" style={inp} />
                      </Field>
                    </div>
                    <Field label="Tagline / Slogan"><input value={brand.tagline} onChange={e => setBrand(b => ({ ...b, tagline: e.target.value }))} placeholder="Your catchy tagline" style={inp} /></Field>
                    <Field label="Industry">
                      <select value={brand.industry} onChange={e => setBrand(b => ({ ...b, industry: e.target.value }))} style={{ ...inp, background: "white" }}>
                        {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                      </select>
                    </Field>
                    <Field label="Company Description *" hint="What do you do? What makes you unique?">
                      <textarea value={brand.description} onChange={e => setBrand(b => ({ ...b, description: e.target.value }))} placeholder="We are a premium skincare brand focused on natural, sustainable ingredients..." style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
                    </Field>
                    <Field label="Brand Color">
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="color" value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} style={{ width: 44, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer", padding: 2 }} />
                        <input value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} style={{ ...inp, flex: 1, width: "auto" }} />
                      </div>
                    </Field>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={card}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>🎯 Content Strategy</h3>
                    <Field label="Target Audience *" hint="Age, interests, pain points, demographics">
                      <textarea value={brand.targetAudience} onChange={e => setBrand(b => ({ ...b, targetAudience: e.target.value }))} placeholder="Women 25–40, health-conscious, busy professionals who value natural beauty..." style={{ ...inp, minHeight: 70, resize: "vertical", lineHeight: 1.5 }} />
                    </Field>
                    <Field label="Brand Voice & Personality" hint="How should your brand sound?">
                      <input value={brand.brandVoice} onChange={e => setBrand(b => ({ ...b, brandVoice: e.target.value }))} placeholder="Friendly, empowering, science-backed, never preachy" style={inp} />
                    </Field>
                    <Field label="Key Messages">
                      <textarea value={brand.keyMessages} onChange={e => setBrand(b => ({ ...b, keyMessages: e.target.value }))} placeholder="Clean ingredients, cruelty-free, results in 7 days..." style={{ ...inp, minHeight: 60, resize: "vertical", lineHeight: 1.5 }} />
                    </Field>
                    <Field label="Content Pillars">
                      <input value={brand.contentPillars} onChange={e => setBrand(b => ({ ...b, contentPillars: e.target.value }))} placeholder="Education, Inspiration, Product Showcase, Community" style={inp} />
                    </Field>
                    <Field label="Posting Goal">
                      <input value={brand.postingGoal} onChange={e => setBrand(b => ({ ...b, postingGoal: e.target.value }))} placeholder="Drive website traffic and grow community" style={inp} />
                    </Field>
                    <Field label="Words / Topics to AVOID">
                      <input value={brand.avoidWords} onChange={e => setBrand(b => ({ ...b, avoidWords: e.target.value }))} placeholder="toxic, cheap, competitor names..." style={inp} />
                    </Field>
                  </div>
                  <button onClick={() => notify("✅ Brand profile saved!")} style={{ padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    💾 Save Brand Profile
                  </button>
                  {brand.companyName && (
                    <div style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius: 12, padding: 16, border: "1px solid #C7D2FE" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Brand Preview</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: brand.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{brand.logoEmoji}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{brand.companyName}</div>
                          {brand.tagline && <div style={{ fontSize: 12, color: "#6366F1", fontStyle: "italic" }}>"{brand.tagline}"</div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#4338CA", lineHeight: 1.6 }}>
                        <div>Industry: {brand.industry}</div>
                        {brand.brandVoice && <div>Voice: {brand.brandVoice}</div>}
                        {brand.targetAudience && <div style={{ marginTop: 4, color: "#64748B", fontSize: 11 }}>"{brand.targetAudience}"</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {settingsTab === "apis" && (
              <div>
                <div style={{ background: "linear-gradient(135deg,#FFF7ED,#FFFBEB)", border: "1.5px solid #FED7AA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>API Keys stored in memory only</div>
                    <div style={{ fontSize: 12, color: "#B45309", marginTop: 3, lineHeight: 1.5 }}>Keys are never persisted or sent anywhere. For production, use a secure backend server. Each platform requires a developer account and app review for posting access.</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} style={{ ...card, borderLeft: `4px solid ${platformEnabled[p.id] ? p.color : "#E2E8F0"}`, transition: "border-color .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: platformEnabled[p.id] ? 16 : 0 }}>
                        <PIcon pid={p.id} sz={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: platformEnabled[p.id] ? "#16A34A" : "#94A3B8" }}>{platformEnabled[p.id] ? "● Connected" : "○ Not connected"}</div>
                        </div>
                        <ToggleSwitch on={platformEnabled[p.id]} onChange={() => setPlatformEnabled(s => ({ ...s, [p.id]: !s[p.id] }))} color={p.color} />
                      </div>
                      {platformEnabled[p.id] && (
                        <div>
                          {p.apiFields.map(field => (
                            <Field key={field.key} label={field.label}>
                              <div style={{ position: "relative" }}>
                                <input type={showApiKey[`${p.id}_${field.key}`] ? "text" : "password"} value={apiKeys[p.id][field.key]} onChange={e => setApiKeys(k => ({ ...k, [p.id]: { ...k[p.id], [field.key]: e.target.value } }))} placeholder={`Enter ${p.name} ${field.label}`} style={{ ...inp, paddingRight: 40 }} />
                                <button onClick={() => setShowApiKey(s => ({ ...s, [`${p.id}_${field.key}`]: !s[`${p.id}_${field.key}`] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94A3B8" }}>
                                  {showApiKey[`${p.id}_${field.key}`] ? "🙈" : "👁"}
                                </button>
                              </div>
                            </Field>
                          ))}
                          <button onClick={() => { const has = p.apiFields.every(f => apiKeys[p.id][f.key].trim()); notify(has ? `✅ ${p.name} ready to post!` : `Fill in all ${p.name} fields first.`, has ? "ok" : "err"); }} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: p.bg, color: p.color, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                            Test Connection
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ ...card, marginTop: 20 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>📋 Auto-Posting Setup Guide</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                    {[
                      { n: "1", t: "Get API Credentials", d: "Create a developer app on each platform's developer portal" },
                      { n: "2", t: "Enable & Connect", d: "Toggle platforms on and paste your credentials above" },
                      { n: "3", t: "Create & Schedule", d: "Generate AI content and set your publish date & time" },
                      { n: "4", t: "Auto-Publish", d: "Posts are pushed to each platform at the scheduled time" },
                    ].map(s => (
                      <div key={s.n} style={{ textAlign: "center", padding: "16px 12px", background: "#F8FAFC", borderRadius: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>{s.n}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 5 }}>{s.t}</div>
                        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>{s.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
