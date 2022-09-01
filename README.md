# Longest Common Sound Block

Find longest common sound block between multiple wav files.

It can be used to find the duration and start point of opening in a drama series soundtracks.

> Finding OP in 9 episodes of an anime series takes 5 seconds on my M1 MBP. Each episode is around 22 minutes long in 16bit mono 48000 Hz wav format.

## CLI Usage

```sh
❯ lcsb --help
Usage: lcsb [options] <input...>

Arguments:
  input                input files

Options:
  -p, --pool <pool>    max pooling pool size (default: 4800)
  -l, --lower <lower>  partition lower bound (in second) (default: 1)
  -u, --upper <upper>  partition upper bound (in second) (default: 180)
  -m, --mode <mode>    'pair' or 'most' (default: "pair")
  -h, --help           display help for command
```

## Library Usage

## `lcsb`

```ts
import fs from "node:fs";
import { partition, lcsb } from "lcsb";

const partition_a = partition(fs.readFileSync("a.wav"));
const partition_b = partition(fs.readFileSync("b.wav"));

const lcsb_ab = lcsb(partition_a, partition_b);

console.log(lcsb_ab);
```

## `mclsb`

```ts
import fs from "node:fs";
import { partition, mclsb } from "lcsb";

const partition_a = partition(fs.readFileSync("a.wav"));
const partition_b = partition(fs.readFileSync("b.wav"));
const partition_c = partition(fs.readFileSync("c.wav"));

const most_common = mclsb([partition_a, partition_b, partition_c]);

console.log(most_common);
```

## Time Complexity

### Partition

`O(N)`

- `N` is the number of samples in a wav file.

### LCSB

`O(nm)`

- `n` is the number of partitions in the first wav file.
- `m` is the number of partitions in the second wav file.

`n` and `m` are usually small, so it's almost done in instant.
