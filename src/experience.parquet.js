// AGPL DN

// b3784d3

import * as Arrow from "apache-arrow";
//import * as Arrow from "https://deno.land/x/arrow@v8.0.0/mod.ts";
import * as Parquet from "parquet-wasm";
//import { ParquetWriter } from "https://deno.land/x/parquet_wasm@latest/mod.ts";
//import * as Parquet from "https://deno.land/x/parquet-wasm@latest/mod.ts";

import {readFileSync} from 'node:fs'
import { Workbook } from './xlsx.js'
/*import { compile } from "https://cdn.jsdelivr.net/gh/calculang/calculang@dev/packages/standalone/index.js"

const model = await compile({
  entrypoint: 'entrypoint.cul.js',
  fs: {
    "entrypoint.cul.js": readFileSync('./cul/simulated-experience.cul.js').toString(),
    "./life.cul.js": readFileSync('./cul/life.cul.js').toString(),
  }
});*/ // This won't work due to network imports inside data url?


import { introspection as getIntrospection, compile_new, bundleIntoOne, calls_fromDefinition  } from "https://cdn.jsdelivr.net/gh/declann/calculang-js-browser-dev@main/calculang.js" // PINNED VERSION (due to cache)

// where calculang source code is linked
const fs = ({
  "entrypoint.cul.js": readFileSync('./cul/simulated-experience.cul.js').toString(),
  "./life.cul.js": readFileSync('./cul/life.cul.js').toString(),
})

const introspection = await getIntrospection('entrypoint.cul.js', fs)

//console.log(introspection)

const compiled = await compile_new('entrypoint.cul.js', fs, introspection)

const bundle = bundleIntoOne(compiled, introspection, true)

const u = URL.createObjectURL(new Blob([bundle], { type: "text/javascript" }))
//console.log(`creating ${u}`)

const data_uri_prefix =         "data:" + "text/javascript" + ";base64,";
//var image = new Buffer(bl.toString(), 'binary').toString('base64');                                                                                                                                                                 
const datau = data_uri_prefix + btoa(bundle)//Buffer.from(bundle).toString('base64');

// where calculang JS output is imported:
const model = await import(datau)


////////////////////////////////////////////////////



// these could be useful to generalise script: things like: output all formulae, or all t_in-dept formulae (see also: introspection.cul_input_map)
// atm I don't use them
const inputs = [...introspection.cul_functions.values()].filter(d => d.reason == 'input definition' /* Breaks show demand curve && d.cul_scope_id == 0*/).map(d => d.name).sort()
const formulae = [...introspection.cul_functions.values()].filter(d => d.reason == 'definition').map(d => d.name)
const formulae_not_inputs = [...introspection.cul_functions.values()].filter(d => d.reason == 'definition' && inputs.indexOf(d.name+'_in') == -1).map(d => d.name)

// load spreadsheet tables
const premium_table = (await Workbook.load('./data/BasicTerm_SE/premium_table.xlsx')).sheet("Sheet1", {headers: true})
const disc_rate_ann = (await Workbook.load('./data/BasicTerm_SE/disc_rate_ann.xlsx')).sheet("Sheet1", {headers: true})
//const model_point_table = (await Workbook.load('./data/BasicTerm_SE/model_point_table.xlsx')).sheet("Sheet1", {headers: true})
const mort_table = (await Workbook.load('./data/BasicTerm_SE/mort_table.xlsx')).sheet("Sheet1", {headers: true})

// cursor object for inputs that are fixed
const cursor = ({
  zero_duration_in: false,
  timing_in: 'BEF_MAT',
  //model_in,
  //model_point_table_function_in: () => model_point_table,
  premium_table_function_in: () => premium_table,
  mort_table_function_in: () => mort_table,
  disc_rate_ann_table_function_in: () => disc_rate_ann,
  //lifelib_table_function_in: () => lifelib_table,
  //t_in: 0,
  data_version_in: 1
})

// Arrays used to create Arrow (columnar) table
const net_cf = []
const pols_if_at = []
const pols_lapse = []
const pols_death = []
const pols_maturity = []
const pols_new_biz = []
const claims = []
const premiums = []
const commissions = []
const expenses = []
const random_seed_in = []
const t_in = []


// TODO ALSO OUTPUT THE GENERATED MODEL POINT DATA? (does this work in a sep. quick script - prob not, due to random dependence on order - tofix)

// This is set to 1k; I'm really interested in benchmarks on 10k (which core dumps if not using --max-old-space-size=8000)

// enter super hot loop:

for (let p = 1; p <= 1000; p++) {
  for (let t = -model.duration_mth({...cursor,t_in:0, random_seed_in:p}); t < model.proj_len({...cursor, random_seed_in:p})+3; t++) {
    let net_cf_ans = 9999999 // this was a poor way to identify uncaught errors (but there should be none!)
    let pols_if_at_ans = 9999999
    let pols_lapse_ans = 9999999
    let pols_death_ans = 9999999
    let pols_maturity_ans = 9999999
    let pols_new_biz_ans = 9999999
    let claims_ans = 9999999
    let premiums_ans = 9999999
    let commissions_ans = 9999999
    let expenses_ans = 9999999
    try { // does this affect perf ?
      net_cf_ans = model.net_cf({...cursor, random_seed_in: p, t_in:t});
      pols_if_at_ans = model.pols_if_at({...cursor, random_seed_in: p, t_in:t});
      pols_lapse_ans = model.pols_lapse({...cursor, random_seed_in: p, t_in:t});
      pols_death_ans = model.pols_death({...cursor, random_seed_in: p, t_in:t});
      pols_maturity_ans = model.pols_maturity({...cursor, random_seed_in: p, t_in:t});
      pols_new_biz_ans = model.pols_new_biz({...cursor, random_seed_in: p, t_in:t});
      claims_ans = model.claims({...cursor, random_seed_in: p, t_in:t});
      premiums_ans = model.premiums({...cursor, random_seed_in: p, t_in:t});
      commissions_ans = model.commissions({...cursor, random_seed_in: p, t_in:t});
      expenses_ans = model.expenses({...cursor, random_seed_in: p, t_in:t});
    } catch (e) {
      console.error('caught !!')
    }

    // populate arrays with answers from model
    net_cf.push(net_cf_ans)
    pols_if_at.push(pols_if_at_ans)
    pols_lapse.push(pols_lapse_ans)
    pols_death.push(pols_death_ans)
    pols_maturity.push(pols_maturity_ans)
    pols_new_biz.push(pols_new_biz_ans)
    claims.push(claims_ans)
    premiums.push(premiums_ans)
    commissions.push(commissions_ans)
    expenses.push(expenses_ans)
    t_in.push(t)
    random_seed_in.push(p)
  }
}


// Construct an Apache Arrow (columnar) table from the arrays
const table = Arrow.tableFromArrays({t_in, random_seed_in, net_cf, pols_if_at, pols_lapse, pols_death, pols_maturity, pols_new_biz, claims,premiums,commissions,expenses});

// Output the Apache Arrow table as a Parquet table to standard out.
const parquetTable = Parquet.Table.fromIPCStream(Arrow.tableToIPC(table, "stream"));
const parquetBuilder = new Parquet.WriterPropertiesBuilder().setCompression(Parquet.Compression.ZSTD).build();
const parquetData = Parquet.writeParquet(parquetTable, parquetBuilder);
/*Deno.stdout.write(parquetData);
console.log("PAR1") // this doesn't work. Why is output using Deno corrupted?
Deno.close(Deno.stdout.rid);*/
process.stdout.write(parquetData)
//console.log(parquetData)
////(Deno).stdout.write(JSON.stringify([...table]));

