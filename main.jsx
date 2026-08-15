import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const QUESTIONS = [
  { emoji: "🐍 + 👨‍💻", clue: "I'm one of the most beginner-friendly programming languages.", answer: "python" },
  { emoji: "☁️ + 💻", clue: "Your files can live here without being stored on your laptop.", answer: "cloud computing" },
  { emoji: "📷 + 🤖 + 👁️", clue: "I help machines understand what they see.", answer: "computer vision" },
  { emoji: "📡 + 📱 + 🌐", clue: "I connect everyday devices so they can communicate over the internet.", answer: "internet of things" },
  { emoji: "🧠 + 📊 + 🤖", clue: "I let computers learn patterns from data.", answer: "machine learning" },
  { emoji: "🔐 + 🔑 + 💻", clue: "I protect information by turning it into a form outsiders cannot easily read.", answer: "encryption" },
  { emoji: "🧠 + ⚡ + 🖥️", clue: "I am the tiny brain that controls many electronic systems.", answer: "microcontroller" },
  { emoji: "🌡️ + 📟", clue: "I detect temperature and convert it into a measurable signal.", answer: "temperature sensor" },
  { emoji: "🧲 + ⚡ + 📏", clue: "I can sense magnetic fields and are commonly used for position or speed sensing.", answer: "hall effect sensor" },
  { emoji: "📶 + 💻 + 🔗", clue: "I allow devices to exchange data without a physical cable.", answer: "wireless communication" }
];

const normalize = (s) =>
  s.toLowerCase().trim().replace(/[.,!?'"’]/g, "").replace(/\s+/g, " ");

const aliases = {
  "cloud computing": ["cloud", "cloud computing"],
  "computer vision": ["computer vision"],
  "internet of things": ["internet of things", "iot"],
  "machine learning": ["machine learning", "ml"],
  "microcontroller": ["microcontroller", "micro controller", "mcu"],
  "temperature sensor": ["temperature sensor", "thermometer", "temp sensor"],
  "hall effect sensor": ["hall effect sensor", "hall sensor"],
  "wireless communication": ["wireless communication", "wireless"]
};

function isCorrect(input, answer) {
  const n = normalize(input);
  return n === answer || (aliases[answer] || []).includes(n);
}

const DEMO_KEY = "aitronics-demo-leaderboard";

function getConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
  };
}

function getSupabase() {
  const { url, key } = getConfig();
  return url && key ? createClient(url, key) : null;
}

async function saveScore(name, score, seconds) {
  const supabase = getSupabase();
  const row = { name, score, seconds, created_at: new Date().toISOString() };
  if (supabase) {
    const { error } = await supabase.from("quiz_scores").insert(row);
    if (!error) return;
  }
  const current = JSON.parse(localStorage.getItem(DEMO_KEY) || "[]");
  current.push(row);
  current.sort((a, b) => b.score - a.score || a.seconds - b.seconds);
  localStorage.setItem(DEMO_KEY, JSON.stringify(current.slice(0, 100)));
}

async function loadScores() {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("quiz_scores")
      .select("name,score,seconds,created_at")
      .order("score", { ascending: false })
      .order("seconds", { ascending: true })
      .limit(100);
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]")
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds);
}

function App() {
  const path = window.location.pathname;
  const leaderboardOnly = path.endsWith("/leaderboard");
  const qrOnly = path.endsWith("/qr");

  if (leaderboardOnly) return <LeaderboardPage />;
  if (qrOnly) return <QRPage />;
  return <Quiz />;
}

function Shell({ children }) {
  return (
    <div className="app">
      <div className="grid-bg" />
      <header className="topbar">
        <div className="brand"><span className="brand-dot" /> AITRONICS</div>
        <div className="tag">EMOJI TECH QUIZ</div>
      </header>
      {children}
      <footer>AITronics • JIIT • Decode the tech.</footer>
    </div>
  );
}

function Quiz() {
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [time, setTime] = useState(20);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished || feedback) return;
    const t = setInterval(() => {
      setTime((x) => {
        if (x <= 1) {
          submitAnswer(true);
          return 20;
        }
        return x - 1;
      });
      setTotalSeconds((x) => x + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished, feedback, index]);

  const submitAnswer = async (timeout = false) => {
    if (feedback) return;
    const q = QUESTIONS[index];
    const correct = !timeout && isCorrect(answer, q.answer);
    const points = correct ? (time >= 10 ? 15 : 10) : 0;
    setScore((s) => s + points);
    setFeedback({ correct, points, timeout, answer: q.answer });
    setTimeout(() => {
      if (index === QUESTIONS.length - 1) {
        const finalScore = score + points;
        saveScore(name.trim(), finalScore, totalSeconds);
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setAnswer("");
        setFeedback(null);
        setTime(20);
      }
    }, 900);
  };

  if (!started) {
    return (
      <Shell>
        <main className="center">
          <div className="hero-card">
            <div className="eyebrow">HELPDESK CHALLENGE / 01</div>
            <h1>DECODE<br /><span>THE TECH.</span></h1>
            <p className="hero-copy">Scan. Think. Type the answer. Climb the leaderboard.</p>
            <div className="rules">
              <div><b>10</b><span>questions</span></div>
              <div><b>20s</b><span>per question</span></div>
              <div><b>15</b><span>speed bonus</span></div>
            </div>
            <input
              className="name-input"
              placeholder="Enter your name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStarted(true)}
            />
            <button className="primary" disabled={!name.trim()} onClick={() => setStarted(true)}>START QUIZ →</button>
            <a className="sub-link" href="/leaderboard">View leaderboard</a>
          </div>
        </main>
      </Shell>
    );
  }

  if (finished) {
    return (
      <Shell>
        <main className="center">
          <div className="hero-card result">
            <div className="eyebrow">QUIZ COMPLETE</div>
            <div className="score-big">{score}</div>
            <div className="score-label">POINTS</div>
            <p>Nice work, <b>{name}</b>.</p>
            <button className="primary" onClick={() => location.href = "/leaderboard"}>SEE LEADERBOARD →</button>
            <button className="ghost" onClick={() => location.reload()}>PLAY AGAIN</button>
          </div>
        </main>
      </Shell>
    );
  }

  const q = QUESTIONS[index];
  return (
    <Shell>
      <main className="quiz-wrap">
        <div className="quiz-meta">
          <span>PLAYER: {name.toUpperCase()}</span>
          <span>{index + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="progress"><div style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
        <section className="question-card">
          <div className="q-top"><span>DECODE IT</span><span className={time <= 5 ? "urgent" : ""}>00:{String(time).padStart(2, "0")}</span></div>
          <div className="emoji">{q.emoji}</div>
          <p className="clue">“{q.clue}”</p>
          <input
            autoFocus
            className="answer-input"
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
            disabled={!!feedback}
          />
          <button className="primary submit" disabled={!answer.trim() || !!feedback} onClick={() => submitAnswer()}>SUBMIT ↗</button>
          {feedback && (
            <div className={`feedback ${feedback.correct ? "correct" : "wrong"}`}>
              {feedback.correct ? `✓ CORRECT  +${feedback.points}` : `✕ ${feedback.timeout ? "TIME'S UP" : "NOT QUITE"}  •  ${feedback.answer}`}
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}

function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = async () => {
    setScores(await loadScores());
    setLastUpdate(new Date());
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <Shell>
      <main className="leader-wrap">
        <div className="leader-head">
          <div>
            <div className="eyebrow">LIVE / HELP DESK</div>
            <h2>LEADERBOARD</h2>
          </div>
          <div className="live"><i /> LIVE<br /><small>{lastUpdate.toLocaleTimeString()}</small></div>
        </div>
        <div className="leader-table">
          <div className="leader-row header"><span>RANK</span><span>NAME</span><span>SCORE</span></div>
          {scores.length === 0 && <div className="empty">No scores yet. Be the first to decode the tech.</div>}
          {scores.map((s, i) => (
            <div className="leader-row" key={`${s.name}-${s.created_at}-${i}`}>
              <span className="rank">{i < 3 ? ["🥇","🥈","🥉"][i] : String(i + 1).padStart(2, "0")}</span>
              <span>{s.name}</span>
              <b>{s.score}</b>
            </div>
          ))}
        </div>
        <a className="sub-link center-link" href="/">← Back to quiz</a>
      </main>
    </Shell>
  );
}

function QRPage() {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(window.location.origin + "/", { width: 600, margin: 2 }, (err, url) => !err && setSrc(url));
  }, []);
  return (
    <Shell>
      <main className="center">
        <div className="qr-card">
          <div className="eyebrow">A I T R O N I C S</div>
          <h2>SCAN TO<br />PLAY</h2>
          {src && <img className="qr" src={src} alt="Quiz QR code" />}
          <p>Point your phone camera here.<br />No app. No form. Just decode.</p>
          <button className="primary" onClick={() => window.print()}>PRINT QR POSTER</button>
        </div>
      </main>
    </Shell>
  );
}

createRoot(document.getElementById("root")).render(<App />);
