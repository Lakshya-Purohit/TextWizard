import React, { useState, useEffect, useMemo, useRef } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  FileText, Image as ImageIcon, Music, Video as VideoIcon,
  File, Upload, Download, Copy, Check, Eye, ExternalLink,
  Trash2, Sparkles, FileCode, AlertCircle
} from 'lucide-react';
import './Base64FileConverter.css';

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

// Common MIME options
const MIME_OPTIONS = [
  { label: 'Auto Detect', value: 'auto' },
  // Documents
  { label: 'PDF Document (.pdf)', value: 'application/pdf', ext: 'pdf' },
  { label: 'Plain Text (.txt)', value: 'text/plain', ext: 'txt' },
  { label: 'JSON (.json)', value: 'application/json', ext: 'json' },
  { label: 'XML (.xml)', value: 'application/xml', ext: 'xml' },
  { label: 'HTML (.html)', value: 'text/html', ext: 'html' },
  { label: 'ZIP Archive (.zip)', value: 'application/zip', ext: 'zip' },
  // Images
  { label: 'PNG Image (.png)', value: 'image/png', ext: 'png' },
  { label: 'JPEG Image (.jpg)', value: 'image/jpeg', ext: 'jpg' },
  { label: 'SVG Image (.svg)', value: 'image/svg+xml', ext: 'svg' },
  { label: 'WebP Image (.webp)', value: 'image/webp', ext: 'webp' },
  { label: 'GIF Image (.gif)', value: 'image/gif', ext: 'gif' },
  { label: 'ICO Icon (.ico)', value: 'image/x-icon', ext: 'ico' },
  // Videos
  { label: 'MP4 Video (.mp4)', value: 'video/mp4', ext: 'mp4' },
  { label: 'WebM Video (.webm)', value: 'video/webm', ext: 'webm' },
  { label: 'OGG Video (.ogv)', value: 'video/ogg', ext: 'ogv' },
  // Audio
  { label: 'MP3 Audio (.mp3)', value: 'audio/mpeg', ext: 'mp3' },
  { label: 'WAV Audio (.wav)', value: 'audio/wav', ext: 'wav' },
  { label: 'OGG Audio (.ogg)', value: 'audio/ogg', ext: 'ogg' },
  { label: 'AAC Audio (.aac)', value: 'audio/aac', ext: 'aac' },
];

// Helper to format bytes
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Detect MIME from Base64 header or magic bytes
const detectMimeType = (base64String) => {
  // Check if string has Data URI prefix
  const dataUriMatch = base64String.match(/^data:([a-zA-Z0-9.+/-]+);base64,/i);
  if (dataUriMatch) {
    return { mime: dataUriMatch[1].toLowerCase(), isDataUri: true };
  }

  // Clean raw Base64 prefix/whitespace
  const clean = base64String.replace(/[\s\r\n]+/g, '').slice(0, 32);

  // Common Base64 prefix signatures
  if (clean.startsWith('JVBERi0')) return { mime: 'application/pdf', ext: 'pdf' };
  if (clean.startsWith('iVBORw0KGgo')) return { mime: 'image/png', ext: 'png' };
  if (clean.startsWith('/9j/')) return { mime: 'image/jpeg', ext: 'jpg' };
  if (clean.startsWith('R0lGOD')) return { mime: 'image/gif', ext: 'gif' };
  if (clean.startsWith('UklGR')) return { mime: 'image/webp', ext: 'webp' }; // Could also be WAV
  if (clean.startsWith('PHN2Zy') || clean.startsWith('PD94bWw')) return { mime: 'image/svg+xml', ext: 'svg' };
  if (clean.startsWith('AAAAIGZ0eX') || clean.startsWith('AAAAHGZ0eX') || clean.startsWith('AAAAKGZ0eX')) return { mime: 'video/mp4', ext: 'mp4' };
  if (clean.startsWith('GkXfo5')) return { mime: 'video/webm', ext: 'webm' };
  if (clean.startsWith('SUQz') || clean.startsWith('//tQ') || clean.startsWith('//uQ')) return { mime: 'audio/mpeg', ext: 'mp3' };
  if (clean.startsWith('T2dnUw')) return { mime: 'audio/ogg', ext: 'ogg' };
  if (clean.startsWith('UEsDB')) return { mime: 'application/zip', ext: 'zip' };

  return { mime: 'application/octet-stream', ext: 'bin' };
};

const Base64FileConverter = () => {
  const [activeTab, setActiveTab] = useState('base64-to-file'); // 'base64-to-file' | 'file-to-base64'
  const [base64Input, setBase64Input] = useState(SAMPLE_PRESETS.svg.base64);
  const [selectedMime, setSelectedMime] = useState('auto');
  const [customFilename, setCustomFilename] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // File to Base64 State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generatedBase64, setGeneratedBase64] = useState('');
  const [generatedDataUri, setGeneratedDataUri] = useState('');
  const [fileMime, setFileMime] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const { showToast } = useApp();

  // Clean raw Base64 string by stripping data URI if present
  const cleanBase64 = useMemo(() => {
    let s = base64Input.trim();
    if (!s) return '';
    if (s.startsWith('data:')) {
      const idx = s.indexOf('base64,');
      if (idx !== -1) {
        s = s.substring(idx + 7);
      }
    }
    return s.replace(/[\s\r\n]+/g, '');
  }, [base64Input]);

  // Determine effective MIME type and Blob URL for Base64 -> File
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
      // Decode Base64 to binary
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

  // Cleanup Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (conversionData?.blobUrl) {
        URL.revokeObjectURL(conversionData.blobUrl);
      }
    };
  }, [conversionData?.blobUrl]);

  // Copy helper
  const copyText = (key, label, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download converted file
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

  // Load Preset Sample
  const loadPreset = (key) => {
    const p = SAMPLE_PRESETS[key];
    if (!p) return;
    setBase64Input(p.base64);
    setSelectedMime(p.mime);
    setCustomFilename(`sample.${p.ext}`);
    showToast(`Loaded ${p.name}`, 'info');
  };

  // File to Base64 Upload Handler
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
      toolId="base64-file"
      singlePanel={true}
    >
      <div className="b64f-container">
        {/* Mode Switcher Tabs */}
        <div className="b64f-mode-header">
          <div className="b64f-mode-tabs">
            <button
              className={`b64f-mode-tab ${activeTab === 'base64-to-file' ? 'active' : ''}`}
              onClick={() => setActiveTab('base64-to-file')}
            >
              <Download size={14} />
              <span>Base64 to File / Media</span>
            </button>
            <button
              className={`b64f-mode-tab ${activeTab === 'file-to-base64' ? 'active' : ''}`}
              onClick={() => setActiveTab('file-to-base64')}
            >
              <Upload size={14} />
              <span>File / Media to Base64</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: Base64 to File Converter */}
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
                {/* Format Settings Bar */}
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
                      className="dw-input b64f-name-input"
                      placeholder={`output.${conversionData?.ext || 'bin'}`}
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                    />
                  </div>
                </div>

                {/* Big Textarea */}
                <div className="b64f-textarea-wrap">
                  <textarea
                    className="b64f-textarea text-mono"
                    placeholder="Paste Base64 string here (e.g. data:image/png;base64,iVBORw... or raw iVBORw...)"
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    spellCheck={false}
                  />
                </div>

                {/* Sample Presets */}
                <div className="b64f-presets-strip">
                  <span className="b64f-presets-label">
                    <Sparkles size={12} /> Presets:
                  </span>
                  <button className="b64f-chip" onClick={() => loadPreset('svg')}>Sample SVG</button>
                  <button className="b64f-chip" onClick={() => loadPreset('png')}>Sample PNG</button>
                  <button className="b64f-chip" onClick={() => loadPreset('pdf')}>Sample PDF</button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview & Download */}
            <div className="b64f-card b64f-output-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <Eye size={16} className="text-primary" />
                  <span>Decoded Media & File Preview</span>
                </div>
                {conversionData?.valid && (
                  <button
                    className="dw-btn dw-btn-primary dw-btn-sm"
                    onClick={handleDownload}
                  >
                    <Download size={13} />
                    <span>Download File</span>
                  </button>
                )}
              </div>

              <div className="b64f-card-body b64f-preview-body">
                {/* Error State */}
                {conversionData && !conversionData.valid && (
                  <div className="b64f-alert danger">
                    <AlertCircle size={16} />
                    <span>{conversionData.error}</span>
                  </div>
                )}

                {/* Empty State */}
                {!base64Input.trim() && (
                  <div className="b64f-empty-preview">
                    <File size={36} className="b64f-empty-icon" />
                    <h4>No Base64 Data Provided</h4>
                    <p>Paste a Base64 string or choose a sample preset on the left to see live preview and download.</p>
                  </div>
                )}

                {/* Valid Preview State */}
                {conversionData?.valid && (
                  <div className="b64f-preview-container">
                    {/* Media Viewer Area */}
                    <div className="b64f-media-viewport">
                      {/* Image Viewer */}
                      {conversionData.isImage && (
                        <div className="b64f-image-viewport">
                          <img
                            src={conversionData.blobUrl}
                            alt="Decoded Preview"
                            className="b64f-preview-img"
                          />
                        </div>
                      )}

                      {/* PDF Viewer */}
                      {conversionData.isPdf && (
                        <div className="b64f-pdf-viewport">
                          <iframe
                            src={conversionData.blobUrl}
                            title="Decoded PDF Preview"
                            className="b64f-preview-iframe"
                          />
                        </div>
                      )}

                      {/* Video Player */}
                      {conversionData.isVideo && (
                        <div className="b64f-video-viewport">
                          <video
                            src={conversionData.blobUrl}
                            controls
                            className="b64f-preview-video"
                          >
                            Your browser does not support video playback.
                          </video>
                        </div>
                      )}

                      {/* Audio Player */}
                      {conversionData.isAudio && (
                        <div className="b64f-audio-viewport">
                          <div className="b64f-audio-card">
                            <Music size={32} className="b64f-audio-icon" />
                            <audio
                              src={conversionData.blobUrl}
                              controls
                              className="b64f-preview-audio"
                            >
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        </div>
                      )}

                      {/* Generic Document / Binary */}
                      {!conversionData.isImage && !conversionData.isPdf && !conversionData.isVideo && !conversionData.isAudio && (
                        <div className="b64f-generic-viewport">
                          <File size={40} className="b64f-generic-icon" />
                          <div className="b64f-generic-title">Binary / Document File</div>
                          <span className="b64f-generic-meta">{conversionData.mime}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Quick Action Bar */}
                    <div className="b64f-meta-bar">
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">MIME Type:</span>
                        <span className="b64f-meta-val text-mono">{conversionData.mime}</span>
                      </div>
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">File Size:</span>
                        <span className="b64f-meta-val text-mono">{conversionData.formattedSize}</span>
                      </div>
                      <div className="b64f-meta-item">
                        <span className="b64f-meta-label">Extension:</span>
                        <span className="b64f-meta-val text-mono">.{conversionData.ext}</span>
                      </div>
                    </div>

                    {/* Quick Export Actions */}
                    <div className="b64f-actions-list">
                      <div className="b64f-action-row">
                        <span className="b64f-action-label">Data URI</span>
                        <button
                          className="dw-btn dw-btn-secondary dw-btn-sm"
                          onClick={() => copyText('dataUri', 'Data URI', conversionData.dataUri)}
                        >
                          {copiedKey === 'dataUri' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          <span>Copy Data URI</span>
                        </button>
                      </div>

                      <div className="b64f-action-row">
                        <span className="b64f-action-label">Raw Base64</span>
                        <button
                          className="dw-btn dw-btn-secondary dw-btn-sm"
                          onClick={() => copyText('rawB64', 'Raw Base64', cleanBase64)}
                        >
                          {copiedKey === 'rawB64' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          <span>Copy Raw Base64</span>
                        </button>
                      </div>

                      {conversionData.blobUrl && (
                        <div className="b64f-action-row">
                          <span className="b64f-action-label">Browser View</span>
                          <a
                            href={conversionData.blobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dw-btn dw-btn-secondary dw-btn-sm"
                          >
                            <ExternalLink size={12} />
                            <span>Open in New Tab</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: File to Base64 Converter */}
        {/* ============================================================ */}
        {activeTab === 'file-to-base64' && (
          <div className="b64f-view-grid">
            {/* Left: Drag & Drop Dropzone */}
            <div className="b64f-card b64f-upload-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <Upload size={16} className="text-primary" />
                  <span>Upload File to Convert (PDF, Image, Video, Audio, etc.)</span>
                </div>
              </div>

              <div className="b64f-card-body">
                {/* Dropzone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />

                <div
                  className={`b64f-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="b64f-dropzone-icon">
                    <Upload size={28} />
                  </div>
                  <h3 className="b64f-dropzone-title">Click to browse or drop any file here</h3>
                  <p className="b64f-dropzone-subtitle">Supports PDF documents, PNG/JPG/WebP/SVG images, MP4/WebM videos, MP3/WAV audio, ZIPs & more</p>
                  <button
                    type="button"
                    className="dw-btn dw-btn-primary dw-btn-sm"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Select File from Device
                  </button>
                </div>

                {/* Uploaded File Info Card */}
                {uploadedFile && (
                  <div className="b64f-file-info-card">
                    <div className="b64f-file-info-icon">
                      {fileMime.startsWith('image/') ? <ImageIcon size={20} /> :
                       fileMime === 'application/pdf' ? <FileText size={20} /> :
                       fileMime.startsWith('video/') ? <VideoIcon size={20} /> :
                       fileMime.startsWith('audio/') ? <Music size={20} /> : <File size={20} />}
                    </div>
                    <div className="b64f-file-info-meta">
                      <span className="b64f-file-name">{uploadedFile.name}</span>
                      <span className="b64f-file-specs">
                        {formatBytes(uploadedFile.size)} • {fileMime}
                      </span>
                    </div>
                    <button
                      className="dw-btn dw-btn-ghost dw-btn-sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setGeneratedBase64('');
                        setGeneratedDataUri('');
                      }}
                      title="Remove file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Generated Base64 Snippets */}
            <div className="b64f-card b64f-results-card">
              <div className="b64f-card-header">
                <div className="b64f-header-title">
                  <FileCode size={16} className="text-primary" />
                  <span>Encoded Base64 & Integration Snippets</span>
                </div>
              </div>

              <div className="b64f-card-body b64f-code-body">
                {!generatedBase64 ? (
                  <div className="b64f-empty-preview">
                    <FileCode size={36} className="b64f-empty-icon" />
                    <h4>No File Uploaded Yet</h4>
                    <p>Select or drag any file into the upload zone to generate Base64, Data URIs, HTML tags, and CSS snippets.</p>
                  </div>
                ) : (
                  <div className="b64f-snippets-container">
                    {/* Snippet 1: Raw Base64 */}
                    <div className="b64f-snippet-block">
                      <div className="b64f-snippet-header">
                        <span className="b64f-snippet-title">Raw Base64 String</span>
                        <button
                          className="dw-btn dw-btn-secondary dw-btn-sm"
                          onClick={() => copyText('rawOut', 'Raw Base64', generatedBase64)}
                        >
                          {copiedKey === 'rawOut' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          <span>Copy Raw</span>
                        </button>
                      </div>
                      <textarea
                        className="b64f-snippet-textarea text-mono"
                        readOnly
                        value={generatedBase64}
                      />
                    </div>

                    {/* Snippet 2: Data URI */}
                    <div className="b64f-snippet-block">
                      <div className="b64f-snippet-header">
                        <span className="b64f-snippet-title">Data URI (Ready for href / src)</span>
                        <button
                          className="dw-btn dw-btn-secondary dw-btn-sm"
                          onClick={() => copyText('dataUriOut', 'Data URI', generatedDataUri)}
                        >
                          {copiedKey === 'dataUriOut' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          <span>Copy Data URI</span>
                        </button>
                      </div>
                      <textarea
                        className="b64f-snippet-textarea text-mono"
                        readOnly
                        value={generatedDataUri}
                      />
                    </div>

                    {/* Snippet 3: HTML Embedding Tag */}
                    <div className="b64f-snippet-block">
                      <div className="b64f-snippet-header">
                        <span className="b64f-snippet-title">HTML Tag Snippet</span>
                        <button
                          className="dw-btn dw-btn-secondary dw-btn-sm"
                          onClick={() => {
                            const snippet = fileMime.startsWith('image/')
                              ? `<img src="${generatedDataUri}" alt="${uploadedFile?.name || 'Image'}" />`
                              : fileMime.startsWith('video/')
                              ? `<video controls src="${generatedDataUri}"></video>`
                              : fileMime.startsWith('audio/')
                              ? `<audio controls src="${generatedDataUri}"></audio>`
                              : `<a href="${generatedDataUri}" download="${uploadedFile?.name || 'file'}">Download ${uploadedFile?.name || 'File'}</a>`;
                            copyText('htmlTag', 'HTML Tag', snippet);
                          }}
                        >
                          {copiedKey === 'htmlTag' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          <span>Copy HTML</span>
                        </button>
                      </div>
                      <textarea
                        className="b64f-snippet-textarea text-mono"
                        readOnly
                        value={
                          fileMime.startsWith('image/')
                            ? `<img src="${generatedDataUri.slice(0, 100)}..." alt="${uploadedFile?.name || 'Image'}" />`
                            : fileMime.startsWith('video/')
                            ? `<video controls src="${generatedDataUri.slice(0, 100)}..."></video>`
                            : fileMime.startsWith('audio/')
                            ? `<audio controls src="${generatedDataUri.slice(0, 100)}..."></audio>`
                            : `<a href="${generatedDataUri.slice(0, 100)}..." download="${uploadedFile?.name || 'file'}">Download File</a>`
                        }
                      />
                    </div>
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

export default Base64FileConverter;
