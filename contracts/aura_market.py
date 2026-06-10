# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AuraMarket(gl.Contract):
    markets: TreeMap[str, str]
    market_count: u256
    resolved_count: u256

    def __init__(self):
        self.market_count = u256(0)
        self.resolved_count = u256(0)

    @gl.public.write
    def create_market(self, market_id: str, question: str, resolution_url: str) -> str:
        market_data = {
            "id": market_id,
            "question": question,
            "resolution_url": resolution_url,
            "status": "OPEN",
            "yes_pool": 0,
            "no_pool": 0,
            "outcome": "PENDING",
            "resolution_reasoning": ""
        }
        self.markets[market_id] = json.dumps(market_data)
        self.market_count += u256(1)
        return "MARKET_CREATED"

    @gl.public.write
    def place_bet(self, market_id: str, prediction: str, amount: str) -> str:
        data_str = self.markets.get(market_id)
        if data_str is None:
            return "MARKET_NOT_FOUND"
        
        market = json.loads(data_str)
        if market["status"] != "OPEN":
            return "MARKET_CLOSED"
            
        if prediction == "YES":
            market["yes_pool"] += int(amount)
        else:
            market["no_pool"] += int(amount)
            
        self.markets[market_id] = json.dumps(market)
        return "BET_PLACED"

    @gl.public.write
    def resolve_market(self, market_id: str) -> str:
        data_str = self.markets.get(market_id)
        if data_str is None:
            return "MARKET_NOT_FOUND"
            
        market = json.loads(data_str)
        if market["status"] != "OPEN":
            return "ALREADY_RESOLVED"
            
        url = market["resolution_url"]
        question = market["question"]
        
        def _fetch_evidence() -> str:
            try:
                response = gl.nondet.web.get(url)
                return response.body.decode("utf-8")[:2000]
            except Exception:
                return "Failed to fetch evidence URL."
            
        evidence = gl.eq_principle.strict_eq(_fetch_evidence)
        
        prompt = f"""
        You are a highly accurate AI Truth Oracle for a prediction market.
        QUESTION TO RESOLVE: "{question}"
        
        EVIDENCE SOURCED FROM WEB:
        {evidence}
        
        Based solely on the evidence provided, has this event occurred or is the statement definitively true?
        Output EXACTLY one of these three words: YES, NO, or UNDECIDED.
        """
        
        def _analyze() -> str:
            return gl.nondet.exec_prompt(prompt)
            
        verdict_raw = gl.eq_principle.prompt_comparative(
            _analyze,
            principle="Both analyses must reach the exact same conclusion: YES, NO, or UNDECIDED."
        )
        
        clean_verdict = verdict_raw.strip().upper()
        if "YES" in clean_verdict:
            outcome = "YES"
        elif "NO" in clean_verdict:
            outcome = "NO"
        else:
            outcome = "UNDECIDED"
            
        market["status"] = "RESOLVED"
        market["outcome"] = outcome
        market["resolution_reasoning"] = f"AI Oracle reached consensus: {outcome} based on web evidence."
        
        self.markets[market_id] = json.dumps(market)
        self.resolved_count += u256(1)
        
        return outcome

    @gl.public.view
    def get_market(self, market_id: str) -> str:
        data_str = self.markets.get(market_id)
        if data_str is None:
            return "NOT_FOUND"
        return data_str
