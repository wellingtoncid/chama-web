import AppRoutes from './routes/AppRoutes';
import CookieConsent from './components/shared/CookieConsent';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <AppRoutes />
      <CookieConsent />
    </div>
  );
}