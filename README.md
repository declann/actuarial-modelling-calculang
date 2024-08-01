# actuarial-modelling-calculang

```sh
npm i # install dependencies
npm run make-experience # On 10k simulations requires at least 8 gigs of memory and a few minutes - but configured for 1k simulations only
```

This should output an `experience.parquet` file, which can be read in numerous ways including using [Huey](https://github.com/rpbouman/huey).

This file includes modelled cashflows and survival values for **every simulated policy and every time period**. The identifier for policy is `random_seed_in`.

The script requires `--experimental-network-imports` flag for nodejs, which is now deprecated - so must also experiment with alternative runtime options.

## this repo/release

is not organised or complete.

## ⚠️ models, model outputs disclaimer - important ❗

The assumptions, methodology and limitations of a model and model outputs should be carefully considered for any purpose you apply them to.

I haven’t completely listed these - or otherwise properly documented models and outputs.

## experimental

calculang is alpha software. This repository uses a further experimental release of calculang.

Code in this repository itself is alpha code that should not be relied upon and that includes no warranty - for more details see the [LICENSE](./LICENSE) file.

## Licenses

This repo includes calculang code ported from lifelibs BasicTerm_SE model.

It includes spreadsheet inputs from lifelib.

[Lifelib](https://github.com/lifelib-dev/lifelib) is Copyright (c) 2022 lifelib Developers under [MIT License](https://github.com/lifelib-dev/lifelib/blob/main/LICENSE.txt)

For reading spreadsheets this includes [convenient code](https://github.com/observablehq/framework/blob/main/src/client/stdlib/xlsx.js) from [Observable Framework](https://observablehq.com/framework/) - available under [ISC License](https://github.com/observablehq/framework/blob/main/LICENSE).

My own code, changes, and contributions to this repository are licensed under the [AGPLv3](./LICENSE).
