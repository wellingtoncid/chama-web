import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = '@ChamaFrete:cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto lg:mx-0 lg:left-4">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 pr-12">
        <button
          onClick={accept}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
            <Cookie size={20} className="text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Cookies e Privacidade
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
              <Link to="/privacidade" className="text-orange-500 hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <button
              onClick={accept}
              className="mt-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
