import React, { useState, useEffect, useMemo, useRef } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import { transform } from '../../engine/transformEngine';
import {
  FileText, Image as ImageIcon, Music, Video as VideoIcon,
  File, Upload, Download, Copy, Check, Eye, ExternalLink,
  Trash2, Sparkles, FileCode, AlertCircle, ArrowLeftRight,
  Binary, Type, RefreshCw
} from 'lucide-react';
import './Base64FileConverter.css';
import './Base64Studio.css';

// Preset sample files in Base64
const SAMPLE_PRESETS = {
  svg: {
    name: 'Sample SVG Image',
    mime: 'image/svg+xml',
    ext: 'svg',
    base64: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzNiODJmNiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iMjQiIGZpbGw9InVybCgjZykiLz4KICA8cGF0aCBkPSJNMzAgNjAgTDUwIDgwIEw5MCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4='
  },
  png: {
    name: 'Sample 1x1 Blue PNG',
    mime: 'image/png',
    ext: 'png',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeAF5JzQ0+QAAAABJRU5ErkJggg=='
  },
  pdf: {
    name: 'Sample Minimal PDF',
    mime: 'application/pdf',
    ext: 'pdf',
    base64: 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCAzMDAgMTIwXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA1MAo+PgpzdHJlYW0KQlQKL0YxIDE4IFRmCjcwIDcwIFRkCihIZWxsbyBEZXZXaXphcmQhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIwNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMwNQolJUVPRg=='
  }
};

const MIME_OPTIONS = [
  { label: 'Auto Detect', value: 'auto' },
  { label: 'PDF Document (.pdf)', value: 'application/pdf', ext: 'pdf' },
  { label: 'Plain Text (.txt)', value: 'text/plain', ext: 'txt' },
  { label: 'JSON (.json)', value: 'application/json', ext: 'json' },
  { label: 'XML (.xml)', value: 'application/xml', ext: 'xml' },
  { label: 'HTML (.html)', value: 'text/html', ext: 'html' },
  { label: 'ZIP Archive (.zip)', value: 'application/zip', ext: 'zip' },
  { label: 'PNG Image (.png)', value: 'image/png', ext: 'png' },
  { label: 'JPEG Image (.jpg)', value: 'image/jpeg', ext: 'jpg' },
  { label: 'SVG Image (.svg)', value: 'image/svg+xml', ext: 'svg' },
  { label: 'WebP Image (.webp)', value: 'image/webp', ext: 'webp' },
  { label: 'GIF Image (.gif)', value: 'image/gif', ext: 'gif' },
  { label: 'ICO Icon (.ico)', value: 'image/x-icon', ext: 'ico' },
  { label: 'MP4 Video (.mp4)', value: 'video/mp4', ext: 'mp4' },
  { label: 'WebM Video (.webm)', value: 'video/webm', ext: 'webm' },
  { label: 'OGG Video (.ogv)', value: 'video/ogg', ext: 'ogv' },
  { label: 'MP3 Audio (.mp3)', value: 'audio/mpeg', ext: 'mp3' },
  { label: 'WAV Audio (.wav)', value: 'audio/wav', ext: 'wav' },
  { label: 'OGG Audio (.ogg)', value: 'audio/ogg', ext: 'ogg' },
  { label: 'AAC Audio (.aac)', value: 'audio/aac', ext: 'aac' },
];

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const detectMimeType = (base64String) => {
  const dataUriMatch = base64String.match(/^data:([a-zA-Z0-9.+/-]+);base64,/i);
  if (dataUriMatch) {
    return { mime: dataUriMatch[1].toLowerCase(), isDataUri: true };
  }
  const clean = base64String.replace(/[\s\r\n]+/g, '').slice(0, 32);
  if (clean.startsWith('JVBERi0')) return { mime: 'application/pdf', ext: 'pdf' };
  if (clean.startsWith('iVBORw0KGgo')) return { mime: 'image/png', ext: 'png' };
  if (clean.startsWith('/9j/')) return { mime: 'image/jpeg', ext: 'jpg' };
  if (clean.startsWith('R0lGOD')) return { mime: 'image/gif', ext: 'gif' };
  if (clean.startsWith('UklGR')) return { mime: 'image/webp', ext: 'webp' };
  if (clean.startsWith('PHN2Zy') || clean.startsWith('PD94bWw')) return { mime: 'image/svg+xml', ext: 'svg' };
  if (clean.startsWith('AAAAIGZ0eX') || clean.startsWith('AAAAHGZ0eX') || clean.startsWith('AAAAKGZ0eX')) return { mime: 'video/mp4', ext: 'mp4' };
  if (clean.startsWith('GkXfo5')) return { mime: 'video/webm', ext: 'webm' };
  if (clean.startsWith('SUQz') || clean.startsWith('//tQ') || clean.startsWith('//uQ')) return { mime: 'audio/mpeg', ext: 'mp3' };
  if (clean.startsWith('T2dnUw')) return { mime: 'audio/ogg', ext: 'ogg' };
  if (clean.startsWith('UEsDB')) return { mime: 'application/zip', ext: 'zip' };
  return { mime: 'application/octet-stream', ext: 'bin' };
};

const Base64Studio = () => {
  const { showToast } = useApp();
  // Active master mode: 'text' | 'base64-to-file' | 'file-to-base64'
  const [activeTab, setActiveTab] = useState('text');

  // ---- Text Mode State ----
  const [textInput, setTextInput] = useState('Hello DevWizard Studio!');
  const [textMode, setTextMode] = useState('text-base64'); // text-base64 | base64-text | text-hex | hex-text | text-binary | binary-text
  const [urlSafe, setUrlSafe] = useState(false);

  const textResult = useMemo(() => {
    if (!textInput.trim()) return { output: '', valid: null, error: null };
    try {
      let output = transform(textInput, textMode);
      if (urlSafe && textMode === 'text-base64') {
        output = output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [textInput, textMode, urlSafe]);

  const handleSwapTextMode = () => {
    if (textMode === 'text-base64') {
      setTextMode('base64-text');
      if (textResult.output) setTextInput(textResult.output);
    } else if (textMode === 'base64-text') {
      setTextMode('text-base64');
      if (textResult.output) setTextInput(textResult.output);
    } else if (textMode === 'text-hex') {
      setTextMode('hex-text');
      if (textResult.output) setTextInput(textResult.output);
    } else if (textMode === 'hex-text') {
      setTextMode('text-hex');
      if (textResult.output) setTextInput(textResult.output);
    } else if (textMode === 'text-binary') {
      setTextMode('binary-text');
      if (textResult.output) setTextInput(textResult.output);
    } else {
      setTextMode('text-binary');
      if (textResult.output) setTextInput(textResult.output);
    }
  };

  // ---- Base64 to File State ----
  const [base64Input, setBase64Input] = useState(SAMPLE_PRESETS.svg.base64);
  const [selectedMime, setSelectedMime] = useState('auto');
  const [customFilename, setCustomFilename] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // ---- File to Base64 State ----
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generatedBase64, setGeneratedBase64] = useState('');
  const [generatedDataUri, setGeneratedDataUri] = useState('');
  const [fileMime, setFileMime] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const cleanBase64 = useMemo(() => {
    let s = base64Input.trim();
    if (!s) return '';
    if (s.startsWith('data:')) {
      const idx = s.indexOf('base64,');
      if (idx !== -1) s = s.substring(idx + 7);
    }
    return s.replace(/[\s\r\n]+/g, '');
  }, [base64Input]);

  const conversionData = useMemo(() => {
    if (!cleanBase64) return null;
    let mime = selectedMime;
    let ext = 'bin';

    if (mime === 'auto') {
      const detected = detectMimeType(base64Input.trim());
      mime = detected.mime;
      ext = detected.ext || 'bin';
    } else {
      const opt = MIME_OPTIONS.find(m => m.value === selectedMime);
      ext = opt?.ext || 'bin';
    }

    try {
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const dataUri = `data:${mime};base64,${cleanBase64}`;

      return {
        valid: true,
        mime,
        ext,
        sizeBytes: len,
        formattedSize: formatBytes(len),
        blobUrl,
        dataUri,
        isImage: mime.startsWith('image/'),
        isPdf: mime === 'application/pdf',
        isVideo: mime.startsWith('video/'),
        isAudio: mime.startsWith('audio/'),
        isText: mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml',
      };
    } catch (e) {
      return {
        valid: false,
        error: 'Invalid Base64 string. Please verify the encoding format.'
      };
    }
  }, [cleanBase64, selectedMime, base64Input]);

  useEffect(() => {
    return () => {
      if (conversionData?.blobUrl) {
        URL.revokeObjectURL(conversionData.blobUrl);
      }
    };
  }, [conversionData?.blobUrl]);

  const copyText = (key, label, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    if (!conversionData || !conversionData.valid) return;
    const name = customFilename.trim() || `converted-file.${conversionData.ext}`;
    const a = document.createElement('a');
    a.href = conversionData.blobUrl;
    a.download = name.includes('.') ? name : `${name}.${conversionData.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${name}`, 'success');
  };

  const loadPreset = (key) => {
    const p = SAMPLE_PRESETS[key];
    if (!p) return;
    setBase64Input(p.base64);
    setSelectedMime(p.mime);
    setCustomFilename(`sample.${p.ext}`);
    showToast(`Loaded ${p.name}`, 'info');
  };

  const processUploadedFile = (file) => {
    if (!file) return;
    setUploadedFile(file);
    const mime = file.type || 'application/octet-stream';
    setFileMime(mime);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result?.toString() || '';
      const rawBase64 = dataUri.split(',')[1] || '';
      setGeneratedDataUri(dataUri);
      setGeneratedBase64(rawBase64);
      showToast(`Encoded ${file.name}`, 'success');
    };
    reader.onerror = () => {
      showToast('Error reading file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  return (
    <ToolWorkspace
      toolId="base64"
      singlePanel={true}
      statusLeft={
        activeTab === 'text' ? (
          textResult.valid === true ? (
            <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> Successfully Converted
            </span>
          ) : (
            <span style={{ color: 'var(--accent-danger)' }}>{textResult.error}</span>
          )
        ) : activeTab === 'base64-to-file' ? (
          conversionData?.valid ? (
            <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> Decoded: {conversionData.mime} ({conversionData.formattedSize})
            </span>
          ) : (
            <span>Base64 to File / Media View</span>
          )
        ) : (
          <span>File to Base64 Encoding</span>
        )
      }
    >
      <div className="b64s-container">
        {/* Unified Mode Switcher Header */}
        <div className="b64s-mode-header">
          <div className="b64s-mode-tabs">
            <button
              className={`b64s-mode-tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <Type size={14} />
              <span>Text ⇄ Base64</span>
            </button>
            <button
              className={`b64s-mode-tab ${activeTab === 'base64-to-file' ? 'active' : ''}`}
              onClick={() => setActiveTab('base64-to-file')}
            >
              <Download size={14} />
              <span>Base64 to File / Media (PDF, Images)</span>
            </button>
            <button
              className={`b64s-mode-tab ${activeTab === 'file-to-base64' ? 'active' : ''}`}
              onClick={() => setActiveTab('file-to-base64')}
            >
              <Upload size={14} />
              <span>File to Base64</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: Text & Strings Base64 */}
        {/* ============================================================ */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="b64s-text-toolbar">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Operation:</span>
              <select
                className="b64s-select"
                value={textMode}
                onChange={(e) => setTextMode(e.target.value)}
              >
                <optgroup label="Base64">
                  <option value="text-base64">Text → Base64</option>
                  <option value="base64-text">Base64 → Text</option>
                </optgroup>
                <optgroup label="Hexadecimal & Binary">
                  <option value="text-hex">Text → Hex</option>
                  <option value="hex-text">Hex → Text</option>
                  <option value="text-binary">Text → Binary</option>
                  <option value="binary-text">Binary → Text</option>
                </optgroup>
              </select>

              <button
                className="dw-btn dw-btn-secondary dw-btn-sm"
                onClick={handleSwapTextMode}
                title="Swap input and output direction"
              >
                <ArrowLeftRight size={12} />
                <span>Swap</span>
              </button>

              {textMode === 'text-base64' && (
                <label className="b64s-checkbox-label">
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                  />
                  <span>URL-Safe Base64 (- and _)</span>
                </label>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                <button
                  className="dw-btn dw-btn-primary dw-btn-sm"
                  onClick={() => copyText('textOutput', 'Converted Text', textResult.output)}
                  title="Copy result"
                >
                  <Copy size={12} />
                  <span>Copy Result</span>
                </button>
              </div>
            </div>

            <div className="b64s-text-workspace">
              <div className="b64s-pane b64s-pane-left">
                <div className="b64s-pane-header">
                  <span>Input Data ({textMode.split('-')[0].toUpperCase()})</span>
                  <span>{textInput.length} chars</span>
                </div>
                <textarea
                  className="b64s-textarea"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type or paste input here..."
                  spellCheck={false}
                />
              </div>

              <div className="b64s-pane">
                <div className="b64s-pane-header">
                  <span>Output Result ({textMode.split('-')[1].toUpperCase()})</span>
                  <span>{textResult.output.length} chars</span>
                </div>
                <textarea
                  className="b64s-textarea"
                  value={textResult.output || textResult.error || ''}
                  readOnly
                  placeholder="Converted output will appear here..."
                  spellCheck={false}
                  style={{ color: 'var(--text-code)', background: 'var(--bg-panel)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: Base64 to File / Media */}
        {/* ============================================================ */}
        {activeTab === 'base64-to-file' && (
          <div className="b64f-view-grid">
            {/* Left Column: Input & Controls */}
            <div className="b64f-card b64f-input-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <FileCode size={16} className="text-primary" />
                  <span>Input Base64 String or Data URI</span>
                </div>
                {base64Input && (
                  <button
                    className="dw-btn dw-btn-ghost dw-btn-sm"
                    onClick={() => setBase64Input('')}
                    title="Clear input"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="b64f-card-body">
                <div className="b64f-controls-row">
                  <div className="b64f-select-group">
                    <label>MIME / File Type:</label>
                    <select
                      className="dw-input dw-select b64f-mime-select"
                      value={selectedMime}
                      onChange={(e) => setSelectedMime(e.target.value)}
                    >
                      {MIME_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="b64f-input-group">
                    <label>Save Filename:</label>
                    <input
                      type="text"
                      className="dw-input b64f-filename-input"
                      placeholder="e.g. document.pdf"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                    />
                  </div>
                </div>

                <div className="b64f-presets-strip">
                  <span className="b64f-presets-title">Load Sample:</span>
                  <button className="b64f-preset-btn" onClick={() => loadPreset('svg')}>SVG Image</button>
                  <button className="b64f-preset-btn" onClick={() => loadPreset('png')}>1x1 PNG</button>
                  <button className="b64f-preset-btn" onClick={() => loadPreset('pdf')}>Sample PDF</button>
                </div>

                <textarea
                  className="dw-input text-mono b64f-textarea"
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder="Paste raw Base64 or data:image/png;base64,... string here..."
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="b64f-card b64f-preview-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <Eye size={16} className="text-primary" />
                  <span>Live Media Preview & Download</span>
                </div>
                {conversionData?.valid && (
                  <button
                    className="dw-btn dw-btn-primary dw-btn-sm"
                    onClick={handleDownload}
                    title="Download reconstructed file"
                  >
                    <Download size={13} />
                    <span>Download {conversionData.ext.toUpperCase()}</span>
                  </button>
                )}
              </div>

              <div className="b64f-card-body b64f-preview-body">
                {conversionData && conversionData.valid ? (
                  <>
                    <div className="b64f-meta-bar">
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">MIME Type</span>
                        <span className="b64f-meta-val">{conversionData.mime}</span>
                      </div>
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">Decoded Size</span>
                        <span className="b64f-meta-val">{conversionData.formattedSize}</span>
                      </div>
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">Data URI</span>
                        <button
                          className="b64f-meta-copy-btn"
                          onClick={() => copyText('dataUri', 'Data URI', conversionData.dataUri)}
                        >
                          {copiedKey === 'dataUri' ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                          <span>Copy Data URI</span>
                        </button>
                      </div>
                    </div>

                    <div className="b64f-preview-viewport">
                      {conversionData.isImage && (
                        <div className="b64f-image-wrapper">
                          <img src={conversionData.blobUrl} alt="Base64 Preview" className="b64f-img-el" />
                        </div>
                      )}

                      {conversionData.isPdf && (
                        <div className="b64f-pdf-wrapper">
                          <iframe
                            src={conversionData.blobUrl}
                            title="PDF Preview"
                            className="b64f-pdf-frame"
                          />
                        </div>
                      )}

                      {conversionData.isVideo && (
                        <div className="b64f-video-wrapper">
                          <video src={conversionData.blobUrl} controls className="b64f-video-el" />
                        </div>
                      )}

                      {conversionData.isAudio && (
                        <div className="b64f-audio-wrapper">
                          <audio src={conversionData.blobUrl} controls className="b64f-audio-el" />
                        </div>
                      )}

                      {conversionData.isText && (
                        <div className="b64f-text-wrapper">
                          <iframe src={conversionData.blobUrl} title="Text Preview" className="b64f-text-frame" />
                        </div>
                      )}

                      {!conversionData.isImage && !conversionData.isPdf && !conversionData.isVideo && !conversionData.isAudio && !conversionData.isText && (
                        <div className="b64f-generic-file-view">
                          <File size={48} className="text-secondary" />
                          <p className="b64f-generic-title">Binary File Ready ({conversionData.formattedSize})</p>
                          <button className="dw-btn dw-btn-primary" onClick={handleDownload}>
                            <Download size={14} />
                            <span>Download {conversionData.ext.toUpperCase()} File</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : conversionData && !conversionData.valid ? (
                  <div className="b64f-empty-state error">
                    <AlertCircle size={36} className="text-danger" />
                    <p className="b64f-empty-title">{conversionData.error}</p>
                  </div>
                ) : (
                  <div className="b64f-empty-state">
                    <Sparkles size={36} className="text-tertiary" />
                    <p className="b64f-empty-title">Waiting for Base64 Data</p>
                    <p className="b64f-empty-desc">Paste a Base64 string or click a preset sample above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: File to Base64 Converter */}
        {/* ============================================================ */}
        {activeTab === 'file-to-base64' && (
          <div className="b64f-view-grid">
            <div className="b64f-card b64f-input-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <Upload size={16} className="text-primary" />
                  <span>Upload Any File (Image, PDF, Audio, Video, Zip)</span>
                </div>
              </div>

              <div className="b64f-card-body">
                <div
                  className={`b64f-dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  <Upload size={36} className="b64f-drop-icon" />
                  <p className="b64f-drop-title">Drag & drop your file here, or click to browse</p>
                  <p className="b64f-drop-desc">All client-side. Zero bytes leave your browser.</p>
                </div>

                {uploadedFile && (
                  <div className="b64f-uploaded-info">
                    <div className="b64f-uploaded-row">
                      <span className="b64f-uploaded-name">📄 {uploadedFile.name}</span>
                      <span className="b64f-uploaded-size">{formatBytes(uploadedFile.size)}</span>
                    </div>
                    <span className="b64f-uploaded-mime">MIME: {fileMime}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="b64f-card b64f-preview-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <FileCode size={16} className="text-primary" />
                  <span>Encoded Base64 Output</span>
                </div>
                {generatedBase64 && (
                  <div className="dw-btn-group">
                    <button
                      className="dw-btn dw-btn-primary dw-btn-sm"
                      onClick={() => copyText('b64Raw', 'Base64', generatedBase64)}
                    >
                      {copiedKey === 'b64Raw' ? <Check size={12} /> : <Copy size={12} />}
                      <span>Copy Base64</span>
                    </button>
                    <button
                      className="dw-btn dw-btn-secondary dw-btn-sm"
                      onClick={() => copyText('dataUriOut', 'Data URI', generatedDataUri)}
                    >
                      {copiedKey === 'dataUriOut' ? <Check size={12} /> : <Copy size={12} />}
                      <span>Copy Data URI</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="b64f-card-body">
                {generatedBase64 ? (
                  <textarea
                    className="dw-input text-mono b64f-textarea"
                    value={generatedBase64}
                    readOnly
                    spellCheck={false}
                  />
                ) : (
                  <div className="b64f-empty-state">
                    <Upload size={36} className="text-tertiary" />
                    <p className="b64f-empty-title">Upload a File to Encode</p>
                    <p className="b64f-empty-desc">Your Base64 payload and Data URI will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default Base64Studio;
