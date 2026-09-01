import React, { useState, useEffect, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import { Clock, Calendar, Copy } from 'lucide-react';
import './TimestampConverter.css';

const TimestampConverter = () => {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 19));
  const { showToast } = useApp();

  // Ticker for current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format parsed timestamp
  const parsedTimestamp = useMemo(() => {
    if (!inputTimestamp.trim()) return null;
    const num = Number(inputTimestamp.trim());
    if (isNaN(num)) return { error: 'Invalid numeric timestamp' };

    // Detect if in seconds or milliseconds
    const date = num > 1e11 ? new Date(num) : new Date(num * 1000);
    if (isNaN(date.getTime())) return { error: 'Invalid Date representation' };

    const getRelativeTime = (d) => {
      const diffSecs = Math.floor((d.getTime() - Date.now()) / 1000);
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
      if (Math.abs(diffSecs) < 3600) return rtf.format(Math.floor(diffSecs / 60), 'minute');
      if (Math.abs(diffSecs) < 86400) return rtf.format(Math.floor(diffSecs / 3600), 'hour');
      return rtf.format(Math.floor(diffSecs / 86400), 'day');
    };

    return {
      date,
      utc: date.toUTCString(),
      iso: date.toISOString(),
      local: date.toLocaleString(),
      relative: getRelativeTime(date),
      epochSeconds: Math.floor(date.getTime() / 1000),
      epochMillis: date.getTime()
    };
  }, [inputTimestamp]);

  // Convert Date String to Timestamp
  const handleDateStringToEpoch = (dateStr) => {
    setInputDate(dateStr);
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      setInputTimestamp(Math.floor(d.getTime() / 1000).toString());
    }
  };

  const copyVal = (label, val) => {
    navigator.clipboard.writeText(val);
    showToast(`Copied ${label}`, 'success');
  };

  return (
    <ToolWorkspace
      toolId="timestamp-converter"
      singlePanel={true}
    >
      <div className="ts-container">
        {/* Live Clock Ticker */}
        <div className="ts-hero-ticker">
          <div className="ts-ticker-label">
            <Clock size={16} /> Current Unix Epoch
          </div>
          <div className="ts-ticker-val">
            <span>{currentEpoch}</span>
            <button
              className="dw-btn dw-btn-ghost dw-btn-sm"
              onClick={() => {
                setInputTimestamp(currentEpoch.toString());
                showToast('Set to current timestamp', 'info');
              }}
            >
              Use Current
            </button>
          </div>
        </div>

        <div className="ts-grid">
          {/* Timestamp to Date */}
          <div className="ts-card">
            <div className="ts-card-header">
              <Clock size={14} />
              <span>Convert Unix Epoch to Human Date</span>
            </div>
            <div className="ts-card-body">
              <div className="ts-input-group">
                <label>Unix Timestamp (Seconds or Milliseconds)</label>
                <input
                  type="text"
                  className="dw-input text-mono"
                  value={inputTimestamp}
                  onChange={(e) => setInputTimestamp(e.target.value)}
                  placeholder="e.g. 1700000000"
                />
              </div>

              {parsedTimestamp && !parsedTimestamp.error && (
                <div className="ts-results-list">
                  <div className="ts-result-row">
                    <span className="ts-res-label">UTC Time</span>
                    <span className="ts-res-val text-mono">{parsedTimestamp.utc}</span>
                    <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={() => copyVal('UTC', parsedTimestamp.utc)}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="ts-result-row">
                    <span className="ts-res-label">Local Time</span>
                    <span className="ts-res-val text-mono">{parsedTimestamp.local}</span>
                    <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={() => copyVal('Local', parsedTimestamp.local)}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="ts-result-row">
                    <span className="ts-res-label">ISO-8601</span>
                    <span className="ts-res-val text-mono">{parsedTimestamp.iso}</span>
                    <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={() => copyVal('ISO', parsedTimestamp.iso)}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="ts-result-row">
                    <span className="ts-res-label">Relative Time</span>
                    <span className="ts-res-val" style={{ color: 'var(--accent-primary)' }}>{parsedTimestamp.relative}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date to Timestamp */}
          <div className="ts-card">
            <div className="ts-card-header">
              <Calendar size={14} />
              <span>Convert Date / Time to Epoch</span>
            </div>
            <div className="ts-card-body">
              <div className="ts-input-group">
                <label>Date & Time Selector</label>
                <input
                  type="datetime-local"
                  className="dw-input text-mono"
                  value={inputDate}
                  onChange={(e) => handleDateStringToEpoch(e.target.value)}
                />
              </div>

              <div className="ts-results-list">
                <div className="ts-result-row">
                  <span className="ts-res-label">Epoch Seconds</span>
                  <span className="ts-res-val text-mono">{Math.floor(new Date(inputDate).getTime() / 1000) || '0'}</span>
                  <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={() => copyVal('Seconds', (Math.floor(new Date(inputDate).getTime() / 1000)).toString())}>
                    <Copy size={12} />
                  </button>
                </div>
                <div className="ts-result-row">
                  <span className="ts-res-label">Epoch Millis</span>
                  <span className="ts-res-val text-mono">{new Date(inputDate).getTime() || '0'}</span>
                  <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={() => copyVal('Milliseconds', (new Date(inputDate).getTime()).toString())}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default TimestampConverter;
