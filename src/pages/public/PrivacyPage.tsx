import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-4">
              Política de <span className="text-blue-600">Privacidade</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">Última atualização: Maio de 2026</p>
          </div>

          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-sm">
            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">1. Introdução</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A Chama Frete ("nós", "nosso" ou "plataforma") respeita a sua privacidade. Esta Política de Privacidade
                explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais quando você utiliza
                nossa plataforma, site e serviços.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">2. Dados Coletados</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">Podemos coletar as seguintes categorias de dados:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, CPF/CNPJ, endereço</li>
                <li><strong>Dados de perfil:</strong> foto, biografia, tipo de veículo, certificações, preferências de rota</li>
                <li><strong>Dados de uso:</strong> interações com a plataforma, fretes publicados, anúncios visualizados</li>
                <li><strong>Dados de comunicação:</strong> mensagens no chat, avaliações, denúncias</li>
                <li><strong>Dados de pagamento:</strong> processados por intermediários certificados (não armazenamos dados completos de cartão)</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">3. Base Legal</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Tratamos seus dados com base na Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018),
                mediante seu consentimento, para execução de contrato, cumprimento de obrigação legal ou
                legítimo interesse, conforme a situação específica.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">4. Compartilhamento</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Seus dados podem ser compartilhados com outros usuários da plataforma conforme necessário para
                a realização de negócios (ex: empresa vê dados do motorista e vice-versa). Não vendemos seus
                dados pessoais para terceiros.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">5. Seus Direitos</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">Você tem direito a:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a portabilidade dos dados</li>
                <li>Solicitar a eliminação dos dados</li>
                <li>Revogar o consentimento a qualquer tempo</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">6. Segurança</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Utilizamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL/TLS,
                firewalls, controles de acesso e monitoramento contínuo. Seus dados são armazenados em servidores seguros.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">7. Cookies</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para
                melhorar sua experiência. Você pode configurar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">8. Contato</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
                <br /><strong>E-mail:</strong> suporte@chamafrete.com.br
                <br /><strong>Responsável LGPD:</strong> Lognetz IT - CNPJ: 35.099.685/0001-50
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
