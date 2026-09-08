import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { FileCode2, Minimize2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const SAMPLES = {
  basic: `<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer's Guide</title>\n    <genre>Computer</genre>\n    <price>44.95</price>\n    <publish_date>2026-09-08</publish_date>\n    <description>An in-depth look at creating applications with XML.</description>\n  </book>\n</catalog>`,
  minified: `<?xml version="1.0" encoding="UTF-8"?><service name="DevWizard"><version>4</version><platform>Web</platform></service>`
};

const XmlFormatter = () => {
  const [input, setInput] = useState(SAMPLES.basic);
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState('format'); // 'format' | 'minify'

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      // 1. Strict XML Validation
      const validation = XMLValidator.validate(input);
      if (validation !== true) {
        const errMsg = validation.err
          ? `XML Error: ${validation.err.msg} (Line ${validation.err.line}, Column ${validation.err.col})`
          : 'Invalid XML document structure';
        return { output: '', valid: false, error: errMsg };
      }

      // 2. Parse Valid XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: true,
        trimValues: true
      });
      const parsed = parser.parse(input);

      if (!parsed || Object.keys(parsed).length === 0) {
        return { output: '', valid: false, error: 'Empty XML structure' };
      }

      // 3. Build Formatted / Minified XML
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: mode === 'format',
        indentBy: ' '.repeat(indentSize),
        suppressEmptyNode: false
      });

      const built = builder.build(parsed);
      const output = built.startsWith('<?xml') ? built : '<?xml version="1.0" encoding="UTF-8"?>\n' + built;
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, indentSize, mode]);

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${mode === 'format' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('format')}
        >
          <FileCode2 size={12} />
          <span>Format</span>
        </button>
        <button
          className={`dw-btn dw-btn-sm ${mode === 'minify' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('minify')}
        >
          <Minimize2 size={12} />
          <span>Minify</span>
        </button>
      </div>

      {mode === 'format' && (
        <select
          className="dw-input dw-select"
          style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '12px', height: '28px' }}
          value={indentSize}
          onChange={(e) => setIndentSize(Number(e.target.value))}
        >
          <option value={2}>2 Spaces</option>
          <option value={4}>4 Spaces</option>
        </select>
      )}

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={() => setInput(SAMPLES.basic)}
        title="Load sample XML document"
      >
        <Sparkles size={11} />
        <span>Sample XML</span>
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Valid XML Document
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : (
    <span>XML Formatter & Validator</span>
  );

  const statusRight = input ? (
    <span>Input: <strong>{input.length}</strong> chars • Output: <strong>{result.output ? result.output.length : 0}</strong> chars</span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="xml-formatter"
      input={input}
      output={result.output}
      errorMessage={result.valid === false ? result.error : null}
      onInputChange={setInput}
      inputLabel="XML Input"
      outputLabel={mode === 'format' ? `Formatted XML (${indentSize} spaces)` : 'Minified XML'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
    />
  );
};

export default XmlFormatter;
