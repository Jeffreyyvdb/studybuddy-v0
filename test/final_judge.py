# %%
import json
from collections import defaultdict


# Step 1: Read the file
def read_text_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


# Step 2: Extract JSON blocks
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


# Step 3: Aggregate correctness + difficulty + progress
def aggregate_detailed_response_data(text):
    results = defaultdict(
        lambda: {
            "true": {"count": 0, "total_difficulty": 0},
            "false": {"count": 0, "total_difficulty": 0},
            "progress": [],
        }
    )

    json_blocks = extract_json_blocks(text)

    for block in json_blocks:
        try:
            data = json.loads(block)
            subcat = data.get("subcategory", "") or "[None]"
            correct = data.get("previousResponseCorrect")
            difficulty = data.get("difficulty")

            if correct is not None and difficulty is not None:
                correct_str = str(correct).lower()
                results[subcat][correct_str]["count"] += 1
                results[subcat][correct_str]["total_difficulty"] += difficulty

                results[subcat]["progress"].append(
                    {"difficulty": difficulty, "correct": correct}
                )

        except json.JSONDecodeError:
            continue

    # Post-process to calculate average difficulty
    for subcat, stats in results.items():
        for status in ["true", "false"]:
            count = stats[status]["count"]
            total_diff = stats[status]["total_difficulty"]
            stats[status]["avg_difficulty"] = (
                round(total_diff / count, 2) if count > 0 else None
            )
            del stats[status]["total_difficulty"]

    return results


# Step 4: Run everything
file_path = (
    "C:/Users/pnt/Sync/TIG/hackathon Warschau/example chat v4.txt"  # <- your path
)
chat_history = read_text_file(file_path)

if chat_history:
    results = aggregate_detailed_response_data(chat_history)

    # Pretty-print for now
    import pprint

    pprint.pprint(results, sort_dicts=False)

# %%
