import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Termos = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F0] py-10 px-5">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF6400] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <article className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-[#003320] leading-relaxed font-sans">
          <header className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Termos e Condições de Uso
            </h1>
            <p className="text-[#1a5c3a] mt-2 text-sm">
              FinCare Brasil • Última atualização: 24/04/2026
            </p>
          </header>

          <section className="space-y-6 text-[15px]">
            <p>
              Bem-vindo à <strong>FinCare Brasil</strong>. Ao acessar e utilizar
              nossa plataforma, você concorda integralmente com os termos e
              condições descritos abaixo. Recomendamos a leitura atenta deste
              documento antes de utilizar nossos serviços.
            </p>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao criar uma conta na FinCare Brasil, você declara ter lido,
                compreendido e aceito todas as cláusulas destes Termos de Uso,
                bem como a nossa Política de Privacidade.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                2. Descrição do Serviço
              </h2>
              <p>
                A FinCare Brasil oferece uma plataforma digital de gestão
                financeira pessoal, permitindo o registro de transações,
                definição de metas, acompanhamento de gastos e o uso de um
                assistente de inteligência artificial para apoio na organização
                financeira. O serviço é fornecido{" "}
                <strong>"no estado em que se encontra"</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                3. Cadastro e Conta de Usuário
              </h2>
              <p>
                Para utilizar a plataforma, é necessário criar uma conta com
                informações verídicas e atualizadas. O usuário é o único
                responsável pela confidencialidade de sua senha e por todas as
                atividades realizadas em sua conta.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                4. Assinaturas, Pagamentos e Reembolso
              </h2>
              <p>
                O acesso a recursos premium da FinCare Brasil é feito mediante
                assinatura (mensal ou anual).
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Direito de Arrependimento:</strong> Em conformidade
                  com o Art. 49 do Código de Defesa do Consumidor (CDC), o
                  usuário tem o direito de solicitar o cancelamento e o
                  reembolso integral do valor pago em até{" "}
                  <strong>7 (sete) dias corridos</strong> após a contratação
                  inicial.
                </li>
                <li>
                  Após o prazo de 7 dias, o cancelamento interrompe cobranças
                  futuras, mas <strong>não</strong> gera reembolso proporcional
                  dos meses já utilizados.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                5. Uso Adequado da Plataforma
              </h2>
              <p>
                O usuário compromete-se a utilizar a FinCare Brasil de forma
                ética e legal, abstendo-se de qualquer prática que possa
                comprometer a integridade, segurança ou disponibilidade do
                serviço.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                6. Limitação de Responsabilidade (Disclaimer Legal)
              </h2>
              <p>
                A FinCare Brasil é uma ferramenta de tecnologia para apoio à
                gestão financeira e{" "}
                <strong>
                  não constitui consultoria financeira, contábil, tributária ou
                  de investimentos
                </strong>
                . A FinCare Brasil e seus criadores não se responsabilizam por
                perdas financeiras, decisões de investimento, endividamento ou
                quaisquer consequências decorrentes do uso das informações
                geradas pela plataforma.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                7. Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo, marca, logotipos, layout, design e código-fonte
                da plataforma são de propriedade exclusiva da FinCare Brasil,
                sendo proibida sua reprodução total ou parcial sem autorização
                expressa.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                8. Modificações dos Termos
              </h2>
              <p>
                A FinCare Brasil reserva-se o direito de alterar estes Termos a
                qualquer momento, mediante notificação aos usuários através da
                plataforma ou por e-mail.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                9. Cancelamento da Conta
              </h2>
              <p>
                O usuário pode solicitar a exclusão de sua conta a qualquer
                momento, pela área de Perfil. A FinCare Brasil pode suspender ou
                encerrar contas que violem estes Termos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">
                10. Foro e Legislação Aplicável
              </h2>
              <p>
                Estes Termos são regidos pela legislação brasileira. Fica eleito
                o foro da comarca de <strong>Brasília - DF</strong> para dirimir
                quaisquer controvérsias oriundas deste documento, com renúncia
                expressa a qualquer outro, por mais privilegiado que seja.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-6 mb-2">11. Contato</h2>
              <p>
                Em caso de dúvidas sobre estes Termos, entre em contato com
                nossa equipe pelo e-mail oficial:{" "}
                <a
                  href="mailto:fincareti@gmail.com"
                  className="text-[#FF6400] font-semibold hover:underline"
                >
                  fincareti@gmail.com
                </a>
                .
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Termos;
