import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevWizard workspace', () => {
  render(<App />);
  const elements = screen.getAllByText(/DevWizard/i);
  expect(elements.length).toBeGreaterThan(0);
});

