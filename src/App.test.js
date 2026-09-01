import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevWizard workspace', () => {
  render(<App />);
  const element = screen.getByText(/DevWizard/i);
  expect(element).toBeInTheDocument();
});

