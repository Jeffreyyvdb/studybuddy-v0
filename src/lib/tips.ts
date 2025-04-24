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

// Aggregation function
export function aggregateDetailedResponseDataFromMessages(messages: {role: string, content: string}[]): Results {
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
