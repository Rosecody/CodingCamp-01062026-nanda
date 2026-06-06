'use strict';

// ── Storage Keys ──────────────────────────────────────────────
const KEY = {
  TASKS:  'dashboard_tasks',
  LINKS:  'dashboard_links',
  THEME:  'dashboard_theme',
  NAME:   'dashboard_name',
};

// ── State ─────────────────────────────────────────────────────
let tasks  = [];
let links  = [];
let theme  = 'dark';
let userName = '';

let timerInterval  = null;
let timerSeconds   = 25 * 60;   // 25 min in seconds
let timerRunning   = false;
const TIMER_TOTAL  = 25 * 60;

// ── Helpers: LocalStorage ─────────────────────────────────────
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch(e) { return fallback; }
}

// ── Helpers: DOM ──────────────────────────────────────────────
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

// ── Helpers: Misc ─────────────────────────────────────────────
function slugify(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getDomain(url) {
  try {
    const u = url.startsWith('http') ? url : 'https://' + url;
    return new URL(u).hostname;
  } catch { return null; }
}

function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
}

// ── THEME ─────────────────────────────────────────────────────
function applyTheme(t) {
  theme = t;
  document.documentElement.setAttribute('data-theme', t);
  qs('#theme-toggle').textContent = t === 'dark' ? '☀️' : '🌙';
  save(KEY.THEME, t);
}

function toggleTheme() {
  applyTheme(theme === 'dark' ? 'light' : 'dark');
}

// ── GREETING ─────────────────────────────────────────────────
function padTwo(n) { return String(n).padStart(2, '0'); }

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const m    = now.getMinutes();
  const s    = now.getSeconds();

  // Time display
  const timeEl = qs('#time-display');
  if (timeEl) {
    timeEl.innerHTML =
      `${padTwo(h)}<span class="colon">:</span>${padTwo(m)}<span class="colon" style="font-size:0.5em;opacity:0.4">:${padTwo(s)}</span>`;
  }

  // Date display
  const dateEl = qs('#date-display');
  if (dateEl) {
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    dateEl.textContent =
      `${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }

  // Greeting
  const greetEl = qs('#greeting-text');
  if (greetEl) {
    let phrase;
    if (h >= 5  && h < 12) phrase = 'Good morning';
    else if (h >= 12 && h < 17) phrase = 'Good afternoon';
    else if (h >= 17 && h < 21) phrase = 'Good evening';
    else phrase = 'Good night';

    const nameHtml = userName
      ? `, <span class="name-highlight">${escapeHtml(userName)}</span>`
      : '';
    greetEl.innerHTML = `${phrase}${nameHtml}.`;
  }
}

// ── NAME MODAL ────────────────────────────────────────────────
function openNameModal() {
  const modal = qs('#name-modal');
  const input = qs('#name-input-modal');
  input.value = userName;
  modal.classList.add('open');
  setTimeout(() => input.focus(), 100);
}

function closeNameModal() {
  qs('#name-modal').classList.remove('open');
}

function saveName() {
  const val = qs('#name-input-modal').value.trim();
  userName = val;
  save(KEY.NAME, userName);
  updateClock();
  closeNameModal();
}

// ── TIMER ─────────────────────────────────────────────────────
function renderTimer() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  qs('#timer-digits').textContent = `${padTwo(m)}:${padTwo(s)}`;

  // Ring progress
  const circumference = 339.29; // 2 * π * 54
  const progress = timerSeconds / TIMER_TOTAL;
  const offset = circumference * (1 - progress);
  const ring = qs('#timer-ring-progress');
  ring.style.strokeDashoffset = offset;

  // Danger pulse (under 60 seconds and running)
  if (timerSeconds <= 60 && timerRunning) {
    ring.classList.add('danger-pulse');
  } else {
    ring.classList.remove('danger-pulse');
  }

  // Buttons
  qs('#timer-start').textContent   = timerRunning ? 'Pause' : 'Start';
  qs('#timer-start').className     = timerRunning ? 'btn btn-timer-active' : 'btn btn-primary';
  qs('#timer-reset').disabled      = (timerSeconds === TIMER_TOTAL && !timerRunning);

  // Label
  qs('#timer-status').textContent  = timerRunning
    ? 'Focus session active — stay locked in'
    : (timerSeconds === TIMER_TOTAL ? '25-minute focus session' : 'Session paused');
}

function startTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    renderTimer();
    return;
  }
  if (timerSeconds === 0) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 0;
      renderTimer();
      // Done notification
      qs('#timer-status').textContent = '🎉 Session complete! Take a break.';
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus session complete!', {
          body: 'Great work. Time for a break.'
        });
      }
      return;
    }
    timerSeconds--;
    renderTimer();
  }, 1000);
  renderTimer();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  renderTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = TIMER_TOTAL;
  renderTimer();
}

// ── TO-DO ─────────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function saveTasks() { save(KEY.TASKS, tasks); }

function isDuplicate(text) {
  const s = slugify(text);
  return tasks.some(t => t.slug === s);
}

function addTask() {
  const input   = qs('#todo-input');
  const toast   = qs('#duplicate-toast');
  const text    = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  if (isDuplicate(text)) {
    input.classList.add('input-shake');
    toast.classList.add('visible');
    setTimeout(() => {
      input.classList.remove('input-shake');
      toast.classList.remove('visible');
    }, 2500);
    return;
  }

  tasks.unshift({ id: Date.now(), text, slug: slugify(text), done: false });
  saveTasks();
  input.value = '';
  renderTasks();
  input.focus();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  const item = qs(`[data-task-id="${id}"]`);
  if (item) {
    item.style.transition = 'opacity 0.15s, transform 0.15s';
    item.style.opacity = '0';
    item.style.transform = 'translateX(10px)';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 150);
  }
}

function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const item = qs(`[data-task-id="${id}"]`);
  const textEl = item.querySelector('.todo-text');

  // Replace span with input
  const editInput = document.createElement('input');
  editInput.className = 'todo-edit-input';
  editInput.value = task.text;
  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      // Revert
      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = task.text;
      span.addEventListener('dblclick', () => startEdit(id));
      editInput.replaceWith(span);
      return;
    }
    // Duplicate check (excluding self)
    const dupExists = tasks.some(t => t.id !== id && slugify(t.text) === slugify(newText));
    if (dupExists) {
      editInput.style.borderBottomColor = 'var(--danger)';
      editInput.title = 'Duplicate task';
      setTimeout(() => { editInput.style.borderBottomColor = ''; }, 1500);
      return;
    }
    task.text = newText;
    task.slug = slugify(newText);
    saveTasks();
    renderTasks();
  }

  editInput.addEventListener('blur', commitEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); editInput.blur(); }
    if (e.key === 'Escape') {
      editInput.removeEventListener('blur', commitEdit);
      renderTasks();
    }
  });
}

function renderTasks() {
  const list  = qs('#todo-list');
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;

  qs('#task-count').textContent = `${total} task${total !== 1 ? 's' : ''}`;
  qs('#task-done-count').textContent = done > 0 ? `${done} done` : '';
  qs('#task-done-pill').style.display = done > 0 ? '' : 'none';

  if (!total) {
    list.innerHTML = '<li class="todo-empty">No tasks yet. Add one above ✦</li>';
    return;
  }

  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.taskId = task.id;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-checkbox';
    cb.checked = task.done;
    cb.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;
    span.addEventListener('dblclick', () => startEdit(task.id));
    span.title = 'Double-click to edit';

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', () => startEdit(task.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '✕';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    list.appendChild(li);
  });
}

// ── QUICK LINKS ───────────────────────────────────────────────
function saveLinks() { save(KEY.LINKS, links); }

function addLink() {
  const labelInput = qs('#link-label-input');
  const urlInput   = qs('#link-url-input');
  const label = labelInput.value.trim();
  const url   = normalizeUrl(urlInput.value);

  if (!url) { urlInput.focus(); return; }

  const displayLabel = label || (getDomain(url) || url);
  links.push({ id: Date.now(), label: displayLabel, url });
  saveLinks();
  labelInput.value = '';
  urlInput.value = '';
  renderLinks();
}

function removeLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function renderLinks() {
  const grid = qs('#links-grid');

  if (!links.length) {
    grid.innerHTML = '<span class="links-empty">No links saved yet.</span>';
    return;
  }

  grid.innerHTML = '';
  links.forEach(link => {
    const chip = document.createElement('a');
    chip.className = 'link-chip';
    chip.href = link.url;
    chip.target = '_blank';
    chip.rel = 'noopener noreferrer';
    chip.title = link.url;

    const domain = getDomain(link.url);
    if (domain) {
      const img = document.createElement('img');
      img.className = 'link-chip-favicon';
      img.src = `https://www.google.com/s2/favicons?sz=16&domain=${domain}`;
      img.alt = '';
      img.onerror = () => img.remove();
      chip.appendChild(img);
    }

    chip.appendChild(document.createTextNode(link.label));

    const rmBtn = document.createElement('button');
    rmBtn.className = 'link-chip-remove';
    rmBtn.innerHTML = '×';
    rmBtn.title = 'Remove';
    rmBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      removeLink(link.id);
    });

    chip.appendChild(rmBtn);
    grid.appendChild(chip);
  });
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────
function initKeyboardShortcuts() {
  qs('#todo-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  qs('#link-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });
  qs('#link-label-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });
  qs('#name-input-modal').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') closeNameModal();
  });
  // Close modal on overlay click
  qs('#name-modal').addEventListener('click', e => {
    if (e.target === qs('#name-modal')) closeNameModal();
  });
}

// ── EVENT BINDINGS ────────────────────────────────────────────
function bindEvents() {
  qs('#theme-toggle').addEventListener('click', toggleTheme);
  qs('#name-edit-btn').addEventListener('click', openNameModal);
  qs('#name-save-btn').addEventListener('click', saveName);
  qs('#name-cancel-btn').addEventListener('click', closeNameModal);

  qs('#timer-start').addEventListener('click', startTimer);
  qs('#timer-stop').addEventListener('click', stopTimer);
  qs('#timer-reset').addEventListener('click', resetTimer);

  qs('#todo-add-btn').addEventListener('click', addTask);
  qs('#link-add-btn').addEventListener('click', addLink);

  initKeyboardShortcuts();

  // Notification permission request on first timer start
  qs('#timer-start').addEventListener('click', () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, { once: true });
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  // Load persisted data
  theme    = load(KEY.THEME, 'dark');
  userName = load(KEY.NAME,  '');
  tasks    = load(KEY.TASKS, []);
  links    = load(KEY.LINKS, []);

  // Ensure tasks have proper shape
  tasks = tasks
    .filter(t => t && typeof t.id === 'number' && typeof t.text === 'string')
    .map(t => ({ ...t, slug: t.slug ?? slugify(t.text) })); // backfill slug for old data
  links = links.filter(l => l && typeof l.id === 'number' && typeof l.url === 'string');

  applyTheme(theme);
  updateClock();
  setInterval(updateClock, 1000);

  renderTimer();
  renderTasks();
  renderLinks();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
