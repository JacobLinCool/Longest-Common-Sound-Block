#!/usr/bin/env node
import fs from "node:fs";
import { OptionValues, program } from "commander";
import { SoundBlock, partition, lcsb, lcsb_most } from "./lib";

program
    .option("-p, --pool <pool>", "max pooling pool size", Number, 4800)
    .option("-l, --lower <lower>", "partition lower bound (in second)", Number, 1)
    .option("-u, --upper <upper>", "partition upper bound (in second)", Number, 180)
    .option("-m, --mode <mode>", "'pair' or 'most'", "pair")
    .argument("<input...>", "input files")
    .action(async (input: string[], options: OptionValues) => {
        if (input.length < 2) {
            console.error("At least two input files are required");
            process.exit(1);
        }

        const sound_blocks: SoundBlock[][] = [];
        for (const file of input) {
            console.log(`Partitioning ${file} ...`);
            const data = fs.readFileSync(file);
            sound_blocks.push(partition(data, options));
        }

        if (options.mode === "pair") {
            for (let i = 0; i < sound_blocks.length - 1; i++) {
                const { duration, start } = lcsb(sound_blocks[i], sound_blocks[i + 1]);
                console.log(
                    `LCSB between ${input[i]} and ${input[i + 1]}: ${duration} seconds, start at ${
                        start[0]
                    } and ${start[1]}`,
                );
            }
        } else if (options.mode === "most") {
            const most = lcsb_most(sound_blocks);
            console.log(`Most common LCSB: ${most.duration} seconds`);
            for (let i = 0; i < most.starts.length; i++) {
                if (most.starts[i] === -1) {
                    console.log(`${input[i]}: not exist`);
                } else {
                    console.log(`${input[i]}: start at ${most.starts[i]} seconds`);
                }
            }
        } else {
            console.error("Invalid mode");
            process.exit(1);
        }
    });

program.parse();
