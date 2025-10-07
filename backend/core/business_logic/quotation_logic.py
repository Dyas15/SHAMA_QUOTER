
from apps.quotes.models import QuoteRequest, QuoteResult, Proposal, RiskCity, SystemParameter, SpecialCondition
from apps.insurers.models import InsurerBusinessRule, Insurer, MerchandiseType
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
    insurers = Insurer.objects.filter(is_active=True)
    
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
        merchandise_type = MerchandiseType.objects.get(name=quote_request.cargo_type)
        rule = InsurerBusinessRule.objects.get(
            insurer=insurer,
            merchandise_type=merchandise_type,
            is_active=True
        )
        
        # Taxas base das regras de negócio
        rctr_c_rate = rule.rctr_c_rate
        rc_dc_rate = rule.rc_dc_rate
        
        # Aplicar fatores de agravo/desconto baseados no nível de risco da mercadoria
        if merchandise_type.risk_level == 'HIGH':
            rctr_c_rate *= rule.high_risk_multiplier
            rc_dc_rate *= rule.high_risk_multiplier
        elif merchandise_type.risk_level == 'EXTREME':
            rctr_c_rate *= (rule.high_risk_multiplier * Decimal('1.5')) # Exemplo de agravo maior
            rc_dc_rate *= (rule.high_risk_multiplier * Decimal('1.5'))

        # Aplicar desconto por volume, se aplicável
        if quote_request.monthly_revenue >= rule.volume_discount_threshold and rule.volume_discount_threshold > 0:
            rctr_c_rate *= (Decimal('1') - rule.volume_discount_rate / Decimal('100'))
            rc_dc_rate *= (Decimal('1') - rule.volume_discount_rate / Decimal('100'))

        # Calcular limites oferecidos (baseado nos limites solicitados e capacidade da seguradora)
        # Usar os limites máximos da seguradora, se definidos
        rctr_c_limit = min(quote_request.general_lmg, insurer.max_rctr_c_limit)
        rc_dc_limit = min(quote_request.general_lmg, insurer.max_rc_dc_limit)
        
        # Calcular prêmio mensal
        monthly_premium = (quote_request.monthly_revenue * rctr_c_rate / 100) + \
                         (quote_request.monthly_revenue * rc_dc_rate / 100)
        
        # Aplicar prêmio mínimo da seguradora
        if monthly_premium < insurer.minimum_premium:
            monthly_premium = insurer.minimum_premium
        
        # Criar resultado da cotação
        quote_result = QuoteResult(
            quote_request=quote_request,
            insurer=insurer,
            rctr_c_rate=rctr_c_rate,
            rc_dc_rate=rc_dc_rate,
            rctr_c_limit=rctr_c_limit,
            rc_dc_limit=rc_dc_limit,
            premium_value=monthly_premium,
            observations=get_special_conditions(insurer, quote_request, rule)
        )
        
        return quote_result
        
    except (InsurerBusinessRule.DoesNotExist, MerchandiseType.DoesNotExist):
        logger.warning(f"Regra de negócio ou tipo de mercadoria não encontrado para {insurer.name} - {quote_request.cargo_type}")
        return None
    except Exception as e:
        logger.error(f"Erro no cálculo para {insurer.name}: {e}")
        return None

def is_high_risk_route(origin: str, destination: str) -> bool:
    """
    Verifica se a rota é considerada de alto risco (exemplo simplificado)
    """
    high_risk_cities = RiskCity.objects.filter(is_active=True).values_list('name', flat=True)
    
    for city in high_risk_cities:
        if city.lower() in origin.lower() or city.lower() in destination.lower():
            return True
    
    return False

def get_special_conditions(insurer: Insurer, quote_request: QuoteRequest, rule: InsurerBusinessRule) -> str:
    """
    Retorna condições especiais baseadas na seguradora, características da operação e regras de negócio.
    """
    conditions = []
    
    if rule.observations:
        conditions.append(rule.observations)

    if is_high_risk_route(quote_request.origin, quote_request.destination):
        try:
            high_risk_condition = SpecialCondition.objects.get(code='HIGH_RISK_OPERATION', is_active=True)
            conditions.append(high_risk_condition.description)
        except SpecialCondition.DoesNotExist:
            logger.warning("Condição especial 'HIGH_RISK_OPERATION' não encontrada ou inativa.")

    try:
        premium_client_threshold = Decimal(SystemParameter.objects.get(key='PREMIUM_CLIENT_MONTHLY_REVENUE_THRESHOLD').value)
        if quote_request.monthly_revenue > premium_client_threshold:
            try:
                premium_client_condition = SpecialCondition.objects.get(code='PREMIUM_CLIENT_SPECIAL_CONDITIONS', is_active=True)
                conditions.append(premium_client_condition.description)
            except SpecialCondition.DoesNotExist:
                logger.warning("Condição especial 'PREMIUM_CLIENT_SPECIAL_CONDITIONS' não encontrada ou inativa.")
    except SystemParameter.DoesNotExist:
        logger.warning("Parâmetro de sistema 'PREMIUM_CLIENT_MONTHLY_REVENUE_THRESHOLD' não encontrado.")
    except Exception as e:
        logger.error(f"Erro ao obter ou converter parâmetro 'PREMIUM_CLIENT_MONTHLY_REVENUE_THRESHOLD': {e}")
    
    return "; ".join(conditions)


