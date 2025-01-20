import { GlobalStyle } from '@/styles/GlobalStyle';

import { ToastProvider } from './contexts';
import Router from './routes';

function App() {
  return (
    <>
      <GlobalStyle />
      <ToastProvider>
        <Router />
      </ToastProvider>
    </>
  );
}

export default App;
