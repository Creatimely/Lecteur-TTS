import { split, wordAt } from './chunker.js';

const $ = (s) => document.querySelector(s);
const synth = window.speechSynthesis;
const ui = {
  text: $('#text'), voice: $('#voice'), rate: $('#rate'), pitch: $('#pitch'),
  volume: $('#volume'), play: $('#play'), pause: $('#pause'), stop: $('#stop'),
  file: $('#file'), count: $('#count'), reader: $('#reader'), status: $('#status'),
  clear: $('#clear'),
};
const KEY = 'lecteur-tts:v1';
let voices = [], chunks = [], idx = 0, state = 'idle';

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const say = (msg) => { ui.status.textContent = msg; };

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      text: ui.text.value, voice: ui.voice.value,
      rate: ui.rate.value, pitch: ui.pitch.value, volume: ui.volume.value,
    }));
  } catch { /* stockage indisponible : on ignore */ }
}

function restore() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}');
    ['text', 'rate', 'pitch', 'volume'].forEach((k) => { if (d[k] != null) ui[k].value = d[k]; });
    return d.voice;
  } catch { return null; }
}

function loadVoices(saved) {
  voices = synth.getVoices();
  const pre = (navigator.language || 'fr').slice(0, 2);
  voices.sort((a, b) =>
    (b.lang.startsWith(pre) - a.lang.startsWith(pre)) || a.name.localeCompare(b.name));
  ui.voice.innerHTML = voices
    .map((v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('');
  if (saved && voices.some((v) => v.voiceURI === saved)) ui.voice.value = saved;
}

function render(from = -1, to = -1) {
  const t = ui.text.value;
  ui.reader.innerHTML = from < 0
    ? esc(t)
    : `${esc(t.slice(0, from))}<mark>${esc(t.slice(from, to))}</mark>${esc(t.slice(to))}`;
  ui.reader.querySelector('mark')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function setState(s) {
  state = s;
  ui.play.disabled = s === 'playing';
  ui.pause.disabled = s !== 'playing';
  ui.stop.disabled = s === 'idle';
  ui.play.textContent = s === 'paused' ? 'Reprendre' : 'Lire';
}

function speakNext() {
  if (idx >= chunks.length) return finish();
  const c = chunks[idx];
  const u = new SpeechSynthesisUtterance(c.text);
  const v = voices.find((x) => x.voiceURI === ui.voice.value);
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = +ui.rate.value; u.pitch = +ui.pitch.value; u.volume = +ui.volume.value;
  u.onboundary = (e) => {
    if (e.name && e.name !== 'word') return;
    const [a, b] = wordAt(ui.text.value, c.start + e.charIndex);
    render(a, b);
  };
  u.onend = () => { if (state === 'playing') { idx++; speakNext(); } };
  u.onerror = (e) => {
    if (e.error === 'interrupted' || e.error === 'canceled') return;
    say(`Erreur de synthèse : ${e.error}`); finish();
  };
  synth.speak(u);
}

function finish() { synth.cancel(); render(); setState('idle'); say('Lecture terminée.'); }

function play() {
  if (state === 'paused') { synth.resume(); setState('playing'); say('Lecture reprise.'); return; }
  if (!ui.text.value.trim()) { say('Saisissez ou importez un texte à lire.'); ui.text.focus(); return; }
  synth.cancel();
  chunks = split(ui.text.value); idx = 0;
  setState('playing'); say('Lecture en cours…'); save(); speakNext();
}

function pause() {
  if (state === 'playing') { synth.pause(); setState('paused'); say('En pause.'); }
}

function stop() { state = 'idle'; synth.cancel(); render(); setState('idle'); say('Lecture arrêtée.'); }

function init() {
  if (!synth) {
    say('Votre navigateur ne prend pas en charge la synthèse vocale. Essayez Chrome, Edge, Safari ou Firefox récents.');
    document.querySelectorAll('button, select').forEach((el) => { el.disabled = true; });
    return;
  }
  const saved = restore();
  loadVoices(saved);
  synth.addEventListener?.('voiceschanged', () => loadVoices(ui.voice.value || saved));
  ['rate', 'pitch', 'volume'].forEach((k) => {
    const out = $(`#${k}-out`);
    out.textContent = (+ui[k].value).toFixed(1);
    ui[k].addEventListener('input', () => { out.textContent = (+ui[k].value).toFixed(1); save(); });
  });
  ui.text.addEventListener('input', () => {
    ui.count.textContent = `${ui.text.value.length} caractères`; render(); save();
  });
  ui.voice.addEventListener('change', save);
  ui.play.addEventListener('click', play);
  ui.pause.addEventListener('click', pause);
  ui.stop.addEventListener('click', stop);
  ui.clear.addEventListener('click', () => { stop(); ui.text.value = ''; ui.text.dispatchEvent(new Event('input')); });
  ui.file.addEventListener('change', async () => {
    const f = ui.file.files[0];
    if (!f) return;
    ui.text.value = await f.text();
    ui.text.dispatchEvent(new Event('input'));
    say(`Fichier « ${f.name} » importé.`);
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); state === 'playing' ? pause() : play(); }
    if (e.key === 'Escape') stop();
  });
  window.addEventListener('beforeunload', () => synth.cancel());
  ui.text.dispatchEvent(new Event('input'));
  setState('idle');
}

init();
