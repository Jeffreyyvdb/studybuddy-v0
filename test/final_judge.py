# %%
import json
from collections import defaultdict


def extract_json_blocks(text):
    json_blocks = []
    brace_stack = []
    current_block = ""

    for char in text:
        if char == "{":
            brace_stack.append("{")
        if brace_stack:
            current_block += char
        if char == "}":
            if brace_stack:
                brace_stack.pop()
                if not brace_stack:
                    json_blocks.append(current_block.strip())
                    current_block = ""

    return json_blocks


def aggregate_response_correctness(text):
    results = defaultdict(lambda: {"true": 0, "false": 0})
    json_blocks = extract_json_blocks(text)

    for block in json_blocks:
        try:
            data = json.loads(block)
            subcategory = data.get("subcategory", "")
            correctness = data.get("previousResponseCorrect")
            if correctness is not None:
                correctness_str = str(correctness).lower()
                if correctness_str in results[subcategory]:
                    results[subcategory][correctness_str] += 1
        except json.JSONDecodeError:
            continue  # Skip invalid JSON blocks

    return results


# Process the chat history
if chat_history:
    aggregated_results = aggregate_response_correctness(chat_history)
    print("Aggregated Results:")
    for subcat, counts in aggregated_results.items():
        print(
            f"Subcategory: {subcat or '[None]'}, True: {counts['true']}, False: {counts['false']}"
        )
