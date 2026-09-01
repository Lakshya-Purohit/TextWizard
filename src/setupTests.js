import '@testing-library/jest-dom';

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

