// Exemplo de como você usará no seu componente de lista de fretes
const AdSection = ({ ads, showFallback }) => {
  return (
    <div className="ad-container">
      {ads.length > 0 ? (
        ads.map(ad => <MyCustomAdCard key={ad.id} data={ad} />)
      ) : null}

      {/* Se não tem anúncio próprio ou a API autorizou o fallback */}
      {showFallback && (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"></ins>
      )}
    </div>
  );
};