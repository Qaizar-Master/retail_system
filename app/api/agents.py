import re
from typing import List, Dict, Any
from .models import Message, Product
from .services import db
from thefuzz import process, fuzz

class Agent:
    def __init__(self, name: str):
        self.name = name

    async def process(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class RecommendationAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        products = await db.get_products()
        input_lower = input_text.lower()
        print(f"DEBUG_TRACE: Start Process. Input='{input_text}' Context={context}", flush=True)
        
        # 0. Gender Context Management
        gender_filter = context.get("gender_filter")
        
        # Check if user is answering the clarification question
        # Use regex for whole word match
        if re.search(r"\b(men|man|male|for men)\b", input_lower):
            gender_filter = "Men"
            context["gender_filter"] = "Men"
        elif re.search(r"\b(women|woman|female|for women)\b", input_lower):
            gender_filter = "Women"
            context["gender_filter"] = "Women"
            
        print(f"DEBUG_TRACE: After Gender Check. GenderFilter='{gender_filter}'")
            
        # Check for broad intent necessitating clarification
        broad_terms = ["casual wear", "casual", "clothes", "outfit", "wear"]
        is_broad = any(term in input_lower for term in broad_terms)
        
        if is_broad and not gender_filter:
             # Check if specific gender is already in query (e.g., "casual wear for men")
             # Use regex for whole word match to avoid matching "recommend" -> "men"
             is_men = re.search(r"\b(men|man|male|for men)\b", input_lower)
             is_women = re.search(r"\b(women|woman|female|for women)\b", input_lower)
             
             if is_men:
                 gender_filter = "Men"
                 context["gender_filter"] = "Men"
             elif is_women:
                 gender_filter = "Women"
                 context["gender_filter"] = "Women"
             else:
                 # Store the original broad query to use it after gender is selected
                 context["pending_query"] = input_text
                 return {
                     "content": "To help you better, who are you shopping for?",
                     "options": ["Men", "Women"]
                 }
        
        # Filter products by gender if set (and if product has gender attribute)
        if gender_filter:
            # We match "Unisex" for everyone, plus the specific gender
            products = [p for p in products if not p.gender or p.gender == "Unisex" or p.gender == gender_filter]
        
        # Determine the text to search with
        # If we just resolved a gender from a pending query, use the original query
        search_text = input_text
        if context.get("pending_query"):
             # Only use pending query if the current input was just a gender selection
             # (Simple heuristic: if we just set gender_filter in this turn)
             # Actually, simpler: if pending_query exists and we have a gender filter now, use pending.
             if gender_filter:
                 search_text = context.pop("pending_query")
                 input_lower = search_text.lower()
        
        print(f"DEBUG_TRACE: SearchText='{search_text}' PendingQueryRestored={bool(context.get('pending_query') is None)}")
        
        # Determine if this is a broad search (re-check search_text)
        broad_terms = ["casual wear", "casual", "clothes", "outfit", "wear", "shoes", "footwear", "sneakers"]
        is_broad_search = any(term in search_text.lower() for term in broad_terms)
        print(f"DEBUG: search_text='{search_text}', is_broad={is_broad_search}, gender={gender_filter}")

        # 1. Fuzzy match product names

        # 1. Fuzzy match product names
        product_names = [p.name for p in products]
        # 1. Fuzzy match Name
        # Logic: WRatio is best overall, but "runing shos" scored 57. 
        # We lower threshold to 55, but prioritize high scores > 70.
        best_name_match = process.extractOne(search_text, product_names, scorer=fuzz.WRatio)
        
        matches = []
        # FAILSAFE: If broad search, DO NOT accept a single fuzzy match on name. 
        # We want multiple items via keyword/category logic.
        if best_name_match and not is_broad_search:
            score = best_name_match[1]
            # High confidence match
            if score > 70:
                matches = [p for p in products if p.name == best_name_match[0]]
            # Moderate confidence (typos), confirm with partial_ratio to be safe
            elif score > 55:
                # Secondary check: does it have strong partial overlap?
                part_score = fuzz.partial_ratio(search_text, best_name_match[0])
                if part_score > 60:
                     matches = [p for p in products if p.name == best_name_match[0]]
            
        # 2. Fuzzy match Category if no name match
        if not matches:
            categories = list(set([p.category for p in products])) # e.g. ["Footwear", "Apparel"]
            # Map common terms
            category_map = {"shoes": "Footwear", "sneakers": "Footwear", "clothing": "Apparel", "phone": "Electronics"}
            
            # Check for mapped terms in input with fuzzy match
            for term, cat in category_map.items():
                if fuzz.partial_ratio(term, input_lower) > 80:
                     matches.extend([p for p in products if p.category == cat])
            
            # Direct category match
            if not matches:
                best_cat_match = process.extractOne(search_text, categories, scorer=fuzz.WRatio)
                if best_cat_match and best_cat_match[1] > 60:
                     matches = [p for p in products if p.category == best_cat_match[0]]
        
        # 2. Keyword fallback (category/description)
        if not matches:
            for p in products:
                # Basic synonyms mapping (expand as needed)
                keywords = [p.name.lower(), p.category.lower()]
                if "shoes" in keywords or "footwear" in keywords:
                    keywords.extend(["sneakers", "running", "kicks"])
                if "apparel" in keywords:
                    keywords.extend(["clothing", "wear", "dress", "shirt", "jeans", "casual"])
                
                # Check if any keyword appears in input
                if any(k in input_lower for k in keywords):
                    matches.append(p)
                    
        # 3. Filter by logic (e.g., price "under 50")
        price_match = re.search(r"under\s?\$?(\d+)", input_lower)
        if price_match:
            limit = float(price_match.group(1))
            matches = [p for p in matches if p.price <= limit]

        if not matches:
             # Fallback to general recommendation if valid category implied
             if "shoes" in input_lower:
                matches = [p for p in products if "Footwear" in p.category]
             elif "phone" in input_lower:
                matches = [p for p in products if "Electronics" in p.category]
             # NEW: Fallback if we have a gender filter but no specific matches -> Show top gender items
             elif gender_filter:
                print(f"DEBUG_TRACE: Hitting Gender Fallback. ProductsAvailable={len(products)}", flush=True)
                matches = products # Return all valid products for this gender
                
                # Refinement: If we have a pending query, try to filter the fallback list
                # This prevents "casual wear" -> "Electronics"
                fallback_query = context.get("pending_query", "").lower()
                if fallback_query:
                     print(f"DEBUG_TRACE: Filtering Fallback with '{fallback_query}'", flush=True)
                     # Simple keyword check first
                     filtered = []
                     for p in matches:
                         # Mapping for safety
                         searchable_text = (p.name + " " + p.category).lower()
                         if "apparel" in searchable_text: searchable_text += " casual wear clothing"
                         if "footwear" in searchable_text: searchable_text += " shoes sneakers"
                         
                         # Check if any broad term from query is in product text
                         query_terms = fallback_query.split()
                         if any(term in searchable_text for term in query_terms if len(term) > 3):
                             filtered.append(p)
                     
                     if filtered:
                         print(f"DEBUG_TRACE: Fallback filtered from {len(matches)} to {len(filtered)} items", flush=True)
                         matches = filtered
                     else:
                         print("DEBUG_TRACE: Fallback filtering yielded 0 items, keeping original list", flush=True)

             else:
                print("DEBUG_TRACE: No matches and no fallback. Returning help message.", flush=True)
                return {"content": "I can help you find products. Try asking for 'running shoes' or 'red dress'."}

        if not matches:
             return {"content": "I couldn't find any specific products matching that description."}

        # Update context with the first found product for follow-up
        context["last_product_id"] = matches[0].id
        context["last_product_name"] = matches[0].name
        
        response = "Here are some top picks:"
        # Add context about gender if applicable
        if gender_filter:
            response = f"Here are some top picks for {gender_filter}:"

        product_data = []
        product_data = []
        for p in matches[:10]:
            product_data.append(p.dict())
            response += f"\n- {p.name} (INR {p.price})"
        
        print(f"DEBUG: Returning {len(product_data)} matches", flush=True)
            
        return {
            "content": response,
            "products": product_data
        }

class InventoryAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        products = await db.get_products()
        
        # Try to find product from context first if "it" or "that" is used
        target_product = None
        input_lower = input_text.lower()
        
        if ("it" in input_lower or "that" in input_lower or "this" in input_lower) and context.get("last_product_id"):
            pid = context.get("last_product_id")
            target_product = next((p for p in products if p.id == pid), None)
            
        if not target_product:
            # Fuzzy match from input
            product_names = [p.name for p in products]
            best_match = process.extractOne(input_text, product_names, scorer=fuzz.partial_ratio)
            if best_match and best_match[1] > 65:
                 target_product = next((p for p in products if p.name == best_match[0]), None)

        if not target_product:
            return {"content": "Which product would you like to check inventory for?"}
            
        # Update context
        context["last_product_id"] = target_product.id
        context["last_product_name"] = target_product.name
        
        stock = await db.check_inventory(target_product.sku)
        total_stock = sum(stock.values())
        
        if total_stock > 0:
            details = ", ".join([f"{k}: {v}" for k,v in stock.items()])
            return {"content": f"We have {total_stock} '{target_product.name}' in stock. ({details})"}
        else:
            return {"content": f"Sorry, '{target_product.name}' is currently out of stock."}

class PaymentAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        input_lower = input_text.lower()
        
        # Check if buying a specific context item
        product_name = context.get("last_product_name", "item")
        
        if "buy" in input_lower or "pay" in input_lower or "checkout" in input_lower:
             # NEW: Process explicit product mention in the buy command
             # This fixes the issue where clicking a product sends "I want to buy X" but the agent ignores X
             # and uses the stale product from the last search context.
             
             products = await db.get_products()
             product_names = [p.name for p in products]
             
             # Use token_set_ratio to handle "I want to buy [Product Name]"
             # This is safer than partial_ratio for short words like "it" matching inside "White"
             best_match = process.extractOne(input_text, product_names, scorer=fuzz.token_set_ratio)
             
             if best_match and best_match[1] > 80:
                 # Check if the match is better than a generic fallback
                 target_name = best_match[0]
                 matched_product = next((p for p in products if p.name == target_name), None)
                 
                 # Only update if we found a valid product and the score is high
                 if matched_product:
                     print(f"DEBUG: PaymentAgent found explicit product '{target_name}' in input (score={best_match[1]})")
                     context["last_product_id"] = matched_product.id
                     context["last_product_name"] = matched_product.name

             # Fetch product details if available in context
             product_context = None
             if context.get("last_product_id"):
                 # products already fetched above
                 pid = context.get("last_product_id")
                 product = next((p for p in products if p.id == pid), None)
                 if product:
                     product_context = product.dict()

             return {
                 "content": "Please select a payment method:",
                 "options": ["UPI", "Card"],
                 "product_context": product_context
             }
             
        if "yes" in input_lower and context.get("last_agent") == "PaymentAgent":
             try:
                # In real app, items would come from a cart
                items = []
                if context.get("last_product_id"):
                     items.append({"sku": "UNKNOWN", "quantity": 1}) # Needs SKU lookup in real app
                     
                order_id = await db.create_order("user-123", items, 99.99)
                return {"content": f"Payment successful! Your order ({order_id}) for {product_name} has been placed."}
             except Exception as e:
                return {"content": f"Payment failed: {str(e)}"}
        
        return {"content": "I can assist with payments. Do you want to checkout?"}

class FulfillmentAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        input_lower = input_text.lower()
        
        # Check for Order ID pattern (ORD-XXXXXXXXX)
        order_match = re.search(r"(ord-[a-zA-Z0-9]+)", input_lower)
        
        if order_match:
            order_id = order_match.group(1).upper()
            return {"content": f"Tracking for {order_id}: Your order is currently 'In Transit' and is expected to arrive within 2 days."}
        
        # If no ID found but user wants to track
        if "track" in input_lower or "where" in input_lower or "status" in input_lower:
            return {"content": "I can help you track your order. Please provide your Order ID (e.g., ORD-X1Y2Z3)."}
            
        return {"content": "Your order will be shipped to your registered address. Standard delivery is 3-5 business days."}

class SalesAgent(Agent):
    def __init__(self):
        super().__init__("SalesAgent")
        self.workers = {
            "recommendation": RecommendationAgent("RecommendationAgent"),
            "inventory": InventoryAgent("InventoryAgent"),
            "payment": PaymentAgent("PaymentAgent"),
            "fulfillment": FulfillmentAgent("FulfillmentAgent"),
        }

    def route(self, input_text: str, context: Dict[str, Any]) -> Agent:
        text = input_text.lower()
        
        # Priority 1: Explicit Intent
        if "stock" in text or "available" in text or "how many" in text:
            return self.workers["inventory"]
        elif "buy" in text or "pay" in text or "checkout" in text:
            return self.workers["payment"]
        elif "ship" in text or "deliver" in text or "track" in text:
            return self.workers["fulfillment"]
            
        # Priority 2: Contextual Intent (Ambiguous inputs like "yes", "how much is it")
        last_agent = context.get("last_agent")
        
        if last_agent == "PaymentAgent" and ("yes" in text or "no" in text):
            return self.workers["payment"]
            
        if ("it" in text or "that" in text) and context.get("last_product_id"):
            # "Is it in stock?" -> Inventory
            if "stock" in text: return self.workers["inventory"]
            # "Buy it" -> Payment
            if "buy" in text: return self.workers["payment"]
        
        # Default to recommendation for queries
        return self.workers["recommendation"]

    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        worker = self.route(input_text, context)
        context["last_agent"] = worker.name
        
        response_dict = await worker.process(input_text, context)
        # Ensure it's a dict (in case a worker was missed, though we updated all)
        if isinstance(response_dict, str):
            response_dict = {"content": response_dict}
            
        response_dict["agent_name"] = worker.name
        
        # Optional: prepend agent name if desired, but user wanted clean output.
        # We can stick it in front if it's just content
        # response_dict["content"] = f"[{worker.name}]: {response_dict['content']}" # User doesn't want this
        
        return response_dict
