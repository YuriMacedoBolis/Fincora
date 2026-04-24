import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const Privacidade = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F0] py-10 px-5">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#FF6400] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <article className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-[#003320] leading-relaxed font-sans">
          <header className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-[#1a5c3a] mt-2 text-sm">
              FinCare Brasil • Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>

            <div className="mt-5 flex items-start gap-3 bg-[#FFF4EC] border border-[#FF6400]/30 rounded-xl p-4">
              <ShieldCheck className="w-6 h-6 text-[#FF6400] shrink-0 mt-0.5" />
              <p className="text-sm text-[#003320]">
                A FinCare Brasil opera em <strong>total conformidade com a Lei Geral de
                Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e armazena seus
                dados em servidores seguros fornecidos pela <strong>Supabase</strong>,
                com criptografia em trânsito e em repouso.
              </p>
            </div>
          </header>

          <section className="space-y-6 text-[15px]">
            <p>
              Esta Política descreve como a FinCare Brasil coleta, utiliza, armazena
              e protege os dados pessoais dos seus usuários, em respeito à sua
              privacidade e segurança.
            </p>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">1. Dados Coletados</h2>
              <p>Coletamos apenas as informações estritamente necessárias para o funcionamento da plataforma:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Dados cadastrais:</strong> nome, e-mail e senha (criptografada).</li>
                <li><strong>Dados financeiros pessoais:</strong> transações, categorias, metas e valores informados pelo usuário.</li>
                <li><strong>Dados técnicos:</strong> informações de sessão, dispositivo e preferências de tema.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">2. Finalidade do Tratamento</h2>
              <p>
                Utilizamos seus dados exclusivamente para: (i) fornecer e melhorar os
                serviços da plataforma; (ii) personalizar sua experiência; (iii)
                garantir a segurança da sua conta; (iv) cumprir obrigações legais.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">3. Armazenamento e Segurança</h2>
              <p>
                Todos os dados são armazenados em servidores da{" "}
                <strong>Supabase</strong>, infraestrutura reconhecida internacionalmente
                pelos rigorosos padrões de segurança. Adotamos medidas técnicas e
                administrativas como criptografia, controle de acesso (RLS) e
                monitoramento contínuo para proteger suas informações.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">4. Compartilhamento de Dados</h2>
              <p>
                A FinCare Brasil <strong>não vende, aluga ou compartilha</strong> seus
                dados pessoais com terceiros para fins comerciais. Eventuais
                compartilhamentos ocorrem apenas com provedores de infraestrutura
                essenciais ao serviço (como a Supabase) ou em cumprimento de
                obrigações legais.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">5. Direitos do Titular (LGPD)</h2>
              <p>Em conformidade com a LGPD, você possui o direito de:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Confirmar a existência de tratamento dos seus dados;</li>
                <li>Acessar, corrigir ou atualizar seus dados a qualquer momento;</li>
                <li>Solicitar a portabilidade ou exclusão definitiva da sua conta;</li>
                <li>Revogar o consentimento concedido.</li>
              </ul>
              <p className="mt-2">
                A exclusão da conta pode ser feita diretamente pela área de{" "}
                <strong>Perfil</strong> da plataforma.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">6. Cookies e Armazenamento Local</h2>
              <p>
                Utilizamos armazenamento local (localStorage) apenas para preferências
                essenciais de uso, como tema visual e sessão de autenticação. Não
                utilizamos cookies de rastreamento publicitário.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">7. Inteligência Artificial</h2>
              <p>
                Mensagens enviadas ao Assistente FinCare Brasil podem ser processadas
                por serviços de IA integrados, exclusivamente para gerar respostas
                contextuais. Não utilizamos suas conversas para treinamento de
                modelos públicos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">8. Alterações nesta Política</h2>
              <p>
                Esta Política pode ser atualizada periodicamente. Notificaremos os
                usuários sobre mudanças relevantes através da plataforma ou por
                e-mail.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">9. Contato e Encarregado de Dados (DPO)</h2>
              <p>
                Para exercer seus direitos previstos na LGPD ou esclarecer dúvidas
                sobre o tratamento dos seus dados pessoais, entre em contato direto
                com a nossa equipe pelo e-mail oficial:{" "}
                <a
                  href="mailto:fincareti@gmail.com"
                  className="text-[#FF6400] font-semibold hover:underline"
                >
                  fincareti@gmail.com
                </a>
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Privacidade;
