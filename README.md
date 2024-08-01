# actuarial-modelling-calculang

```sh
npm i # install dependencies
npm run make-experience
```

This should output an `experience.parquet` file, which can be read in numerous ways including using [Huey](https://github.com/rpbouman/huey).

The script requires `--experimental-network-imports` flag for nodejs, which is now deprecated - so must also experiment with alternative runtime options.

## Licenses

This repo includes calculang code ported from lifelibs BasicTerm_SE model.

It includes spreadsheet inputs from lifelib.

[Lifelib](https://github.com/lifelib-dev/lifelib) is Copyright (c) 2022 lifelib Developers under [MIT License](https://github.com/lifelib-dev/lifelib/blob/main/LICENSE.txt)

For reading spreadsheets this includes [convenient code](https://github.com/observablehq/framework/blob/main/src/client/stdlib/xlsx.js) from [Observable Framework]( Copyright 2023-2024 Observable, Inc. under [ISC License](https://github.com/observablehq/framework/blob/main/LICENSE).
