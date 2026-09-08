import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getToolById } from './toolRegistry';

const ALIAS_REDIRECTS = {
  'json-formatter': { target: 'json-studio', tab: 'format' },
  'json-tree': { target: 'json-studio', tab: 'tree' },
  'json-converter': { target: 'json-studio', tab: 'convert' },
  'string-json': { target: 'json-studio', tab: 'convert' },
};

const ToolRoute = () => {
  const { toolId } = useParams();

  if (ALIAS_REDIRECTS[toolId]) {
    const alias = ALIAS_REDIRECTS[toolId];
    return <Navigate to={`/tool/${alias.target}?tab=${alias.tab}`} replace />;
  }

  const tool = getToolById(toolId);

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  const Component = tool.component;

  return (
    <Suspense
      fallback={
        <div className="dw-loading-state">
          <div className="dw-spinner" />
          <span>Loading {tool.name}...</span>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
};

export default ToolRoute;
