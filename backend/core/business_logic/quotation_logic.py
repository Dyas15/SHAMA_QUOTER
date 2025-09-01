
from apps.quotes.models import QuoteRequest, QuoteResult, Proposal
from apps.insurers.models import InsurerBusinessRule

def calculate_premium(quote_request: QuoteRequest) -> float:
    """
    Lógica de negócio pura para calcular o prêmio do seguro.
    Esta função deve ser agnóstica a frameworks e conter apenas a lógica de cálculo.
    """
    # Exemplo de lógica de cálculo (simplificada)
    # Em um cenário real, isso envolveria regras de negócio complexas
    # baseadas em tipo de mercadoria, valor, origem, destino, histórico, etc.

    total_premium = 0.0

    # Buscar regras de negócio aplicáveis
    try:
        rule = InsurerBusinessRule.objects.get(
            merchandise_type__name=quote_request.cargo_type
        )
        total_premium = float(quote_request.cargo_value) * float(rule.rate)
    except InsurerBusinessRule.DoesNotExist:
        # Lidar com a ausência de regras, talvez aplicar uma taxa padrão ou levantar um erro
        total_premium = float(quote_request.cargo_value) * 0.01 # Taxa padrão de 1%

    return total_premium



