import wav from "node-wav";
import { SoundBlock } from "./types";

/**
 * Partition a wav file into sound blocks.
 * @param data The data of a wav file
 * @param options The options of the partition
 * @returns The sound blocks of the wav file
 */
export function partition(
    data: Buffer,
    {
        pool = 4800,
        lower = 1,
        upper = 180,
    }: {
        pool?: number;
        lower?: number;
        upper?: number;
    } = {},
): SoundBlock[] {
    const { sampleRate, channelData } = wav.decode(data);
    const second = sampleRate / pool;

    const max_pool = new Int8Array(channelData[0].length / pool);
    for (let i = 0; i < max_pool.length; i++) {
        let max = 0;
        for (let j = 0; j < pool; j++) {
            max = Math.max(max, Math.abs(channelData[0][i * pool + j]));
        }
        max_pool[i] = Math.round(max * 100);
    }

    const blocks: { start: number; end: number; duration: number }[] = [];
    for (let i = 0; i < max_pool.length; i++) {
        if (max_pool[i] > 0) {
            const start = i;
            while (i < max_pool.length && max_pool[i] > 0) {
                i++;
            }
            const end = i;

            const duration = end - start;
            if (duration >= lower * second && duration <= upper * second) {
                blocks.push({
                    start: start / second,
                    end: end / second,
                    duration: duration / second,
                });
            }
        }
    }

    return blocks;
}
