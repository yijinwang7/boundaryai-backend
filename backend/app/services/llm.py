import os, random
from typing import Dict, Any

def _mock_survey(desc: str) -> Dict[str, Any]:
    random.seed(hash(desc) % (2**32))
    return {
        "title": f"{desc.title()} Survey",
        "questions": [
            {"type": "multiple_choice", "text": "How satisfied are you overall?",
             "choices": ["Very satisfied","Satisfied","Neutral","Dissatisfied","Very dissatisfied"]},
            {"type": "rating", "text": "Rate your recent experience (1-5)"},
            {"type": "open_text", "text": "What can we improve the most?"}
        ],
    }

def generate_survey(description: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _mock_survey(description)


    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = f"Create a brief survey JSON for: {description}. Fields: title, questions[type,text,choices?]."
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        import json
        return json.loads(resp.choices[0].message.content)
    except Exception:
        # never break the flow
        return _mock_survey(description)
