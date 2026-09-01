import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getToolById } from './toolRegistry';

const ToolRoute = () => {
  const { toolId } = useParams();
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
