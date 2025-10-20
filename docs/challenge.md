# Desafio Técnico: Desenvolvimento Full-Stack de Sistema de Monitoramento de Saúde

# Descrição do Desafio

Construir uma aplicação web full-stack para monitorar e exibir dados de saúde, focando na visualização de métricas e notícias relacionadas a surtos de doenças. O objetivo é avaliar a capacidade do(a) candidato(a) em desenvolver interfaces responsivas, construir APIs robustas e integrar-se a fontes de dados externas.

# Pré-requisitos

* **Frontend**: Proficiência em JavaScript/TypeScript e um de seus frameworks modernos (React ou Next.js).  
* **Backend**: Sólida experiência em desenvolvimento backend com Python (Django, Flask ou FastAPI) ou Node.js (Express).  
* **Banco de Dados**: Experiência com bancos de dados relacionais (ex: PostgreSQL, MySQL) e/ou não relacionais (ex: MongoDB, Redis).  
* **Controle de Versão**: Familiaridade com Git.  
* **Design Responsivo**: Conhecimento sólido de HTML5 e CSS, incluindo pré-processadores (SASS/LESS) ou frameworks (Tailwind CSS/Material-UI).

# Atividade Prática

## Contexto

A Ind. HealthCare Inc. está interessada em criar uma solução baseada em dados que possa ajudar profissionais da área da saúde a ter um entendimento em tempo real sobre a severidade e o avanço de surtos de doenças. Para tanto, você foi contratado(a) como Engenheiro(a) Full-Stack Pleno para desenvolver uma prova de conceito (PoC) de uma aplicação web que forneça métricas e notícias sobre a Síndrome Respiratória Aguda Grave (SRAG).

Você pode usar os dados do link [https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024](https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024) para popular um banco de dados. A estrutura desses dados está disponível para consulta em [https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024/resource/3135ac9c-2019-4989-a893-2ed50ebd8e68](https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024/resource/3135ac9c-2019-4989-a893-2ed50ebd8e68).

## Requisitos

A aplicação web deverá apresentar as seguintes funcionalidades:

1. **Dashboard de Métricas:**  
   * Exibir as seguintes métricas de forma clara e visualmente agradável:  
     * Taxa de aumento de casos de SRAG.  
     * Taxa de mortalidade por SRAG.  
     * Taxa de ocupação de UTI.  
     * Taxa de vacinação da população.  
   * Cada métrica deve ser acompanhada de uma breve explicação ou contexto.  
2. **Visualização Gráfica:**  
   * Um gráfico mostrando o número de casos de SRAG, com opções de filtro por período (diário, mensal, anual) e agrupamento por região (estado, cidade). E uma opção para selecionar o tipo de agrupamento: diário ou mensal.  
   * A escolha da biblioteca de gráficos é livre (ex: Chart.js, Recharts, Nivo, etc.).  
3. **Responsividade:**  
   * A aplicação deve ser totalmente responsiva, adaptando-se a diferentes tamanhos de tela (desktop, tablet, mobile) de forma fluida e intuitiva.  
4. **Dados:**  
   * Os dados para as métricas e gráficos podem utilizar das fontes de dados disponíveis em [https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024](https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024) para popular o banco de dados da API.  
   * É importante que o(a) candidato(a) demonstre a capacidade de consumir esses dados a partir do backend e apresentá-los no frontend.  
5. **Realizar deploy da solução**  
   * Efetuar o deploy da aplicação em algum serviço de cloud, como AWS, Azure, Github Pages, Vercel, Heroku, etc…

## Avaliação

A avaliação será baseada nos seguintes critérios:

* **Qualidade do Código:** Organização, legibilidade, uso de boas práticas de desenvolvimento (clean code).  
* **Funcionalidade:** Implementação correta das métricas, gráficos e seção de notícias.  
* **Design e Usabilidade (Responsividade):** A capacidade de criar uma interface de usuário responsiva e intuitiva que funcione bem em diferentes dispositivos.  
* **Arquitetura:** Escolha e aplicação de padrões de design no frontend e backend.  
* **Tratamento de Erros:** Gerenciamento básico de erros na comunicação entre frontend e backend, e com APIs externas.  
* **Controle de Versão:** Histórico de commits claro e uso adequado do Git.

## Entrega Esperada

Um link para um repositório público no GitHub contendo a solução desenvolvida. O repositório deve incluir:

* O código-fonte completo da aplicação frontend e backend.  
* Instruções claras no README.md sobre como configurar e executar o projeto localmente.  
* Seções no README.md explicando as escolhas de arquitetura e design, e como a responsividade foi implementada.

![Uma representação de um repositório GitHub com um README detalhado, simbolizando a entrega de um projeto bem documentado.][image1]

**Lembre-se:** A intenção é avaliar suas habilidades em desenvolvimento full-stack e design responsivo em um cenário realista. Entregue o que conseguir fazer, mesmo que a entrega não esteja 100% completa. Feito é melhor que perfeito\!  


[image1]: ./assets/readme-image.png