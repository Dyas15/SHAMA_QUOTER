
# Shamah Enterprise Quoter

Plataforma web multi-tenant para cotação e gestão de seguros de carga.

## Arquitetura

Este projeto segue uma arquitetura hexagonal (Ports and Adapters), com o Django atuando como um adaptador para a lógica de negócio central. A segurança é baseada no princípio Zero Trust com Controle de Acesso Baseado em Papéis (RBAC). Operações assíncronas são gerenciadas via Celery e Redis para garantir performance e escalabilidade. A observabilidade é garantida por logging estruturado e health checks.

## Estrutura do Projeto

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
|   |   |-- __init__.py
|   |   |-- asgi.py
|   |   |-- settings/
|   |   |   |-- __init__.py
|   |   |   |-- base.py
|   |   |   |-- development.py
|   |   |   |-- production.py
|   |   |-- urls.py
|   |   |-- wsgi.py
|   |   |-- celery.py
|   |-- /apps
|   |   |-- /users
|   |   |-- /quotes
|   |   |-- /insurers
|   |   |-- /audits
|   |   |-- /tasks
|   |   |   |-- __init__.py
|   |   |   |-- pdf_tasks.py
|   |   |   |-- email_tasks.py
|   |-- /core
|   |   |-- /business_logic/
|   |   |   |-- quotation_logic.py
|-- /frontend
|   |-- (Estrutura frontend com React/TypeScript)
```

## Como Rodar o Projeto

1.  **Pré-requisitos:** Docker e Docker Compose instalados.
2.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd shamah-enterprise-quoter
    ```
3.  **Suba os serviços:**
    ```bash
    docker-compose up --build
    ```
4.  **Acesse:**
    *   Backend (Django): `http://localhost:8000`
    *   Frontend (React): `http://localhost:5173`

## Qualidade de Código

Este projeto utiliza `pre-commit` para garantir a padronização do código. Certifique-se de instalá-lo:

```bash
pip install pre-commit
pre-commit install
```

Isso garantirá que `black` (formatador) e `flake8` (linter) sejam executados automaticamente antes de cada commit.

## Testes

Testes unitários e de integração são essenciais para a qualidade do projeto. Utilize `pytest` para executar os testes do backend.

## Observabilidade

Logs estruturados (JSON) são gerados para facilitar a integração com ferramentas de monitoramento. Um endpoint de health check está disponível em `/api/health/`.

