# Shamah Enterprise Quoter

Plataforma web multi-tenant para cotação e gestão de seguros de carga. Este projeto visa transformar a plataforma existente em uma ferramenta de classe mundial, abordando débitos técnicos, implementando novas funcionalidades e garantindo robustez, escalabilidade e segurança.

## 1. Visão Geral do Projeto

O **Shamah Enterprise Quoter** é uma plataforma web multi-tenant projetada para corretoras e empresas gerenciarem suas cotações de seguro de carga de forma isolada e segura. A plataforma busca otimizar o processo de cotação, aprovação e gestão de seguros, garantindo a integridade dos dados e a conformidade com as melhores práticas do mercado.

## 2. Arquitetura e Tecnologias

O projeto adota uma arquitetura hexagonal (Ports and Adapters), com uma clara separação entre o backend e o frontend. A segurança é baseada no princípio Zero Trust com Controle de Acesso Baseado em Papéis (RBAC). Operações assíncronas são gerenciadas via Celery e Redis para garantir performance e escalabilidade. A observabilidade é garantida por logging estruturado e health checks.

**Backend:**
*   **Framework:** Django (Python)
*   **API:** Django REST Framework
*   **Banco de Dados:** PostgreSQL (via Docker)
*   **Tarefas Assíncronas:** Celery com Redis
*   **Conteinerização:** Docker

**Frontend:**
*   **Framework:** React (JavaScript/TypeScript)
*   **Gerenciamento de Pacotes:** pnpm
*   **Build Tool:** Vite

## 3. Estrutura do Projeto

```
/shamah-enterprise-quoter
|-- .gitignore
|-- .pre-commit-config.yaml
|-- docker-compose.yml
|-- README.md
|-- /backend
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- manage.py
|   |-- /config
|   |   |-- settings/ (base.py, development.py, production.py)
|   |   |-- urls.py
|   |   |-- celery.py
|   |-- /apps
|   |   |-- /users (Gestão de usuários e permissões)
|   |   |-- /quotes (Cotações, propostas, itens, parâmetros de sistema)
|   |   |-- /insurers (Seguradoras e regras de negócio)
|   |   |-- /audits (Logs de auditoria)
|   |   |-- /tasks (Tarefas assíncronas de PDF e e-mail)
|   |-- /core
|   |   |-- /business_logic/ (Lógica de negócio central)
|   |-- /templates/ (Templates de e-mail)
|-- /frontend
|   |-- shamah-frontend/ (Aplicação React)
```

## 4. Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
*   **Docker** e **Docker Compose**: Para conteinerização e orquestração dos serviços.
*   **Python 3.11+** e **pip**: Para gerenciamento de dependências do backend.
*   **Node.js 20+** e **pnpm**: Para gerenciamento de dependências do frontend.

### Passos para Configuração

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd shamah-enterprise-quoter
    ```

2.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do diretório `/backend` com as seguintes variáveis (exemplo):
    ```env
    SECRET_KEY=sua_secret_key_aqui
    DEBUG=True
    DB_NAME=shamah_db
    DB_USER=shamah_user
    DB_PASSWORD=shamah_password
    DB_HOST=db
    DB_PORT=5432
    REDIS_HOST=redis
    REDIS_PORT=6379
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_HOST_USER=seu_email@example.com
    EMAIL_HOST_PASSWORD=sua_senha_de_email
    DEFAULT_FROM_EMAIL=noreply@shamah.com
    ```

3.  **Suba os serviços com Docker Compose:**
    ```bash
    docker-compose up --build -d
    ```
    Isso irá construir as imagens Docker, criar os contêineres para o backend (Django), frontend (React), banco de dados (PostgreSQL) e Redis, e iniciá-los em segundo plano.

4.  **Aplicar Migrações do Banco de Dados (Backend):**
    Acesse o contêiner do backend e aplique as migrações:
    ```bash
    docker-compose exec backend python manage.py makemigrations
    docker-compose exec backend python manage.py migrate
    ```

5.  **Popular Dados Iniciais (Opcional, Backend):**
    Para popular os parâmetros de sistema, cidades de risco e condições especiais:
    ```bash
    docker-compose exec backend python manage.py populate_initial_data
    ```

6.  **Criar Superusuário (Backend):**
    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```
    Siga as instruções para criar um usuário administrador.

7.  **Instalar Dependências do Frontend:**
    Acesse o diretório do frontend e instale as dependências:
    ```bash
    cd frontend/shamah-frontend
    pnpm install
    ```

## 5. Como Executar o Projeto Localmente

Após a configuração inicial, os serviços já estarão rodando em segundo plano. Você pode acessá-los em:

*   **Backend (Django REST Framework):** `http://localhost:8000`
*   **Frontend (React):** `http://localhost:5173`

Para parar os serviços:
```bash
docker-compose down
```

## 6. Qualidade de Código

Este projeto utiliza `pre-commit` para garantir a padronização do código. Certifique-se de instalá-lo e configurá-lo no ambiente de desenvolvimento local (fora do Docker):

```bash
pip install pre-commit
pre-commit install
```
Isso garantirá que `black` (formatador) e `flake8` (linter) sejam executados automaticamente antes de cada commit.

## 7. Testes

Testes unitários e de integração são essenciais para a qualidade do projeto. Utilize `pytest` para executar os testes do backend:

```bash
docker-compose exec backend pytest
```

## 8. Observabilidade

Logs estruturados (JSON) são gerados para facilitar a integração com ferramentas de monitoramento. Um endpoint de health check está disponível em `/api/health/`.

## 9. Documentação da API

A documentação da API será gerada automaticamente pelo Django REST Framework. Acesse `http://localhost:8000/swagger/` ou `http://localhost:8000/redoc/` (se configurado) para visualizar os endpoints disponíveis e seus esquemas.

## 10. Changelog das Melhorias Implementadas

Esta seção detalha as principais alterações e melhorias realizadas na plataforma:

### 10.1. Refatoração de Variáveis Estáticas (Hardcoded)
*   **Problema Abordado:** Regras de negócio e parâmetros fixos no código, como cidades de alto risco e limites de faturamento.
*   **Solução:** Introdução de novos modelos de banco de dados (`SystemParameter`, `RiskCity`, `SpecialCondition`) para armazenar esses valores dinamicamente. O código em `quotation_logic.py` foi atualizado para buscar essas configurações do banco de dados. Um comando de gerenciamento (`populate_initial_data`) foi criado para facilitar a inicialização desses parâmetros.

### 10.2. Correção do Fluxo de Aprovação de Cotação
*   **Problema Abordado:** Processo de aprovação de cotação inconsistente e sem rastreabilidade.
*   **Solução:** O método `approve` no `ProposalViewSet` foi refatorado para garantir atomicidade usando `transaction.atomic()`. Adicionado registro de auditoria (`AuditLog`) para cada aprovação, capturando o usuário e a ação. O status da proposta é atualizado para `PROCESSING` e as tarefas de geração de PDF e envio de e-mail são enfileiradas via Celery.

### 10.3. Implementação do Módulo de Geração de PDF e Notificação por E-mail
*   **Problema Abordado:** Ausência de documento formal e notificação ao cliente após a aprovação.
*   **Solução:** A tarefa `generate_pdf_task` (Celery) foi aprimorada para gerar um PDF detalhado da proposta aprovada. Uma nova tarefa `send_approval_email_task` foi criada para enviar este PDF como anexo para o cliente, utilizando um template HTML (`proposal_approved.html`) para o corpo do e-mail. As credenciais de e-mail são carregadas de variáveis de ambiente.

### 10.4. Implementação da Funcionalidade de Edição de Cotação
*   **Problema Abordado:** Impossibilidade de alterar uma cotação após a criação.
*   **Solução:** Implementado um sistema de versionamento para `QuoteRequest`. Ao editar uma cotação, uma nova versão é criada, mantendo um histórico das versões anteriores. A versão antiga é marcada como não-atual (`is_current_version=False`), e a nova versão é vinculada à anterior e inicia com status `PENDING`. Cotações `APPROVED` não podem ser editadas diretamente, exigindo a criação de uma nova versão.

### 10.5. Implementação de Importação de Dados via CSV
*   **Problema Abordado:** Preenchimento manual e demorado de cotações com muitos itens.
*   **Solução:** Adicionado o modelo `QuoteItem` para representar itens individuais de uma cotação. No `QuoteRequestViewSet`, foram criados dois novos endpoints:
    *   `import_items_from_csv`: Permite o upload de um arquivo CSV para adicionar múltiplos itens a uma cotação, com validação de formato e dados.
    *   `download_csv_template`: Oferece um modelo de CSV para download, facilitando o preenchimento correto pelo usuário.

## 11. Sugestões de Melhorias Futuras

### 11.1. Análise da Arquitetura
*   **Lógica de Negócio Centralizada:** Refatorar a lógica de cálculo de prêmio para um padrão *Strategy*, isolando regras por seguradora para facilitar manutenção e expansão.
*   **Implementação de Multi-Tenancy:** Reforçar o isolamento de dados entre tenants com um modelo `Tenant` dedicado e filtragem rigorosa em todas as queries. Considerar `django-tenants` para isolamento a nível de schema.
*   **Gerenciamento de Configurações:** Garantir que todas as credenciais sensíveis sejam carregadas exclusivamente de variáveis de ambiente.
*   **Tarefas Assíncronas (Celery):** Implementar monitoramento robusto (ex: Flower) e políticas de *retries* para tarefas Celery.

### 11.2. Análise do Banco de Dados
*   **Normalização de Dados:** Criar um modelo `Client` separado para centralizar dados de clientes e evitar duplicação em `QuoteRequest`.
*   **Indexação de Campos:** Realizar análise de performance para identificar e criar índices compostos ou em campos que se tornem gargalos.
*   **Integridade dos Dados:** Expandir o uso de transações atômicas para todas as operações críticas que envolvam múltiplas escritas.

### 11.3. Melhorias de Negócio
*   **Módulo de Gestão de Apólices:** Desenvolver um módulo para gerenciar o ciclo de vida das apólices (ativa, vencida, cancelada), incluindo renovações e endossos.
*   **Módulo de Gestão de Sinistros:** Criar um módulo para registrar e acompanhar sinistros, desde a notificação até a liquidação, essencial para a gestão completa do seguro.
*   **Dashboard de Métricas (Analytics):** Implementar um painel de controle com métricas chave (cotações vs. apólices, prêmio total, sinistralidade, etc.) para inteligência de negócio.
*   **Integração com APIs de Seguradoras:** Conectar a plataforma diretamente às APIs das seguradoras para cotações em tempo real, aumentando a competitividade e precisão.

