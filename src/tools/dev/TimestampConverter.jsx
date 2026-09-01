import React, { useState, useEffect, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Clock, Calendar, Copy, Check, Sparkles, HelpCircle
} from 'lucide-react';
import './TimestampConverter.css';

// Helper: Convert Date object to local datetime-local input string (YYYY-MM-DDTHH:mm:ss)
const toLocalInputString = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper: Get Day of Year (1-366)
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Helper: Check leap year
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Helper: Get ISO Week Number
const getWeekNumber = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const TimestampConverter = () => {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [currentEpochMs, setCurrentEpochMs] = useState(Date.now());
  const [inputTimestamp, setInputTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [unitMode, setUnitMode] = useState('auto'); // 'auto', 'seconds', 'milliseconds', 'microseconds', 'nanoseconds'
  const [inputDate, setInputDate] = useState(() => toLocalInputString(new Date()));
  const [copiedKey, setCopiedKey] = useState(null);
  const { showToast } = useApp();

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentEpoch(Math.floor(now / 1000));
      setCurrentEpochMs(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Copy with toast & visual check
  const copyVal = (key, label, val) => {
    if (!val) return;
    navigator.clipboard.writeText(String(val));
    setCopiedKey(key);
    showToast(`Copied ${label}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Quick preset adjusters for Epoch input
  const adjustTimestamp = (offsetSeconds) => {
    if (offsetSeconds === 'now') {
      setInputTimestamp(Math.floor(Date.now() / 1000).toString());
      return;
    }
    if (offsetSeconds === 'startOfDay') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      setInputTimestamp(Math.floor(d.getTime() / 1000).toString());
      return;
    }
    if (offsetSeconds === 'endOfDay') {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      setInputTimestamp(Math.floor(d.getTime() / 1000).toString());
      return;
    }

    const current = Number(inputTimestamp.trim());
    if (!isNaN(current)) {
      // If user input is in milliseconds (> 1e11), offset by millis, else seconds
      const isMs = current > 1e11;
      const next = isMs ? current + offsetSeconds * 1000 : current + offsetSeconds;
      setInputTimestamp(next.toString());
    }
  };

  // Quick preset adjusters for Date input
  const setDatePreset = (preset) => {
    const d = new Date();
    if (preset === 'now') {
      // already now
    } else if (preset === 'startOfDay') {
      d.setHours(0, 0, 0, 0);
    } else if (preset === 'endOfDay') {
      d.setHours(23, 59, 59, 0);
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    const formatted = toLocalInputString(d);
    setInputDate(formatted);
  };

  // Parse Timestamp (Epoch -> Human)
  const parsedTimestamp = useMemo(() => {
    const raw = inputTimestamp.trim();
    if (!raw) return null;
    const num = Number(raw);
    if (isNaN(num)) return { error: 'Invalid numerical timestamp. Please enter a valid number.' };

    let date;
    let detectedUnit = 'seconds';

    if (unitMode === 'seconds') {
      date = new Date(num * 1000);
      detectedUnit = 'seconds';
    } else if (unitMode === 'milliseconds') {
      date = new Date(num);
      detectedUnit = 'milliseconds';
    } else if (unitMode === 'microseconds') {
      date = new Date(Math.floor(num / 1000));
      detectedUnit = 'microseconds';
    } else if (unitMode === 'nanoseconds') {
      date = new Date(Math.floor(num / 1000000));
      detectedUnit = 'nanoseconds';
    } else {
      // Auto detection heuristics
      if (Math.abs(num) > 1e16) {
        // Nanoseconds
        date = new Date(Math.floor(num / 1000000));
        detectedUnit = 'nanoseconds (auto)';
      } else if (Math.abs(num) > 1e13) {
        // Microseconds
        date = new Date(Math.floor(num / 1000));
        detectedUnit = 'microseconds (auto)';
      } else if (Math.abs(num) > 1e11) {
        // Milliseconds
        date = new Date(num);
        detectedUnit = 'milliseconds (auto)';
      } else {
        // Seconds
        date = new Date(num * 1000);
        detectedUnit = 'seconds (auto)';
      }
    }

    if (isNaN(date.getTime())) {
      return { error: 'Value out of representable timestamp date range.' };
    }

    const getRelativeTime = (d) => {
      const diffSecs = Math.floor((d.getTime() - Date.now()) / 1000);
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      if (Math.abs(diffSecs) < 5) return 'Just now';
      if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
      if (Math.abs(diffSecs) < 3600) return rtf.format(Math.floor(diffSecs / 60), 'minute');
      if (Math.abs(diffSecs) < 86400) return rtf.format(Math.floor(diffSecs / 3600), 'hour');
      if (Math.abs(diffSecs) < 2592000) return rtf.format(Math.floor(diffSecs / 86400), 'day');
      if (Math.abs(diffSecs) < 31536000) return rtf.format(Math.floor(diffSecs / 2592000), 'month');
      return rtf.format(Math.floor(diffSecs / 31536000), 'year');
    };

    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const offsetMin = -date.getTimezoneOffset();
    const offsetSign = offsetMin >= 0 ? '+' : '-';
    const offsetHours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
    const offsetMins = String(Math.abs(offsetMin) % 60).padStart(2, '0');
    const gmtOffset = `GMT${offsetSign}${offsetHours}:${offsetMins}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = days[date.getDay()];

    return {
      date,
      detectedUnit,
      utc: date.toUTCString(),
      iso: date.toISOString(),
      localFull: `${weekday}, ${date.toLocaleString()}`,
      localDateOnly: date.toLocaleDateString(),
      localTimeOnly: date.toLocaleTimeString(),
      timezone: `${gmtOffset} (${tzName})`,
      relative: getRelativeTime(date),
      epochSeconds: Math.floor(date.getTime() / 1000),
      epochMillis: date.getTime(),
      dayOfYear: getDayOfYear(date),
      weekNumber: getWeekNumber(date),
      isLeapYear: isLeapYear(date.getFullYear()) ? 'Yes' : 'No',
      rfc2822: date.toUTCString()
    };
  }, [inputTimestamp, unitMode]);

  // Parse Date input to Epoch values
  const dateToEpochResults = useMemo(() => {
    if (!inputDate) return null;
    const d = new Date(inputDate);
    if (isNaN(d.getTime())) return null;

    const epochSec = Math.floor(d.getTime() / 1000);
    const epochMs = d.getTime();

    return {
      epochSec,
      epochMs,
      utcString: d.toUTCString(),
      isoString: d.toISOString(),
      hex: `0x${epochSec.toString(16).toUpperCase()}`
    };
  }, [inputDate]);

  return (
    <ToolWorkspace
      toolId="timestamp-converter"
      singlePanel={true}
    >
      <div className="ts-container">
        {/* Live Clock Ticker Header */}
        <div className="ts-hero-ticker">
          <div className="ts-ticker-left">
            <div className="ts-ticker-live-dot" />
            <div className="ts-ticker-meta">
              <span className="ts-ticker-title">Current Unix Epoch Time</span>
              <span className="ts-ticker-subtitle">Local Browser System Clock</span>
            </div>
          </div>

          <div className="ts-ticker-right">
            <div className="ts-ticker-epoch-box">
              <span className="ts-ticker-val">{currentEpoch}</span>
              <span className="ts-ticker-unit">sec</span>
            </div>
            <div className="ts-ticker-epoch-box ts-ticker-ms-box">
              <span className="ts-ticker-val-ms">{currentEpochMs}</span>
              <span className="ts-ticker-unit">ms</span>
            </div>

            <div className="ts-ticker-actions">
              <button
                className="dw-btn dw-btn-primary dw-btn-sm"
                onClick={() => {
                  setInputTimestamp(currentEpoch.toString());
                  showToast('Set input to current epoch', 'info');
                }}
                title="Paste current time into converter"
              >
                <Sparkles size={12} />
                <span>Use Current</span>
              </button>
              <button
                className="dw-btn dw-btn-secondary dw-btn-sm"
                onClick={() => copyVal('currentSec', 'Epoch Seconds', currentEpoch)}
                title="Copy current epoch seconds"
              >
                {copiedKey === 'currentSec' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Responsive Grid */}
        <div className="ts-grid">
          {/* Card 1: Unix Timestamp -> Human Date */}
          <div className="ts-card">
            <div className="ts-card-header">
              <div className="ts-card-header-left">
                <Clock size={15} className="ts-card-icon" />
                <span>Unix Epoch to Human Date</span>
              </div>
              {parsedTimestamp && !parsedTimestamp.error && (
                <span className="ts-unit-badge">{parsedTimestamp.detectedUnit}</span>
              )}
            </div>

            <div className="ts-card-body">
              {/* Input Group */}
              <div className="ts-input-section">
                <div className="ts-input-header-row">
                  <label className="ts-label">Enter Unix Timestamp</label>
                  <div className="ts-unit-select-wrap">
                    <span className="ts-unit-select-label">Unit:</span>
                    <select
                      className="ts-unit-select"
                      value={unitMode}
                      onChange={(e) => setUnitMode(e.target.value)}
                    >
                      <option value="auto">Auto-Detect</option>
                      <option value="seconds">Seconds (s)</option>
                      <option value="milliseconds">Milliseconds (ms)</option>
                      <option value="microseconds">Microseconds (μs)</option>
                      <option value="nanoseconds">Nanoseconds (ns)</option>
                    </select>
                  </div>
                </div>

                <div className="ts-input-wrap">
                  <input
                    type="text"
                    className="dw-input text-mono ts-big-input"
                    value={inputTimestamp}
                    onChange={(e) => setInputTimestamp(e.target.value)}
                    placeholder="e.g. 1772540000 or 1772540000000"
                  />
                  {inputTimestamp && (
                    <button
                      className="ts-input-clear"
                      onClick={() => setInputTimestamp('')}
                      title="Clear input"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="ts-presets-strip">
                  <span className="ts-presets-title">Quick:</span>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp('now')}>Now</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp('startOfDay')}>Today 00:00</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp('endOfDay')}>Today 23:59</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp(-3600)}>-1 hr</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp(3600)}>+1 hr</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp(-86400)}>-1 day</button>
                  <button className="ts-preset-chip" onClick={() => adjustTimestamp(86400)}>+1 day</button>
                </div>
              </div>

              {/* Error Message */}
              {parsedTimestamp && parsedTimestamp.error && (
                <div className="ts-error-box">
                  <HelpCircle size={14} />
                  <span>{parsedTimestamp.error}</span>
                </div>
              )}

              {/* Formatted Results */}
              {parsedTimestamp && !parsedTimestamp.error && (
                <div className="ts-results-table">
                  {/* Local Time */}
                  <div className="ts-row highlight">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Your Local Time</span>
                      <span className="ts-row-val text-mono">{parsedTimestamp.localFull}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('local', 'Local Time', parsedTimestamp.localFull)}
                      title="Copy Local Time"
                    >
                      {copiedKey === 'local' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* UTC / GMT */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">UTC / GMT Time</span>
                      <span className="ts-row-val text-mono">{parsedTimestamp.utc}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('utc', 'UTC Time', parsedTimestamp.utc)}
                      title="Copy UTC Time"
                    >
                      {copiedKey === 'utc' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* ISO-8601 */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">ISO-8601</span>
                      <span className="ts-row-val text-mono">{parsedTimestamp.iso}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('iso', 'ISO-8601', parsedTimestamp.iso)}
                      title="Copy ISO 8601"
                    >
                      {copiedKey === 'iso' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Relative Time */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Relative</span>
                      <span className="ts-row-val ts-relative-val">{parsedTimestamp.relative}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('rel', 'Relative Time', parsedTimestamp.relative)}
                      title="Copy Relative Time"
                    >
                      {copiedKey === 'rel' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Timezone Info */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Timezone</span>
                      <span className="ts-row-val text-mono">{parsedTimestamp.timezone}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('tz', 'Timezone', parsedTimestamp.timezone)}
                      title="Copy Timezone"
                    >
                      {copiedKey === 'tz' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Epoch Seconds & Millis */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Seconds & Millis</span>
                      <span className="ts-row-val text-mono">
                        {parsedTimestamp.epochSeconds} s • {parsedTimestamp.epochMillis} ms
                      </span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('secMs', 'Epoch Milliseconds', parsedTimestamp.epochMillis)}
                      title="Copy Epoch Milliseconds"
                    >
                      {copiedKey === 'secMs' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Day Info Strip */}
                  <div className="ts-meta-chips-strip">
                    <span className="ts-meta-chip">Day of Year: <strong>{parsedTimestamp.dayOfYear}</strong></span>
                    <span className="ts-meta-chip">Week: <strong>#{parsedTimestamp.weekNumber}</strong></span>
                    <span className="ts-meta-chip">Leap Year: <strong>{parsedTimestamp.isLeapYear}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Human Date -> Unix Timestamp */}
          <div className="ts-card">
            <div className="ts-card-header">
              <div className="ts-card-header-left">
                <Calendar size={15} className="ts-card-icon" />
                <span>Human Date to Unix Epoch</span>
              </div>
            </div>

            <div className="ts-card-body">
              {/* Date Input */}
              <div className="ts-input-section">
                <label className="ts-label">Pick Local Date & Time</label>
                <div className="ts-input-wrap">
                  <input
                    type="datetime-local"
                    step="1"
                    className="dw-input text-mono ts-big-input"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                  />
                </div>

                {/* Date Presets */}
                <div className="ts-presets-strip">
                  <span className="ts-presets-title">Quick:</span>
                  <button className="ts-preset-chip" onClick={() => setDatePreset('now')}>Now</button>
                  <button className="ts-preset-chip" onClick={() => setDatePreset('startOfDay')}>Start of Today</button>
                  <button className="ts-preset-chip" onClick={() => setDatePreset('endOfDay')}>End of Today</button>
                  <button className="ts-preset-chip" onClick={() => setDatePreset('tomorrow')}>Tomorrow</button>
                  <button className="ts-preset-chip" onClick={() => setDatePreset('nextWeek')}>+1 Week</button>
                </div>
              </div>

              {/* Conversion Outputs */}
              {dateToEpochResults && (
                <div className="ts-results-table">
                  {/* Epoch Seconds */}
                  <div className="ts-row highlight">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Epoch Seconds</span>
                      <span className="ts-row-val text-mono ts-bold-val">{dateToEpochResults.epochSec}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('dateSec', 'Seconds', dateToEpochResults.epochSec)}
                      title="Copy Epoch Seconds"
                    >
                      {copiedKey === 'dateSec' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Epoch Milliseconds */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Epoch Milliseconds</span>
                      <span className="ts-row-val text-mono">{dateToEpochResults.epochMs}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('dateMs', 'Milliseconds', dateToEpochResults.epochMs)}
                      title="Copy Epoch Milliseconds"
                    >
                      {copiedKey === 'dateMs' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* UTC Equivalent */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">UTC / GMT Date</span>
                      <span className="ts-row-val text-mono">{dateToEpochResults.utcString}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('dateUtc', 'UTC Date', dateToEpochResults.utcString)}
                      title="Copy UTC Date"
                    >
                      {copiedKey === 'dateUtc' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* ISO 8601 */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">ISO-8601</span>
                      <span className="ts-row-val text-mono">{dateToEpochResults.isoString}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('dateIso', 'ISO Date', dateToEpochResults.isoString)}
                      title="Copy ISO String"
                    >
                      {copiedKey === 'dateIso' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Hexadecimal representation */}
                  <div className="ts-row">
                    <div className="ts-row-info">
                      <span className="ts-row-label">Hexadecimal</span>
                      <span className="ts-row-val text-mono">{dateToEpochResults.hex}</span>
                    </div>
                    <button
                      className="ts-copy-btn"
                      onClick={() => copyVal('dateHex', 'Hex Timestamp', dateToEpochResults.hex)}
                      title="Copy Hex Timestamp"
                    >
                      {copiedKey === 'dateHex' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default TimestampConverter;
