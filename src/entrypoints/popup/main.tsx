import { render } from 'preact';
import App from './src/App.tsx';

render(
  <App />,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.getElementById('root')!,
);
