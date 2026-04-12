import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import { ReviewsList, ReviewForm } from '../../components/reviews';
import { api } from '../../api/api';

export default function ReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const loggedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null') : null;
  const isLoggedIn = !!loggedUser?.id;

  useEffect(() => {
    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  useEffect(() => {
    if (profile && loggedUser) {
      checkCanReview();
    }
  }, [profile, loggedUser]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/page/${slug}`);
      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = () => {
    if (!profile || !loggedUser) {
      setCanReview(false);
      return;
    }

    // Não pode avaliar a si mesmo
    if (loggedUser.id === profile.id) {
      setCanReview(false);
      return;
    }

    const reviewerRole = (loggedUser.role || '').toLowerCase();
    const targetRole = (profile.role || profile.user_type || '').toLowerCase();

    // Motorista não pode avaliar motorista
    if (reviewerRole === 'driver' && targetRole === 'driver') {
      setCanReview(false);
      return;
    }

    // Já avaliou?
    // Por enquanto, permite (a API vai validar no submit)

    setCanReview(true);
  };

  const theme = profile?.role === 'driver'
    ? { primary: 'orange', bg: 'bg-orange-600', text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-500/5' }
    : { primary: 'blue', bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-500/5' };

  const displayName = profile?.display_name || profile?.trade_name || profile?.name || 'Usuário';
  const userRole = profile?.role === 'driver' ? 'Motorista' : 'Empresa';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Perfil não encontrado</h1>
          <Link to="/" className="text-orange-500 font-bold hover:underline">Voltar para home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-grow pt-24 md:pt-28">
        <div className="max-w-3xl mx-auto px-4 pb-16">
          {/* Back Button */}
          <Link 
            to={`/perfil/${slug}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar ao perfil
          </Link>

          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${theme.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-2xl font-black">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
                  {displayName}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`${theme.text} text-xs font-black uppercase tracking-wider`}>{userRole}</span>
                  {profile.city && (
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <MapPin size={12} />
                      {profile.city} - {profile.state}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form or Login Prompt */}
          {isLoggedIn && canReview && !showForm && (
            <div className="mb-8">
              <button
                onClick={() => setShowForm(true)}
                className={`w-full py-4 ${theme.bg} text-white rounded-2xl font-black uppercase text-sm tracking-wider hover:opacity-90 transition-all shadow-lg`}
              >
                Avaliar este perfil
              </button>
            </div>
          )}

          {isLoggedIn && canReview && showForm && (
            <div className="mb-8">
              <ReviewForm
                targetId={profile.id}
                targetName={displayName}
                theme={theme.primary as 'orange' | 'blue'}
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {!isLoggedIn && (
            <div className={`${theme.light} rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-800 mb-8`}>
              <p className="text-slate-600 dark:text-slate-300 font-bold mb-4">
                Faça login para avaliar este perfil
              </p>
              <Link
                to={`/login?redirect=/avaliacoes/${slug}`}
                className={`inline-block px-8 py-3 ${theme.bg} text-white rounded-xl font-black uppercase text-sm tracking-wider hover:opacity-90 transition-all`}
              >
                Fazer Login
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-6">
              Avaliações
            </h2>
            <ReviewsList
              targetId={profile.id}
              theme={theme.primary as 'orange' | 'blue'}
              showDistribution={true}
              showPagination={true}
              showFilters={true}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
