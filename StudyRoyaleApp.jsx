import React, {useState, useEffect, useRef} from "react";
/* StudyRoyaleApp component with Prague daily reset and integration placeholders */
const INITIAL_ELIXIR = 16;
const MAGICAL_CHEST_THRESHOLD = 14;
const SUBJECT_CARDS = [
  { id: 'math', title: 'Math Review', minutes: 20, elixir: 2, desc: 'Basics, core problems' },
  { id: 'calc', title: 'Calculus 1', minutes: 25, elixir: 3, desc: 'Derivatives, integrals' },
  { id: 'disc', title: 'Discrete Math', minutes: 20, elixir: 2, desc: 'Logic, proofs' },
  { id: 'la', title: 'Linear Algebra', minutes: 20, elixir: 2, desc: 'Vectors & matrices' },
  { id: 'py', title: 'Python', minutes: 20, elixir: 2, desc: 'Coding exercises' },
  { id: 'flash', title: 'Flashcards', minutes: 10, elixir: 1, desc: 'Quick recall' },
  { id: 'mini', title: 'Exam Mini', minutes: 15, elixir: 1, desc: 'Short exam practice' }
];
function pragueDateString() {
  const now = new Date();
  const prague = new Date(now.toLocaleString('en-GB', { timeZone: 'Europe/Prague' }));
  const y = prague.getFullYear();
  const m = String(prague.getMonth() + 1).padStart(2, '0');
  const d = String(prague.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function shuffleArray(arr) { const copy = arr.slice(); for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
export default function StudyRoyaleApp() {
  const [elixir, setElixir] = useState(INITIAL_ELIXIR);
  const [deck, setDeck] = useState([]);
  const [drawIndex, setDrawIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [trophies, setTrophies] = useState(100);
  const [dailyTrophies, setDailyTrophies] = useState(0);
  const [chests, setChests] = useState([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [battlesToday, setBattlesToday] = useState(0);
  const [specialCardUsed, setSpecialCardUsed] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    const key = 'study_royale_state_v2';
    const raw = localStorage.getItem(key);
    let loaded = null;
    if (raw) {
      try { loaded = JSON.parse(raw); } catch (e) { console.warn('invalid saved state'); }
    }
    const lastPragueDate = localStorage.getItem('study_royale_lastPragueDate');
    const todayPrague = pragueDateString();
    if (lastPragueDate !== todayPrague) {
      const core = SUBJECT_CARDS.slice(0,5);
      const bonuses = SUBJECT_CARDS.slice(5);
      const includeBonus = Math.random() > 0.3;
      const chosen = core.concat(includeBonus ? [bonuses[Math.floor(Math.random()*bonuses.length)]] : []);
      setDeck(shuffleArray(chosen));
      setDrawIndex(0);
      setElixir(INITIAL_ELIXIR);
      setBattlesToday(0);
      setDailyTrophies(0);
      setChests([]);
      setSpecialCardUsed(false);
      localStorage.setItem('study_royale_lastPragueDate', todayPrague);
      const newState = { elixir: INITIAL_ELIXIR, deck: chosen, drawIndex:0, trophies: loaded?.trophies ?? 100, chests: [], battlesToday:0, specialCardUsed:false };
      localStorage.setItem(key, JSON.stringify(newState));
    } else if (loaded) {
      if (typeof loaded.elixir === 'number') setElixir(loaded.elixir);
      if (Array.isArray(loaded.deck) && loaded.deck.length) setDeck(loaded.deck);
      if (typeof loaded.drawIndex === 'number') setDrawIndex(loaded.drawIndex);
      if (typeof loaded.trophies === 'number') setTrophies(loaded.trophies);
      if (Array.isArray(loaded.chests)) setChests(loaded.chests);
      if (typeof loaded.battlesToday === 'number') setBattlesToday(loaded.battlesToday);
      if (typeof loaded.specialCardUsed === 'boolean') setSpecialCardUsed(loaded.specialCardUsed);
    } else {
      const core = SUBJECT_CARDS.slice(0,5);
      const bonuses = SUBJECT_CARDS.slice(5);
      const includeBonus = Math.random() > 0.3;
      const chosen = core.concat(includeBonus ? [bonuses[Math.floor(Math.random()*bonuses.length)]] : []);
      setDeck(shuffleArray(chosen));
      setDrawIndex(0);
      localStorage.setItem('study_royale_lastPragueDate', todayPrague);
      const initialState = { elixir: INITIAL_ELIXIR, deck: chosen, drawIndex:0, trophies:100, chests:[], battlesToday:0, specialCardUsed:false };
      localStorage.setItem('study_royale_state_v2', JSON.stringify(initialState));
    }
  }, []);
  useEffect(() => {
    const key = 'study_royale_state_v2';
    const state = { elixir, deck, drawIndex, trophies, chests, battlesToday, specialCardUsed };
    localStorage.setItem(key, JSON.stringify(state));
  }, [elixir, deck, drawIndex, trophies, chests, battlesToday, specialCardUsed]);
  useEffect(() => {
    if (!currentCard && drawIndex < deck.length) {
      const t = setTimeout(() => {
        setCurrentCard(deck[drawIndex]);
        setDrawIndex(d => d + 1);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [currentCard, drawIndex, deck]);
  function playCard(card) {
    if (!card) return;
    if (elixir < card.elixir) { alert("Not enough elixir — try a smaller card or use a special card."); return; }
    setElixir(prev => prev - card.elixir);
    setTrophies(prev => prev + 6);
    setDailyTrophies(prev => prev + 6);
    startStudyTimer(card.minutes);
    const prevSpent = Number(localStorage.getItem('study_royale_elixirSpentToday') || 0);
    const newSpent = prevSpent + card.elixir;
    localStorage.setItem('study_royale_elixirSpentToday', String(newSpent));
    if (newSpent >= MAGICAL_CHEST_THRESHOLD) {
      addChest('Magical Chest');
    } else if (newSpent >= 8) {
      addChest('Gold Chest');
    } else if (newSpent >= 3) {
      addChest('Wooden Chest');
    }
  }
  function addChest(name) { setChests(prev => [...prev, {name, id: Date.now()}]); }
  function finishAllCardsReward() { setTrophies(prev => prev + 10); setDailyTrophies(prev => prev + 10); }
  function startStudyTimer(minutes) {
    const totalSeconds = minutes * 60;
    setTimeLeftSeconds(totalSeconds);
    setIsStudying(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsStudying(false);
          setBattlesToday(prev => prev + 1);
          const newBattles = battlesToday + 1;
          if (newBattles % 3 === 0) addChest('Battle Chest');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }
  function useFuryCard() { if (specialCardUsed) return alert('You can use only one special card per day.'); setTrophies(prev => prev + 2); setDailyTrophies(prev => prev + 2); setSpecialCardUsed(true); }
  function useElixirCollector() { if (specialCardUsed) return alert('You can use only one special card per day.'); setElixir(prev => prev + 1); setSpecialCardUsed(true); }
  function useRageCard() { if (specialCardUsed) return alert('You can use only one special card per day.'); setSpecialCardUsed(true); alert('Rage Card activated! Next played card will give double trophies (not implemented: demo only).'); }
  const GOOGLE_SHEETS_URL = '';
  async function pushToGoogleSheets() {
    if (!GOOGLE_SHEETS_URL) { alert('No Google Sheets URL configured. See README in project for setup steps.'); return; }
    try {
      const payload = { date: pragueDateString(), trophies, dailyTrophies, battlesToday };
      await fetch(GOOGLE_SHEETS_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      alert('Pushed to Google Sheets.');
    } catch (e) { console.error(e); alert('Failed to push to Google Sheets (see console).'); }
  }
  function formatTime(seconds) { const m = Math.floor(seconds / 60).toString().padStart(2, '0'); const s = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
  function arenaForTrophies(t) { if (t < 80) return 'Bronze Arena'; if (t < 180) return 'Silver Arena'; if (t < 350) return 'Gold Arena'; if (t < 500) return 'Crystal Arena'; if (t < 800) return 'Champion Arena'; if (t < 1200) return 'Grandmaster Arena'; return 'Legends Arena'; }
  return (
    <div className="min-h-screen p-6 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Study Royale — Ana's Arena</h1>
            <p className="text-sm text-slate-300">Clash-style study game: deck, elixir, chests, trophies. Resets at Prague midnight.</p>
          </div>
          <div className="text-right">
            <div className="text-sm">Arena: <span className="font-semibold">{arenaForTrophies(trophies)}</span></div>
            <div className="text-sm">Trophies: <span className="font-bold">{trophies}</span></div>
          </div>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="md:col-span-2 bg-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daily Deck</h2>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-slate-700 rounded-full">Elixir: <strong>{elixir}</strong></div>
                <div className="px-3 py-1 bg-slate-700 rounded-full">Battles today: {battlesToday}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {deck.map((c, idx) => (
                <div key={`${c.id}-${idx}`} className={`p-3 rounded-xl border ${idx < drawIndex ? 'opacity-50' : 'bg-slate-700/40'} `}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold">{c.title}</div>
                      <div className="text-xs text-slate-300">{c.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{c.minutes}m</div>
                      <div className="text-sm">{c.elixir}ⓔ</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { setCurrentCard(c); }} className="flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-black rounded-md py-2 font-medium">Inspect</button>
                    <button onClick={() => { playCard(c); }} className="px-3 bg-indigo-500/90 hover:bg-indigo-500 rounded-md font-medium">Play</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-slate-700/40 rounded-xl p-4">
              <h3 className="font-semibold">Current Card</h3>
              {currentCard ? (
                <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold">{currentCard.title}</div>
                    <div className="text-sm text-slate-300">{currentCard.desc}</div>
                    <div className="mt-2 text-sm">Time: {currentCard.minutes} minutes • Cost: {currentCard.elixir} elixir</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startStudyTimer(currentCard.minutes)} className="px-4 py-2 bg-rose-500 rounded-md font-semibold">Start Timer</button>
                    <button onClick={() => { finishAllCardsReward(); }} className="px-3 py-2 bg-yellow-500 rounded-md font-semibold text-slate-900">Mark Done</button>
                    <button onClick={() => setCurrentCard(null)} className="px-3 py-2 bg-slate-600 rounded-md">Dismiss</button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-slate-300">No card selected yet. Draw will auto-happen or tap "Inspect" on a card.</div>
              )}
              <div className="mt-4">
                <div className="text-sm">Timer: <span className="font-mono">{formatTime(timeLeftSeconds)}</span></div>
                <div className="h-3 bg-slate-600 rounded-full mt-2 overflow-hidden">
                  <div style={{width: `${(timeLeftSeconds / (currentCard ? currentCard.minutes*60 : 1))*100}%`}} className="h-full bg-emerald-400/80"></div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={useFuryCard} className="flex-1 bg-pink-500/90 rounded-md py-2">Use Fury Card (+2 trophies)</button>
              <button onClick={useElixirCollector} className="flex-1 bg-yellow-400/90 rounded-md py-2 text-black">Use Elixir Collector (+1 elixir)</button>
              <button onClick={useRageCard} className="flex-1 bg-red-600/90 rounded-md py-2">Use Rage Card (double trophies)</button>
            </div>
          </section>
          <aside className="bg-slate-800/60 rounded-2xl p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Progress</h3>
              <div className="mt-2 text-sm">Elixir left: <strong>{elixir}</strong> / {INITIAL_ELIXIR}</div>
              <div className="mt-2 text-sm">Daily trophies: <strong>{dailyTrophies}</strong></div>
              <div className="mt-2 text-sm">Streak: <strong>—</strong></div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Chests</h3>
              <div className="mt-2 grid gap-2">
                {chests.length === 0 ? (
                  <div className="text-slate-400 text-sm">No chests yet — open them by earning elixir/trophies/battles.</div>
                ) : (
                  chests.map(c => (
                    <div key={c.id} className="p-2 bg-slate-700 rounded-md flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-slate-300">Claim your reward!</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => alert('Chest opened! Claim your selected reward.')} className="px-3 py-1 bg-amber-400 rounded-md text-slate-900">Open</button>
                        <button onClick={() => setChests(prev => prev.filter(x => x.id !== c.id))} className="px-3 py-1 bg-slate-600 rounded-md">Discard</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Integration</h3>
              <div className="mt-2 text-sm">Google Sheets: <button onClick={pushToGoogleSheets} className="ml-2 px-2 py-1 bg-indigo-500 rounded-md">Push</button></div>
              <div className="mt-2 text-sm">Notion: see README for setup steps</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="mt-2 grid gap-2">
                <button onClick={() => { setElixir(INITIAL_ELIXIR); localStorage.setItem('study_royale_elixirSpentToday','0'); alert('Elixir refilled for the day.'); }} className="w-full bg-indigo-500 rounded-md py-2">Refill Elixir</button>
                <button onClick={() => { finishAllCardsReward(); alert('All cards finished reward applied.'); }} className="w-full bg-emerald-500 rounded-md py-2">Finish All Cards (+10 trophies)</button>
                <button onClick={() => {
                  const state = {elixir, deck, drawIndex, trophies, chests, battlesToday};
                  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'study_royale_state.json';
                  a.click();
                }} className="w-full bg-slate-600 rounded-md py-2">Export State</button>
              </div>
            </div>
          </aside>
        </main>
        <footer className="mt-8 text-center text-slate-400">
          <div className="text-sm">Tips: Game resets at Prague midnight. Push to Google Sheets to log daily trophies (configure Apps Script URL in component).</div>
          <div className="text-xs mt-2">Built for Ana — tweak subjects in SUBJECT_CARDS constant.</div>
        </footer>
      </div>
    </div>
  );
}
