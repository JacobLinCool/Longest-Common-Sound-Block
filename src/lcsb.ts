import { SoundBlock } from "./types";

/**
 * Find the longest common sound block between two sound block sequences.
 * @param a The first sound block sequence
 * @param b The second sound block sequence
 * @param tolerance The tolerance for the sound block comparison (in seconds)
 * @returns The longest common sound block
 */
export function lcsb(
    a: SoundBlock[],
    b: SoundBlock[],
    tolerance = 0.2,
): {
    duration: number;
    start: [number, number];
} {
    const [m, n] = [a.length, b.length];
    const dp = new Float32Array(m * n);

    let [duration, blocks, start_a, start_b] = [0, 0, 0, 0];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (Math.abs(a[i].duration - b[j].duration) <= tolerance) {
                blocks++;

                if (i === 0 || j === 0) {
                    dp[i * n + j] = (a[i].duration + b[j].duration) / 2;
                } else {
                    dp[i * n + j] = dp[(i - 1) * n + j - 1] + (a[i].duration + b[j].duration) / 2;
                }

                if (dp[i * n + j] > duration) {
                    duration = dp[i * n + j];
                    start_a = i - blocks + 1;
                    start_b = j - blocks + 1;
                }
            } else {
                blocks = 0;
            }
        }
    }

    return {
        duration: Math.round(duration * 10) / 10,
        start: duration ? [a[start_a].start, b[start_b].start] : [-1, -1],
    };
}

/**
 * Find the most common longest sound block between many sound block sequences.
 * @param inputs The sound block sequences
 * @param tolerance The tolerance for the sound block comparison (in seconds)
 * @returns The most common longest sound block
 */
export function lcsb_most(
    inputs: SoundBlock[][],
    tolerance = 0.2,
): {
    duration: number;
    starts: number[];
} {
    const list: { blocks: SoundBlock[]; start: [number, number] }[] = [];
    for (let i = 0; i < inputs.length - 1; i++) {
        const [a, b] = [inputs[i], inputs[i + 1]];
        const [m, n] = [a.length, b.length];
        const dp = new Float32Array(m * n);

        let [duration, blocks, final_blocks, start_a, start_b] = [0, 0, 0, 0, 0];
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.abs(a[i].duration - b[j].duration) <= tolerance) {
                    blocks++;

                    if (i === 0 || j === 0) {
                        dp[i * n + j] = (a[i].duration + b[j].duration) / 2;
                    } else {
                        dp[i * n + j] =
                            dp[(i - 1) * n + j - 1] + (a[i].duration + b[j].duration) / 2;
                    }

                    if (dp[i * n + j] > duration) {
                        duration = dp[i * n + j];
                        start_a = i - blocks + 1;
                        start_b = j - blocks + 1;
                        final_blocks = blocks;
                    }
                } else {
                    blocks = 0;
                }
            }
        }

        list.push({
            blocks: a.slice(start_a, start_a + final_blocks),
            start: duration ? [a[start_a].start, b[start_b].start] : [-1, -1],
        });
    }

    const dict: Record<string, { count: number; starts: number[] }> = {};
    for (let i = 0; i < list.length; i++) {
        const key = list[i].blocks.map((b) => b.duration).join("-");

        if (dict[key] === undefined) {
            dict[key] = { count: 0, starts: new Array(inputs.length).fill(-1) };
        }

        dict[key].count++;
        dict[key].starts[i] = list[i].start[0];
        dict[key].starts[i + 1] = list[i].start[1];
    }

    const most = Object.entries(dict).sort((a, b) => b[1].count - a[1].count)[0];
    const duration = most[0].split("-").reduce((a, b) => a + Number(b), 0);

    const sample = list.find((l) => l.blocks.map((b) => b.duration).join("-") === most[0]);
    for (let i = 0; i < inputs.length; i++) {
        if (most[1].starts[i] === -1) {
            const result = lcsb(inputs[i], sample?.blocks ?? []);
            if (result.duration === duration) {
                most[1].starts[i] = result.start[0];
            }
        }
    }

    return { duration, starts: most[1].starts };
}

/**
 * Alias for `lcsb_most`
 */
export const mclsb = lcsb_most;
