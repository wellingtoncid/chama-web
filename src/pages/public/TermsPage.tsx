import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-600 dark:text-slate-400" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-4">
              Termos de <span className="text-slate-700 dark:text-slate-300">Uso</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">Última atualização: Maio de 2026</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-10">
            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">1. Aceitação dos Termos</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Ao acessar ou utilizar a plataforma Chama Frete, você concorda com estes Termos de Uso.
                Se não concordar com qualquer parte, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">2. Definições</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Plataforma:</strong> site e aplicativo Chama Frete</li>
                <li><strong>Usuário:</strong> pessoa física ou jurídica cadastrada na plataforma</li>
                <li><strong>Shipper:</strong> empresa que contrata frete (embarcador)</li>
                <li><strong>Carrier:</strong> motorista ou transportadora que realiza o frete</li>
                <li><strong>Conteúdo:</strong> informações, textos, imagens e dados publicados na plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">3. Cadastro e Conta</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                O usuário é responsável pela veracidade dos dados fornecidos no cadastro e pela segurança
                de sua senha. Contas devem ser usadas exclusivamente pelo titular. Qualquer atividade
                realizada na conta é de responsabilidade do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">4. Responsabilidades do Usuário</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-5">
                <li>Não publicar conteúdo falso, fraudulento ou enganoso</li>
                <li>Não utilizar a plataforma para atividades ilícitas</li>
                <li>Respeitar os demais usuários e as regras da comunidade</li>
                <li>Não realizar spam ou enviar mensagens não solicitadas</li>
                <li>Não tentar burlar sistemas de segurança ou limites da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">5. Planos e Pagamentos</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A plataforma oferece planos de assinatura e funcionalidades pagas. Os valores e condições
                estão descritos na página de planos. O não pagamento pode resultar em suspensão ou
                cancelamento da conta. Reembolsos seguem a política estabelecida em cada plano.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">6. Propriedade Intelectual</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Todo o código, design, marcas e conteúdo original da plataforma são propriedade da
                Lognetz IT. O conteúdo publicado pelos usuários permanece de sua propriedade, mas
                a plataforma tem licença para exibi-lo e distribuí-lo no contexto dos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">7. Limitação de Responsabilidade</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A Chama Frete atua como intermediária, conectando usuários. Não nos responsabilizamos
                por negociações, acordos ou disputas entre usuários. A plataforma não garante a
                realização de fretes ou a veracidade de todas as informações publicadas por terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">8. Alterações nos Termos</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Podemos alterar estes termos a qualquer momento. Alterações significativas serão
                comunicadas aos usuários por e-mail ou aviso na plataforma. O uso continuado após
                as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">9. Contato</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Dúvidas sobre estes termos: <strong>suporte@chamafrete.com.br</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
