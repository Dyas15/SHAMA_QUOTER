from apps.quotes.models import QuoteRequest, QuoteResult, Proposal
from apps.insurers.models import InsurerBusinessRule, Insurer
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def calculate_premium(quote_request: QuoteRequest) -> list:
    """
    Lógica de negócio pura para calcular o prêmio do seguro para múltiplas seguradoras.
    Retorna uma lista de QuoteResult para comparação.
    """
    results = []
    
    # Buscar todas as seguradoras ativas
    insurers = Insurer.objects.all()
    
    for insurer in insurers:
        try:
            result = calculate_premium_for_insurer(quote_request, insurer)
            if result:
                results.append(result)
        except Exception as e:
            logger.error(f"Erro ao calcular prêmio para {insurer.name}: {e}")
            continue
    
    return results

def calculate_premium_for_insurer(quote_request: QuoteRequest, insurer: Insurer) -> QuoteResult:
    """
    Calcula o prêmio para uma seguradora específica
    """
    try:
        # Buscar regras de negócio para esta seguradora e tipo de mercadoria
        rule = InsurerBusinessRule.objects.get(
            insurer=insurer,
            merchandise_type__name=quote_request.cargo_type
        )
        
        # Taxas base
        rctr_c_rate = rule.rctr_c_rate if hasattr(rule, 'rctr_c_rate') else rule.rate
        rc_dc_rate = rule.rc_dc_rate if hasattr(rule, 'rc_dc_rate') else rule.rate * Decimal('0.5')
        
        # Aplicar fatores de agravo/desconto baseados na rota
        if is_high_risk_route(quote_request.origin, quote_request.destination):
            rctr_c_rate *= Decimal('1.2')  # 20% de agravo
            rc_dc_rate *= Decimal('1.3')   # 30% de agravo
        
        # Calcular limites oferecidos (baseado nos limites solicitados e capacidade da seguradora)
        rctr_c_limit = min(quote_request.general_lmg, get_max_limit_for_insurer(insurer, 'RCTR-C'))
        rc_dc_limit = min(quote_request.general_lmg, get_max_limit_for_insurer(insurer, 'RC-DC'))
        
        # Calcular prêmio mensal
        monthly_premium = (quote_request.monthly_revenue * rctr_c_rate / 100) + \
                         (quote_request.monthly_revenue * rc_dc_rate / 100)
        
        # Aplicar prêmio mínimo se necessário
        minimum_premium = get_minimum_premium_for_insurer(insurer)
        if monthly_premium < minimum_premium:
            monthly_premium = minimum_premium
        
        # Criar resultado da cotação
        quote_result = QuoteResult(
            quote_request=quote_request,
            insurer=insurer,
            rctr_c_rate=rctr_c_rate,
            rc_dc_rate=rc_dc_rate,
            rctr_c_limit=rctr_c_limit,
            rc_dc_limit=rc_dc_limit,
            premium_value=monthly_premium,
            observations=get_special_conditions(insurer, quote_request)
        )
        
        return quote_result
        
    except InsurerBusinessRule.DoesNotExist:
        logger.warning(f"Regra de negócio não encontrada para {insurer.name} - {quote_request.cargo_type}")
        return None
    except Exception as e:
        logger.error(f"Erro no cálculo para {insurer.name}: {e}")
        return None

def is_high_risk_route(origin: str, destination: str) -> bool:
    """
    Verifica se a rota é considerada de alto risco
    """
    high_risk_cities = ['Rio de Janeiro', 'RJ', 'São Paulo', 'SP']
    
    for city in high_risk_cities:
        if city.lower() in origin.lower() or city.lower() in destination.lower():
            return True
    
    return False

def get_max_limit_for_insurer(insurer: Insurer, coverage_type: str) -> Decimal:
    """
    Retorna o limite máximo que a seguradora oferece para o tipo de cobertura
    """
    # Valores padrão - em um sistema real, isso viria do banco de dados
    limits = {
        'Shamah': {'RCTR-C': Decimal('500000'), 'RC-DC': Decimal('300000')},
        'Tokio': {'RCTR-C': Decimal('1000000'), 'RC-DC': Decimal('500000')},
    }
    
    return limits.get(insurer.name, {}).get(coverage_type, Decimal('200000'))

def get_minimum_premium_for_insurer(insurer: Insurer) -> Decimal:
    """
    Retorna o prêmio mínimo da seguradora
    """
    # Valores padrão - em um sistema real, isso viria do banco de dados
    minimums = {
        'Shamah': Decimal('150.00'),
        'Tokio': Decimal('200.00'),
    }
    
    return minimums.get(insurer.name, Decimal('100.00'))

def get_special_conditions(insurer: Insurer, quote_request: QuoteRequest) -> str:
    """
    Retorna condições especiais baseadas na seguradora e características da operação
    """
    conditions = []
    
    if insurer.name == 'Shamah':
        conditions.append("Cobertura 24h para emergências")
        conditions.append("Desconto de 5% para renovação")
    
    if is_high_risk_route(quote_request.origin, quote_request.destination):
        conditions.append("Operação de alto risco - franquia diferenciada")
    
    if quote_request.monthly_revenue > Decimal('1000000'):
        conditions.append("Cliente premium - condições especiais disponíveis")
    
    return "; ".join(conditions)

