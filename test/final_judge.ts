interface ChatMessage {
    role: string;
    content: string;
}

interface ProgressEntry {
    difficulty?: number;
    correct: boolean;
}

interface SubcategoryStats {
    true: {
        count: number;
        total_difficulty?: number;
        avg_difficulty?: number | null;
    };
    false: {
        count: number;
        total_difficulty?: number;
        avg_difficulty?: number | null;
    };
    progress: ProgressEntry[];
}

type Results = Record<string, SubcategoryStats>;

// DIT MAG WEG, FUNS - VARIABLE UIT DE APP HALEN
// Example messageHistory 
const messageHistory: ChatMessage[] = [

    {

        "role": "user",

        "content": "Start a quiz about Mathematics. Give me a question."

    },

    {

        "role": "assistant",

        "content": "{\"question\":\"What is the quadratic formula used for solving quadratic equations?\",\"type\":\"open\",\"options\":[],\"previousResponseCorrect\":true,\"explanation\":\"\",\"tag\":\"Mathematics\"}"

    },

    {

        "role": "user",

        "content": "dawdws"

    },

    {

        "role": "assistant",

        "content": "{\"question\":\"What does 'discriminant' in the quadratic formula tell us about the roots of the equation?\",\"type\":\"multiple_choice\",\"options\":[\"A. The color of the graph\",\"B. The number and type of solutions\",\"C. The shape of the parabola\",\"D. Which numbers are prime\"],\"previousResponseCorrect\":false,\"explanation\":\"Looks like you hit the wrong key on your calculator! The quadratic formula isn't just random letters; it's key to solving those tricky equations. Try again!\",\"tag\":\"Mathematics\",\"correctAnswer\":\"B\"}"

    },

    {

        "role": "user",

        "content": "B. The number and type of solutions"

    },

    {

        "role": "assistant",

        "content": "{\"question\":\"What is the standard form of a quadratic equation?\",\"type\":\"open\",\"options\":[],\"previousResponseCorrect\":true,\"explanation\":\"Right on! The discriminant helps you figure out how many solutions you’ve got and whether they’re real or imaginary. It’s like the VIP pass to understanding your quadratic graph.\",\"tag\":\"Mathematics\"}"

    }

];

// Aggregation function
function aggregateDetailedResponseDataFromMessages(messages: ChatMessage[]): Results {
    const results: Results = {};

    for (const msg of messages) {
        if (msg.role !== "assistant") continue;

        try {
            const data = JSON.parse(msg.content);
            const subcat: string = data.subcategory || "[None]";
            const correct: boolean | undefined = data.previousResponseCorrect;
            const difficulty: number | undefined = data.difficulty;

            if (typeof correct === 'boolean') {
                const correctKey = String(correct) as 'true' | 'false';

                if (!results[subcat]) {
                    results[subcat] = {
                        true: { count: 0, total_difficulty: 0 },
                        false: { count: 0, total_difficulty: 0 },
                        progress: [],
                    };
                }

                results[subcat][correctKey].count += 1;
                results[subcat][correctKey].total_difficulty! += difficulty || 0;

                results[subcat].progress.push({
                    difficulty,
                    correct
                });
            }
        } catch {
            // Ignore malformed content
        }
    }

    // Post-process to calculate average difficulties
    for (const subcat in results) {
        for (const status of ["true", "false"] as const) {
            const stats = results[subcat][status];
            stats.avg_difficulty = stats.count > 0
                ? parseFloat((stats.total_difficulty! / stats.count).toFixed(2))
                : null;
            delete stats.total_difficulty;
        }
    }

    return results;
}

// Execute the aggregation
const results = aggregateDetailedResponseDataFromMessages(messageHistory);
console.dir(results, { depth: null, colors: true });
