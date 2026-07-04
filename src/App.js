import React from 'react';
import Workspace from './Workspace';

// Workspace is fully responsive (CSS Grid + media queries), so the
// old isMobile-based branch between separate Desktop/Mobile components
// is no longer needed — one component, one source of truth.
const App = () => {
  return <Workspace />;
};

export default App;