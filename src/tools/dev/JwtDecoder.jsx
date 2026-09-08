import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import { KeyRound, ShieldAlert, ShieldCheck, User, Copy, Check, Sparkles } from 'lucide-react';
import './JwtDecoder.css';

const DEFAULT_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldldpemFyZCBVc2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODkzNDU2MDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const JwtDecoder = () => {
  const { showToast } = useApp();
  const [token, setToken] = useState(DEFAULT_JWT);
  const [copiedKey, setCopiedKey] = useState(null);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format: A valid JWT consists of three dot-separated Base64URL parts (Header.Payload.Signature)' };
    }

    try {
      const decodeB64 = (str) => {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
          case 0: break;
          case 2: output += '=='; break;
          case 3: output += '='; break;
          default: throw new Error('Illegal base64url string!');
        }
        const bin = atob(output);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          bytes[i] = bin.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      };

      const header = JSON.parse(decodeB64(parts[0]));
      const payload = JSON.parse(decodeB64(parts[1]));
      const signature = parts[2];

      // Expiry calculation
      let isExpired = null;
      let expDate = null;
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
      }

      let issuedDate = null;
      if (payload.iat) {
        issuedDate = new Date(payload.iat * 1000);
      }

      return { header, payload, signature, isExpired, expDate, issuedDate, error: null };
    } catch (e) {
      return { error: `Failed to decode JWT: ${e.message}` };
    }
  }, [token]);

  const copySection = (key, label, objOrStr) => {
    const text = typeof objOrStr === 'object' ? JSON.stringify(objOrStr, null, 2) : String(objOrStr);
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statusLeft = decoded?.error ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <ShieldAlert size={12} /> {decoded.error}
    </span>
  ) : decoded?.isExpired !== null && decoded?.isExpired !== undefined ? (
    decoded?.isExpired ? (
      <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ShieldAlert size={12} /> Token Expired ({decoded.expDate?.toLocaleString()})
      </span>
    ) : (
      <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ShieldCheck size={12} /> Token Active (Expires: {decoded?.expDate?.toLocaleString()})
      </span>
    )
  ) : (
    <span>JWT Token Decoder</span>
  );

  return (
    <ToolWorkspace
      toolId="jwt-decoder"
      input={token}
      onInputChange={setToken}
      inputLabel="Encoded JWT Token"
      outputLabel="Decoded Claims & Payload"
      statusLeft={statusLeft}
      statusRight={<span>{token.length} chars</span>}
      singlePanel={false}
      output={null}
      hideOutput={false}
    >
      <div className="jwt-output-container">
        {decoded?.error ? (
          <div className="dw-empty">
            <div className="dw-empty-icon-box danger">
              <ShieldAlert size={24} />
            </div>
            <div className="dw-empty-title">Malformed JWT Token</div>
            <div className="dw-empty-desc">{decoded.error}</div>
          </div>
        ) : decoded ? (
          <div className="jwt-sections">
            {/* Header */}
            <div className="jwt-card">
              <div className="jwt-card-header header-color">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={14} />
                  <span>HEADER: Algorithm & Token Type</span>
                </div>
                <button
                  className="jwt-copy-btn"
                  onClick={() => copySection('header', 'Header JSON', decoded.header)}
                  title="Copy Header"
                >
                  {copiedKey === 'header' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="jwt-code">{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>

            {/* Payload */}
            <div className="jwt-card">
              <div className="jwt-card-header payload-color">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span>PAYLOAD: Data Claims</span>
                </div>
                <button
                  className="jwt-copy-btn"
                  onClick={() => copySection('payload', 'Payload Claims', decoded.payload)}
                  title="Copy Payload"
                >
                  {copiedKey === 'payload' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="jwt-code">{JSON.stringify(decoded.payload, null, 2)}</pre>
            </div>

            {/* Signature */}
            <div className="jwt-card">
              <div className="jwt-card-header signature-color">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>SIGNATURE</span>
                </div>
                <button
                  className="jwt-copy-btn"
                  onClick={() => copySection('sig', 'Signature', decoded.signature)}
                  title="Copy Signature"
                >
                  {copiedKey === 'sig' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="jwt-signature-val">{decoded.signature}</div>
            </div>
          </div>
        ) : (
          <div className="dw-empty">
            <div className="dw-empty-icon-box">
              <Sparkles size={24} />
            </div>
            <div className="dw-empty-title">Waiting for JWT Token</div>
            <div className="dw-empty-desc">Paste a Bearer token or OAuth JWT on the left to inspect its claims.</div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default JwtDecoder;
