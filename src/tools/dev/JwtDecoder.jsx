import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { KeyRound, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import './JwtDecoder.css';

const JwtDecoder = () => {
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldldpemFyZCBVc2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODkzNDU2MDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format: A valid JWT consists of three dot-separated parts (Header.Payload.Signature)' };
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
        return decodeURIComponent(escape(atob(output)));
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
      return { error: 'Failed to decode JWT: ' + e.message };
    }
  }, [token]);

  const statusLeft = decoded?.error ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <ShieldAlert size={12} /> {decoded.error}
    </span>
  ) : decoded?.isExpired !== null ? (
    decoded?.isExpired ? (
      <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ShieldAlert size={12} /> Token Expired ({decoded.expDate?.toLocaleString()})
      </span>
    ) : (
      <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ShieldCheck size={12} /> Token Active (Expires: {decoded?.expDate?.toLocaleString()})
      </span>
    )
  ) : null;

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
            <ShieldAlert size={32} color="var(--accent-danger)" />
            <div className="dw-empty-title">Invalid Token</div>
            <div className="dw-empty-desc">{decoded.error}</div>
          </div>
        ) : decoded ? (
          <div className="jwt-sections">
            {/* Header */}
            <div className="jwt-card">
              <div className="jwt-card-header header-color">
                <KeyRound size={14} />
                <span>HEADER: Algorithm & Token Type</span>
              </div>
              <pre className="jwt-code">{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>

            {/* Payload */}
            <div className="jwt-card">
              <div className="jwt-card-header payload-color">
                <User size={14} />
                <span>PAYLOAD: Data Claims</span>
              </div>
              <pre className="jwt-code">{JSON.stringify(decoded.payload, null, 2)}</pre>
            </div>

            {/* Signature */}
            <div className="jwt-card">
              <div className="jwt-card-header signature-color">
                <ShieldCheck size={14} />
                <span>SIGNATURE</span>
              </div>
              <div className="jwt-signature-val">{decoded.signature}</div>
            </div>
          </div>
        ) : (
          <div className="dw-empty">
            <div className="dw-empty-desc">Paste a valid JWT to inspect its claims</div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default JwtDecoder;
