const supporters = [
  { name: "TransLog", logo: "🚛" },
  { name: "Rota Express", logo: "🛣️" },
  { name: "CargoMax", logo: "📦" },
  { name: "Frete Seguro", logo: "🔒" },
  { name: "LogBrasil", logo: "🇧🇷" },
  { name: "TransPorte+", logo: "➕" },
  { name: "ViaRápida", logo: "⚡" },
  { name: "CarreTech", logo: "🔧" },
];

const Supporters = () => {
  return (
    <section id="apoiadores" className="py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Empresas que apoiam o
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Chama <span className="text-primary">Frete</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
          {supporters.map((supporter, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 opacity-70 hover:opacity-100"
            >
              <span className="text-3xl lg:text-4xl">{supporter.logo}</span>
              <span className="text-lg lg:text-xl font-semibold">{supporter.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Supporters;
