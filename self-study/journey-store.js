/* Personal progress only: this file sends no data to a server. */
(() => {
  'use strict';
  const content = window.EC_JOURNEY_CONTENT;
  const KEY = 'ec:self-study:journey:v1';
  const LEASE = 'ec:self-study:clock:v1';
  const CHANGE = 'ec-journey-change';
  const valid = new Set();
  Object.entries(content.units).forEach(([grade, units]) => Object.entries(units).forEach(([unit, item]) => {
    Object.entries(item.activities).forEach(([skill, ids]) => ids.forEach(id => valid.add(`${grade}:${unit}:${skill}:${id}`)));
  }));
  const blank = () => ({version:1, done:{}, days:{}});
  let memory = blank(), persistent = true, tracking = false;
  const clone = value => JSON.parse(JSON.stringify(value));
  function read() {
    if (!persistent) return clone(memory);
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      const clean = blank();
      if (raw && raw.version === 1) {
        Object.entries(raw.done || {}).forEach(([id, when]) => {
          if (valid.has(id) && Number.isFinite(when) && when > 0) clean.done[id] = when;
        });
        Object.entries(raw.days || {}).forEach(([day, ms]) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(ms) && ms >= 0) clean.days[day] = Math.min(ms, 86400000);
        });
      }
      memory = clean;
    } catch (error) {
      if (!(error instanceof SyntaxError)) persistent = false;
    }
    return clone(memory);
  }
  function change(update) {
    const state = read();
    update(state);
    memory = state;
    if (persistent) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch { persistent = false; }
    }
    window.dispatchEvent(new CustomEvent(CHANGE));
  }
  function complete(grade, unit, skill, activity) {
    const key = `${grade}:${unit}:${skill}:${activity}`;
    if (!valid.has(key)) return false;
    if (!read().done[key]) change(state => { state.done[key] = Date.now(); });
    return true;
  }
  function isComplete(grade, unit, skill, activity, state = read()) {
    return Boolean(state.done[`${grade}:${unit}:${skill}:${activity}`]);
  }
  function unitStats(grade, unit) {
    const item = content.units[grade]?.[unit];
    const state = read();
    const skills = content.skills.map(skill => {
      const ids = item?.activities[skill.id] || [];
      const count = ids.filter(id => isComplete(grade, unit, skill.id, id, state)).length;
      return {...skill, total:ids.length, count, done:ids.length > 0 && count === ids.length};
    });
    const finished = skills.every(skill => skill.done);
    // Writing may be finished early; its ink is printed only after the four colours.
    const printed = skills.slice(0, 4).filter(skill => skill.done).length + Number(finished);
    return {skills, finished, printed, ink:finished};
  }
  function dayKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function moveDay(date, amount) {
    const moved = new Date(date);
    moved.setDate(moved.getDate() + amount);
    return moved;
  }
  function timeSummary(now = new Date()) {
    const state = read(), today = new Date(now);
    today.setHours(0,0,0,0);
    const monday = moveDay(today, -((today.getDay()+6)%7));
    const days = Array.from({length:7}, (_, i) => {
      const date = moveDay(monday, i), key = dayKey(date), ms = state.days[key] || 0;
      return {key, ms, minutes:Math.floor(ms/60000), qualified:ms >= 300000, today:key === dayKey(today), future:date > today, date:date.getDate()};
    });
    let cursor = today, streak = 0;
    if ((state.days[dayKey(cursor)] || 0) < 300000) cursor = moveDay(cursor,-1);
    while ((state.days[dayKey(cursor)] || 0) >= 300000) {
      streak++;
      cursor = moveDay(cursor,-1);
    }
    return {days, streak, minutes:Math.floor(days.filter(day => !day.future).reduce((sum,day) => sum+day.ms,0)/60000), todayMinutes:Math.floor((state.days[dayKey(today)] || 0)/60000)};
  }
  function credit(start, end, duration) {
    if (duration <= 0 || Math.abs((end-start)-duration) > 15000) return;
    // Split at local midnight, including the Sunday/Monday and year boundaries.
    change(state => {
      let cursor = end-duration;
      while (cursor < end) {
        const date = new Date(cursor), boundary = new Date(date);
        boundary.setHours(24,0,0,0);
        const until = Math.min(end, boundary.getTime()), key = dayKey(date);
        state.days[key] = Math.min((state.days[key] || 0) + until-cursor, 86400000);
        cursor = until;
      }
    });
  }
  function startTracking() {
    if (tracking) return;
    tracking = true;
    const owner = window.crypto?.randomUUID?.() || `tab-${Math.random()}`;
    let lastWall = Date.now(), lastTick = performance.now(), wasActive = false;
    function active() { return document.visibilityState === 'visible' && document.hasFocus(); }
    function ownsClock() {
      if (!persistent) return true;
      try {
        const lease = JSON.parse(localStorage.getItem(LEASE) || 'null');
        return !lease || lease.owner === owner || lease.until <= Date.now();
      } catch { return true; }
    }
    function release() {
      try {
        const lease = JSON.parse(localStorage.getItem(LEASE) || 'null');
        if (lease?.owner === owner) localStorage.removeItem(LEASE);
      } catch { /* Progress still works for this visit when storage is blocked. */ }
    }
    function tick() {
      const now = Date.now(), monotonic = performance.now();
      const elapsed = Math.max(0, Math.min(monotonic-lastTick, 6000));
      if (wasActive && ownsClock()) credit(lastWall, now, elapsed);
      lastWall = now;
      lastTick = monotonic;
      wasActive = active() && ownsClock();
      if (wasActive && persistent) {
        try { localStorage.setItem(LEASE, JSON.stringify({owner, until:now+12000})); }
        catch { /* The visible focused page can still keep time in memory. */ }
      } else if (!wasActive) release();
    }
    tick();
    window.setInterval(tick, 5000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    window.addEventListener('blur', () => { tick(); wasActive=false; release(); });
    window.addEventListener('pagehide', () => { tick(); wasActive=false; release(); });
    window.addEventListener('pageshow', () => { lastWall=Date.now(); lastTick=performance.now(); tick(); });
  }
  window.addEventListener('storage', event => {
    if (event.key === KEY) window.dispatchEvent(new CustomEvent(CHANGE));
  });
  read();
  window.ECJourney = Object.freeze({key:KEY, read, complete, isComplete, unitStats, timeSummary, dayKey, startTracking,
    get storageAvailable() { return persistent; },
    onChange(callback) { window.addEventListener(CHANGE, callback); }
  });
})();
