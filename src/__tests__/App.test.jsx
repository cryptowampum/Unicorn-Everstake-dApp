cat > src/__tests__/App.test.jsx << 'EOF'
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Unicorn POL Staking', () => {
  render(<App />);
  const linkElement = screen.getByText(/unicorn pol staking/i);
  expect(linkElement).toBeInTheDocument();
});
