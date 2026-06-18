import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/api/api';
import CategoryArticlesPage from './CategoryArticlesPage';
import ArticleDetailPage from './ArticleDetailPage';

const Loading = () => (
  <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
  </div>
);

const CategoryOrArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [isCategory, setIsCategory] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.get('/article-categories')
      .then(res => {
        if (cancelled) return;
        if (res.data?.success) {
          const found = res.data.data?.categories?.find(
            (c: any) => c.slug === slug
          );
          setIsCategory(!!found);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <Loading />;
  if (isCategory) return <CategoryArticlesPage />;
  return <ArticleDetailPage />;
};

export default CategoryOrArticlePage;
