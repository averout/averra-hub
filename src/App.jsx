import { useEffect, useMemo, useState } from "react";

const defaultNotes = [
  { id: crypto.randomUUID(), title: "Plan weekend trip", meta: "1 day" },
  { id: crypto.randomUUID(), title: "UI ideas", meta: "3 days" },
  { id: crypto.randomUUID(), title: "Groceries today", meta: "6 days" },
];

const defaultLinks = [
  { id: crypto.randomUUID(), title: "GitHub", url: "https://github.com/averout", subtitle: "All projects and experiments" },
  { id: crypto.randomUUID(), title: "Notion", url: "https://www.notion.so", subtitle: "Random notes and ideas" },
  { id: crypto.randomUUID(), title: "Futurism", url: "https://futurism.com", subtitle: "AI news and inspiration" },
];

const defaultFocus = [
  { id: crypto.randomUUID(), title: "Finish landing page", priority: true, done: false },
  { id: crypto.randomUUID(), title: "Go for a gym session", priority: false, done: false },
  { id: crypto.randomUUID(), title: "Read a chapter", priority: false, done: false },
];

const moodOptions = [
  {
    id: "great",
    label: "Great",
    emoji: "😍",
    text: "Went for a walk, had coffee and felt super relaxed. Productive day overall!",
    accent: "from-[#ffd88d] to-[#ffc5d8]",
  },
  {
    id: "good",
    label: "Good",
    emoji: "🙂",
    text: "A quieter day, but still clean and productive enough to keep momentum.",
    accent: "from-[#b2d8ff] to-[#c9c4ff]",
  },
  {
    id: "okay",
    label: "Okay",
    emoji: "😌",
    text: "Not bad, not amazing. Still showed up and moved things forward.",
    accent: "from-[#ffe6ba] to-[#fff3d9]",
  },
  {
    id: "low",
    label: "Low",
    emoji: "🥲",
    text: "Energy felt lower today, so the goal was just to stay gentle and consistent.",
    accent: "from-[#d8e4ff] to-[#e9efff]",
  },
];

const aiTags = ["Blog Ideas", "Startup Names", "Social Post", "Productivity Tips"];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "◫", active: true },
  { id: "notes", label: "Notes", icon: "▣" },
  { id: "links", label: "Links", icon: "◎" },
  { id: "mood", label: "Mood", icon: "☻" },
  { id: "ai", label: "AI", icon: "✦" },
];

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeAiResult(input) {
  const value = input.trim();
  if (!value) return "Generate 5 tips for staying focused while working from home.";

  return `Here are 5 quick ideas for ${value}:\n\n1. Start with one clear task\n2. Remove distractions before working\n3. Use short focus sessions\n4. Keep your space clean\n5. End the day with a reset`;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function WidgetCard({ title, icon, children, className = "", delay = 0, codeLabel }) {
  return (
    <section
      className={`group relative overflow-hidden rounded-[30px] border border-white/75 bg-white/58 p-5 shadow-[0_20px_60px_rgba(144,130,255,0.12)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(144,130,255,0.18)] animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(212,203,255,0.45),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(192,235,255,0.35),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-2xl leading-none shadow-inner shadow-white/60 ring-1 ring-white/70">
            {icon}
          </span>
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight text-slate-700">{title}</h3>
            {codeLabel ? <p className="font-mono text-[11px] text-[#a39acf]">{codeLabel}</p> : null}
          </div>
        </div>
        <button className="text-xl leading-none text-[#b3a8e8] transition duration-300 hover:scale-110">•••</button>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

export default function AverraHubMVP() {
  const [notes, setNotes] = useState(() => load("averra_hub_notes", defaultNotes));
  const [links, setLinks] = useState(() => load("averra_hub_links", defaultLinks));
  const [focusTasks, setFocusTasks] = useState(() => load("averra_hub_focus", defaultFocus));
  const [mood, setMood] = useState(() => load("averra_hub_mood", moodOptions[0]));
  const [aiPrompt, setAiPrompt] = useState(() => load("averra_hub_ai_prompt", "staying focused while working from home"));
  const [aiResult, setAiResult] = useState(() => load("averra_hub_ai_result", "Generate 5 tips for staying focused while working from home."));
  const [aiHistory, setAiHistory] = useState(() => load("averra_hub_ai_history", []));

  const [noteInput, setNoteInput] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("averra_hub_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("averra_hub_links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem("averra_hub_focus", JSON.stringify(focusTasks));
  }, [focusTasks]);

  useEffect(() => {
    localStorage.setItem("averra_hub_mood", JSON.stringify(mood));
  }, [mood]);

  useEffect(() => {
    localStorage.setItem("averra_hub_ai_prompt", JSON.stringify(aiPrompt));
  }, [aiPrompt]);

  useEffect(() => {
    localStorage.setItem("averra_hub_ai_result", JSON.stringify(aiResult));
  }, [aiResult]);

  useEffect(() => {
    localStorage.setItem("averra_hub_ai_history", JSON.stringify(aiHistory));
  }, [aiHistory]);

  const stats = useMemo(
    () => [
      { id: 1, icon: "▤", value: notes.length, label: "notes", tone: "text-[#cc9dc7]" },
      { id: 2, icon: "⌖", value: links.length, label: "links", tone: "text-[#7caef3]" },
      { id: 3, icon: "☻", value: mood.label === "Great" ? 94 : 93, label: "great days", tone: "text-[#efb64a]" },
      { id: 4, icon: "✓", value: aiHistory.length, label: "requests", tone: "text-[#71b4ff]" },
    ],
    [notes.length, links.length, mood.label, aiHistory.length]
  );

  function toggleTask(id) {
    setFocusTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function addNote() {
    const value = noteInput.trim();
    if (!value) return;

    setNotes((prev) => [
      { id: crypto.randomUUID(), title: value, meta: "just now" },
      ...prev,
    ]);
    setNoteInput("");
  }

  function removeNote(id) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  function addLink() {
    const title = linkTitle.trim();
    const url = linkUrl.trim();
    if (!title || !url || !isValidUrl(url)) return;

    setLinks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        url,
        subtitle: getDomain(url),
      },
      ...prev,
    ]);
    setLinkTitle("");
    setLinkUrl("");
  }

  function removeLink(id) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }

  function addFocusTask() {
    const value = focusInput.trim();
    if (!value) return;

    setFocusTasks((prev) => [
      { id: crypto.randomUUID(), title: value, priority: false, done: false },
      ...prev,
    ]);
    setFocusInput("");
  }

  function removeFocusTask(id) {
    setFocusTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function cycleMood() {
    const currentIndex = moodOptions.findIndex((item) => item.id === mood.id);
    const nextMood = moodOptions[(currentIndex + 1) % moodOptions.length];
    setMood(nextMood);
  }

  function generateAi() {
    const result = makeAiResult(aiPrompt);
    setAiResult(result);
    setAiHistory((prev) => [aiPrompt || "untitled prompt", ...prev].slice(0, 5));
  }

  async function copyAiResult() {
    try {
      await navigator.clipboard.writeText(aiResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#ebe7ff_0%,#f5f2ff_32%,#ffffff_100%)] p-6 text-slate-900">
      <style>{`
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(28px) scale(.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroIn {
          0% { opacity: 0; transform: translateY(30px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatOrb {
          0%,100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-14px) translateX(8px) scale(1.04); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 18px 35px rgba(137,107,255,0.24); }
          50% { box-shadow: 0 24px 50px rgba(137,107,255,0.38); }
        }
        @keyframes lineGlow {
          0%,100% { opacity: .35; }
          50% { opacity: .7; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c6bcff] to-transparent animate-[lineGlow_4s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#ddd6ff]/60 blur-3xl animate-[floatOrb_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-[-90px] top-[140px] h-[280px] w-[280px] rounded-full bg-[#c7ecff]/45 blur-3xl animate-[floatOrb_11s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[32%] h-[260px] w-[260px] rounded-full bg-[#ffe7bf]/30 blur-3xl animate-[floatOrb_10s_ease-in-out_infinite]" />

      <div className="relative mx-auto max-w-7xl rounded-[38px] border border-white/80 bg-white/38 p-4 shadow-[0_36px_90px_rgba(138,123,255,0.16)] backdrop-blur-2xl">
        <div className="grid gap-6 lg:grid-cols-[292px_1fr]">
          <aside className="animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(239,235,255,0.54))] p-6 shadow-[0_22px_56px_rgba(140,120,255,0.10)] backdrop-blur-2xl">
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ffcf8c,#c1caff,#8fe1ff)] text-3xl shadow-inner ring-1 ring-white/60">
                  <span className="absolute inset-0 rounded-2xl bg-white/20" />
                  <span className="relative">★</span>
                </div>
                <div>
                  <h1 className="text-[22px] font-semibold tracking-tight text-slate-800">Averra Hub</h1>
                  <p className="font-mono text-[11px] text-[#9b91cf]">dashboard.tsx</p>
                </div>
              </div>
              <p className="max-w-[210px] text-[15px] leading-8 text-slate-600">
                for notes, mood, links and ideas
              </p>
            </div>

            <nav className="mb-8 space-y-3">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  className={`flex w-full items-center gap-4 rounded-[18px] px-4 py-4 text-left text-[16px] font-medium transition duration-300 hover:scale-[1.015] ${
                    item.active
                      ? "bg-[linear-gradient(90deg,#8d7dff,#d1c1ff,#c3ebff)] text-white shadow-[0_18px_34px_rgba(140,120,255,0.22)]"
                      : "bg-white/45 text-slate-700 hover:bg-white/72"
                  } animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]`}
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-16 rounded-[28px] border border-white/65 bg-[linear-gradient(180deg,rgba(240,236,255,0.78),rgba(255,255,255,0.58))] p-4 shadow-[0_18px_40px_rgba(140,120,255,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                  alt="averout"
                  className="h-14 w-14 rounded-full object-cover ring-4 ring-[#d9d0ff] transition duration-500 hover:scale-105"
                />
                <div>
                  <p className="text-[17px] font-semibold text-slate-800">averout</p>
                  <p className="text-sm text-slate-500">@clqbs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#45a6e9] text-white transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg" aria-label="Telegram">
                  ✈
                </a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7b69ff] text-white transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg" aria-label="Discord">
                  ☻
                </a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#967cff] text-white transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg" aria-label="Averra">
                  ◡̈
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-500">Discord: clos3ddd</p>
            </div>
          </aside>

          <main className="rounded-[32px] border border-white/68 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(244,240,255,0.44))] p-6 shadow-[0_22px_60px_rgba(140,120,255,0.10)] backdrop-blur-2xl">
            <div className="mb-6 flex items-start justify-between gap-4 animate-[heroIn_820ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <div>
                <h2 className="text-[42px] font-semibold tracking-tight text-slate-700">
                  Welcome back, Averout 👋
                </h2>
                <p className="mt-2 text-[17px] text-slate-500">
                  Here's an overview of your personal hub today
                </p>
              </div>
              <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/64 text-2xl text-[#998fcb] shadow-sm transition duration-300 hover:scale-105 hover:-translate-y-1">
                ⌕
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.9fr_1.05fr]">
              <WidgetCard title="Today's Mood" icon="🙂" delay={120} codeLabel="mood.store">
                <div className={`rounded-[24px] border border-white/72 bg-gradient-to-br ${mood.accent} p-[1px] shadow-[0_14px_40px_rgba(160,140,255,0.10)]`}>
                  <div className="rounded-[23px] bg-white/78 p-5 shadow-inner shadow-white/50">
                    <p className="mb-3 text-[18px] font-semibold text-slate-700">
                      {mood.label} {mood.emoji}
                    </p>
                    <p className="text-[16px] leading-9 text-slate-600">{mood.text}</p>
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={cycleMood}
                        className="rounded-[16px] border border-[#ded8ff] bg-white px-5 py-3 text-[15px] font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        ＋ Log Mood
                      </button>
                    </div>
                  </div>
                </div>
              </WidgetCard>

              <WidgetCard title="Quick Notes" icon="🗒" delay={180} codeLabel="notes.json">
                <div className="mb-3 flex gap-2">
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a quick note"
                    className="w-full rounded-[16px] border border-white/75 bg-white/74 px-4 py-3 text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={addNote}
                    className="rounded-[16px] bg-gradient-to-r from-[#8b7cff] to-[#c8b7ff] px-4 py-3 text-white shadow-[0_12px_24px_rgba(140,120,255,0.18)] transition duration-300 hover:-translate-y-1"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-3">
                  {notes.map((note, index) => (
                    <div key={note.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-white/70 bg-white/72 px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `${220 + index * 70}ms` }}>
                      <div>
                        <p className="text-[16px] font-medium text-slate-700">{note.title}</p>
                        <p className="mt-1 text-sm text-slate-500">□ {note.meta}</p>
                      </div>
                      <button onClick={() => removeNote(note.id)} className="rounded-full bg-[#fff1f6] px-3 py-2 text-sm text-rose-500 transition hover:scale-105">×</button>
                    </div>
                  ))}
                </div>
              </WidgetCard>

              <WidgetCard title="AI Generator" icon="🪄" delay={240} codeLabel="generate.ts">
                <div className="mb-4 flex flex-wrap gap-2">
                  {aiTags.map((tag, index) => (
                    <button
                      key={tag}
                      onClick={() => setAiPrompt(tag.toLowerCase())}
                      className="rounded-[14px] bg-[#efe8ff] px-4 py-2 text-sm font-medium text-[#7266b2] transition duration-300 hover:-translate-y-1 hover:bg-[#e7ddff] animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]"
                      style={{ animationDelay: `${280 + index * 50}ms` }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="rounded-[22px] border border-white/72 bg-white/76 p-4 shadow-inner shadow-white/50">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                    className="w-full resize-none bg-transparent text-[16px] leading-8 text-slate-700 outline-none"
                  />
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <button
                    onClick={copyAiResult}
                    className="rounded-[16px] border border-[#ded8ff] bg-white px-5 py-3 text-[15px] font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={generateAi}
                    className="rounded-[16px] bg-gradient-to-r from-[#8b7cff] to-[#c8b7ff] px-6 py-3 text-[15px] font-medium text-white shadow-[0_14px_25px_rgba(140,120,255,0.2)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] animate-[pulseGlow_4s_ease-in-out_infinite]"
                  >
                    Generate
                  </button>
                </div>
              </WidgetCard>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.9fr_1.05fr]">
              <WidgetCard title="Saved Links" icon="🔗" delay={300} codeLabel="links.map">
                <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Title"
                    className="rounded-[16px] border border-white/75 bg-white/74 px-4 py-3 text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded-[16px] border border-white/75 bg-white/74 px-4 py-3 text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={addLink}
                    className="rounded-[16px] bg-gradient-to-r from-[#8b7cff] to-[#c8b7ff] px-4 py-3 text-white shadow-[0_12px_24px_rgba(140,120,255,0.18)] transition duration-300 hover:-translate-y-1"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={link.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-white/70 bg-white/72 px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `${340 + index * 70}ms` }}>
                      <div className="min-w-0">
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-[16px] font-medium text-slate-700 hover:text-[#7468c2]">{link.title}</a>
                        <p className="mt-1 truncate text-sm text-slate-500">{link.subtitle}</p>
                      </div>
                      <button onClick={() => removeLink(link.id)} className="rounded-full bg-[#fff1f6] px-3 py-2 text-sm text-rose-500 transition hover:scale-105">×</button>
                    </div>
                  ))}
                </div>
              </WidgetCard>

              <WidgetCard title="Task Queue" icon="◔" delay={360} codeLabel="queue.log">
                <div className="mb-3 flex gap-2">
                  <input
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    placeholder="Add a task"
                    className="w-full rounded-[16px] border border-white/75 bg-white/74 px-4 py-3 text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={addFocusTask}
                    className="rounded-[16px] bg-gradient-to-r from-[#8b7cff] to-[#c8b7ff] px-4 py-3 text-white shadow-[0_12px_24px_rgba(140,120,255,0.18)] transition duration-300 hover:-translate-y-1"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-3">
                  {focusTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-[20px] border border-white/70 px-4 py-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both] ${task.done ? "bg-[#f3f0ff] text-slate-400" : "bg-white/72 text-slate-700"}`}
                      style={{ animationDelay: `${400 + index * 70}ms` }}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-[10px] border transition duration-300 ${task.done ? "border-[#b9aafc] bg-[#e8e1ff]" : "border-[#cfc7ef] bg-white"}`}
                      >
                        {task.done ? "✓" : ""}
                      </button>
                      <span className={`flex-1 text-[16px] ${task.done ? "line-through" : ""}`}>{task.title}</span>
                      <button onClick={() => removeFocusTask(task.id)} className="rounded-full bg-[#fff1f6] px-3 py-2 text-sm text-rose-500 transition hover:scale-105">×</button>
                    </div>
                  ))}
                </div>
              </WidgetCard>

              <WidgetCard title="Today's Focus" icon="🗓" delay={420} codeLabel="focus.today">
                <p className="mb-4 text-[16px] text-slate-600">Tuesday, April 23</p>
                <div className="space-y-3">
                  {focusTasks.slice(0, 3).map((task, index) => (
                    <div key={`focus-${task.id}`} className="flex items-center justify-between rounded-[20px] border border-white/70 bg-white/72 px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `${460 + index * 70}ms` }}>
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${task.priority ? "bg-[#ffe9ba] text-[#d39a2b]" : "bg-[#efeefe] text-[#9187c7]"}`}>
                          {task.priority ? "♥" : "□"}
                        </span>
                        <div>
                          <p className="text-[16px] font-medium text-slate-700">{task.title}</p>
                          {task.priority ? (
                            <div className="mt-1 inline-flex rounded-full bg-[#f4dfaa] px-3 py-1 text-xs font-medium text-[#8c6d20]">
                              High Priority
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <span className="text-xl text-[#a59ad8]">›</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button className="rounded-[16px] border border-[#ded8ff] bg-white px-5 py-3 text-[15px] font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                    ✎ Edit
                  </button>
                  <span className="text-sm text-slate-500">♡ {focusTasks.filter((task) => task.priority).length}</span>
                </div>
              </WidgetCard>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="flex items-center gap-4 rounded-[24px] border border-white/75 bg-white/58 px-5 py-4 shadow-[0_16px_36px_rgba(144,130,255,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(144,130,255,0.16)] animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]"
                  style={{ animationDelay: `${520 + index * 70}ms` }}
                >
                  <span className={`text-3xl ${stat.tone}`}>{stat.icon}</span>
                  <div className="flex items-end gap-2">
                    <span className="text-[34px] font-semibold tracking-tight text-slate-700">{stat.value}</span>
                    <span className="pb-1 text-[16px] text-slate-500">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[26px] border border-white/75 bg-white/50 p-5 shadow-[0_16px_36px_rgba(144,130,255,0.08)] backdrop-blur-xl animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `620ms` }}>
                <p className="font-mono text-[11px] text-[#9b91cf]">response.log</p>
                <pre className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
                  {aiResult}
                </pre>
              </div>

              <div className="rounded-[26px] border border-white/75 bg-white/50 p-5 shadow-[0_16px_36px_rgba(144,130,255,0.08)] backdrop-blur-xl animate-[cardIn_700ms_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `680ms` }}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[17px] font-semibold tracking-tight text-slate-700">Recent prompts</p>
                  <span className="font-mono text-[11px] text-[#9b91cf]">history[]</span>
                </div>
                <div className="space-y-2">
                  {aiHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No requests yet. Generate something first.</p>
                  ) : (
                    aiHistory.map((item, index) => (
                      <button
                        key={`${item}-${index}`}
                        onClick={() => setAiPrompt(item)}
                        className="block w-full rounded-[16px] border border-white/70 bg-white/72 px-4 py-3 text-left text-sm text-slate-700 transition duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        {item}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
