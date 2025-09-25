import { render } from '@testing-library/react-native';
import App from '../App';

it('renders the App component', () => {
  const { toJSON } = render(<App />);
  expect(toJSON()).toBeTruthy();
});
