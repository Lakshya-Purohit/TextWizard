import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  textToGsm7BitHex, gsm7BitHexToText, GSM_BASIC, GSM_EXTENSION
} from '../../engine/transformEngine';
import {
  AlertTriangle, CheckCircle, Smartphone, ArrowLeftRight,
  Copy, Check
} from 'lucide-react';
import './GsmEncoder.css';

const DEFAULT_SMS = 'Hello! Welcome to DevWizard SMS gateway. Your OTP code is 948210. Valid for 10 minutes. Support: info@devwizard.io';

const GsmEncoder = () => {
  const { showToast } = useApp();
  const [mode, setMode] = useState('encode'); // 'encode' (text -> hex) | 'decode' (hex -> text)
  const [textInput, setTextInput] = useState(DEFAULT_SMS);
  const [hexInput, setHexInput] = useState(() => textToGsm7BitHex(DEFAULT_SMS));
  const [copied, setCopied] = useState(false);

  // Analysis of the text input (GSM 7-bit vs UCS-2 / Unicode)
  const analysis = useMemo(() => {
    const text = mode === 'encode' ? textInput : (gsm7BitHexToText(hexInput) || '');
    let septetCount = 0;
    const invalidChars = [];
    const extendedChars = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (GSM_EXTENSION[char] !== undefined) {
        extendedChars.push(char);
        septetCount += 2; // Extension characters count as 2 septets (0x1B escape byte)
      } else if (GSM_BASIC.indexOf(char) !== -1) {
        septetCount += 1;
      } else {
        invalidChars.push({ char, index: i, code: char.charCodeAt(0) });
      }
    }

    const isPureGsm = invalidChars.length === 0;
    const encoding = isPureGsm ? 'GSM 7-bit' : 'UCS-2 (Unicode)';

    let segments = 1;
    let remainingInSegment = 0;
    let maxPerSegment = 160;

    if (isPureGsm) {
      if (septetCount <= 160) {
        segments = 1;
        remainingInSegment = 160 - septetCount;
        maxPerSegment = 160;
      } else {
        // Concatenated SMS: 153 septets per segment (7 septets reserved for UDH header)
        segments = Math.ceil(septetCount / 153);
        maxPerSegment = 153;
        remainingInSegment = (segments * 153) - septetCount;
      }
    } else {
      // UCS-2: 70 characters for single segment, 67 for concatenated
      const charCount = text.length;
      if (charCount <= 70) {
        segments = 1;
        remainingInSegment = 70 - charCount;
        maxPerSegment = 70;
      } else {
        segments = Math.ceil(charCount / 67);
        maxPerSegment = 67;
        remainingInSegment = (segments * 67) - charCount;
      }
    }

    return {
      textLength: text.length,
      septetCount,
      isPureGsm,
      encoding,
      segments,
      remainingInSegment,
      maxPerSegment,
      invalidChars: [...new Set(invalidChars.map(c => c.char))],
      extendedChars: [...new Set(extendedChars)],
    };
  }, [mode, textInput, hexInput]);

  // Handle Text to Hex
  const handleTextChange = (val) => {
    setTextInput(val);
    if (mode === 'encode') {
      try {
        setHexInput(textToGsm7BitHex(val));
      } catch {}
    }
  };

  // Handle Hex to Text
  const handleHexChange = (val) => {
    setHexInput(val);
    if (mode === 'decode') {
      try {
        setTextInput(gsm7BitHexToText(val));
      } catch {}
    }
  };

  const handleSwapMode = () => {
    if (mode === 'encode') {
      setMode('decode');
    } else {
      setMode('encode');
    }
  };

  const copyHex = () => {
    navigator.clipboard.writeText(hexInput);
    setCopied(true);
    showToast('Copied GSM Hex PDU', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
        <button
          className={`dw-tab ${mode === 'encode' ? 'active' : ''}`}
          onClick={() => setMode('encode')}
        >
          Text → GSM 7-bit Hex
        </button>
        <button
          className={`dw-tab ${mode === 'decode' ? 'active' : ''}`}
          onClick={() => setMode('decode')}
        >
          GSM 7-bit Hex → Text
        </button>
      </div>

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={handleSwapMode}
        title="Swap encoding direction"
      >
        <ArrowLeftRight size={12} />
        <span>Swap</span>
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className="dw-btn dw-btn-primary dw-btn-sm"
          onClick={copyHex}
          title="Copy GSM Hex"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>Copy Hex</span>
        </button>
      </div>
    </div>
  );

  return (
    <ToolWorkspace
      toolId="gsm-encoder"
      singlePanel={true}
      toolbar={toolbar}
      statusLeft={
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {analysis.isPureGsm ? (
            <span style={{ color: 'var(--accent-success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} /> Standard GSM 03.38 (160 chars/SMS)
            </span>
          ) : (
            <span style={{ color: 'var(--accent-warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> Contains non-GSM chars (Forces UCS-2 70 chars/SMS)
            </span>
          )}
        </span>
      }
      statusRight={
        <span>
          Part {analysis.segments} • {analysis.textLength} chars ({analysis.septetCount} septets)
        </span>
      }
    >
      <div className="gsm-container">
        {/* SMS Telecom Stats Strip */}
        <div className="gsm-stats-strip">
          <div className="gsm-stat-card">
            <span className="gsm-stat-label">Encoding</span>
            <div className="gsm-stat-value">
              <span className={`gsm-stat-badge ${analysis.isPureGsm ? 'gsm-badge-valid' : 'gsm-badge-warning'}`}>
                {analysis.encoding}
              </span>
            </div>
          </div>

          <div className="gsm-stat-card">
            <span className="gsm-stat-label">SMS Segments</span>
            <span className="gsm-stat-value">
              {analysis.segments} {analysis.segments === 1 ? 'part' : 'parts'}
            </span>
          </div>

          <div className="gsm-stat-card">
            <span className="gsm-stat-label">Remaining in Segment</span>
            <span className="gsm-stat-value">
              {analysis.remainingInSegment} / {analysis.maxPerSegment}
            </span>
          </div>

          <div className="gsm-stat-card">
            <span className="gsm-stat-label">Total Characters</span>
            <span className="gsm-stat-value">{analysis.textLength}</span>
          </div>

          <div className="gsm-stat-card">
            <span className="gsm-stat-label">GSM 7-bit Septets</span>
            <span className="gsm-stat-value">{analysis.septetCount}</span>
          </div>

          {analysis.extendedChars.length > 0 && (
            <div className="gsm-stat-card">
              <span className="gsm-stat-label">2-Septet Ext Chars</span>
              <span className="gsm-stat-value" style={{ color: 'var(--accent-info)' }}>
                {analysis.extendedChars.join(' ')}
              </span>
            </div>
          )}
        </div>

        {/* Non-GSM Character Warning Banner if detected */}
        {!analysis.isPureGsm && (
          <div className="gsm-warning-banner">
            <AlertTriangle size={14} className="gsm-warning-icon" />
            <span>
              <strong>Warning:</strong> Non-GSM 03.38 characters detected: [ {analysis.invalidChars.join(' ')} ].
              This message will be billed at Unicode / UCS-2 rates (70 characters per segment instead of 160).
            </span>
          </div>
        )}

        {/* Dual Panels: Plain Text & Packed GSM Hex */}
        <div className="gsm-panels-row">
          <div className="gsm-panel gsm-panel-left">
            <div className="gsm-panel-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={13} />
                SMS Message Text
              </span>
              <span>{textInput.length} characters</span>
            </div>
            <textarea
              className="gsm-textarea"
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type or paste SMS text here..."
              spellCheck={false}
            />
          </div>

          <div className="gsm-panel gsm-panel-right">
            <div className="gsm-panel-header">
              <span>Packed GSM 7-bit Hex (PDU Payload)</span>
              <span>{hexInput.length / 2} octets ({hexInput.length} hex chars)</span>
            </div>
            <textarea
              className="gsm-textarea"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="GSM 7-bit packed hex octets..."
              spellCheck={false}
              style={{ letterSpacing: '0.08em', color: 'var(--text-code)' }}
            />
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default GsmEncoder;
