// TODO change shape of simulation (more deaths/expd deaths (older-weighted book))

import {
  t, premium_table_function, zero_duration, premium_rate, mort_table_function, duration, mort_rate3, mort_rate, mort_rate2, age, pols_if_init, timing, pols_if_at, pols_lapse, pols_maturity, pols_new_biz, pols_death, claim_pp, premium_pp, premiums, claims, expense_maint, inflation_rate, inflation_factor, expenses, commissions, net_cf, proj_len, net_premium_pp, pv_claims, pv_fut_claims, pv_premiums, pv_fut_premiums, pv_expenses, pv_fut_expenses, pv_commissions, pv_fut_commissions, pv_net_cf, pv_fut_net_cf, pols_if, pv_pols_if, pv_fut_pols_if, disc_rate_ann_table_function, disc_rate_ann, disc_rate_mth, disc_factor, lapse_rate,
  lapse_rate_mth_ as lapse_rate_mth_orig,
  mort_rate_mth_ as mort_rate_mth_orig, is_active
//  expense_acq_ as expense_acq_orig
} from './life.cul.js';

// I need to simulate Lapse Date, Date of Death
// always 1 < x < duration_mth  ??
// use mort_rate_mth, lapse_rate_mth
// then override them to use Lapse Date, Date of Death

// TODO just simulate this
export const lapse_rate_mth = () => {
  if (t() < 0) return random({random_key_in:'lapse_rate_mth'+t()}) < lapse_rate_mth_orig() ? 1 : 0;
  else return lapse_rate_mth_orig();
}


// TODO refactor so I can see DOD, cancellation date etc.
export const mort_rate_mth = () => {
  //return (t() == 52 && is_active()) ? 1 : 0
  if (t() < 0) return random({random_key_in:'mort_rate_mth'+t()}) < 1*mort_rate_mth_orig() ? 1 : 0; // dramatic poor expe vs expected, but i want deaths to show up in limited experience (and i want to find expe impact)
  else return mort_rate_mth_orig();
}

export const age_at_entry = () => Math.floor(random({random_key_in: 'age_at_entry'}) * 20) + 20;
export const sex = () => random({random_key_in: 'sex'}) < 0.4 ? 'F' : 'M'
export const policy_term = () => random({random_key_in: 'policy_term'}) < 0.5 ? 10 : 20

export const policy_count = () => 1;
//export const expense_acq = () => 0; // for clearer visual only


export const sum_assured = () => 100000;
///
// dupe logic??? BAD
export const duration_mth_r = () => Math.floor(random({random_key_in: 'duration_mth'}) * 50) // all IF

export const duration_mth = () => {
  if (zero_duration()) return 0+t();
  else return duration_mth_r()+t();
  //if (t() <= 0) return duration_mth_r()+1
  //else return duration_mth({t_in:t()-1})+1////
}////

export const model_point = () => ({ policy_term: policy_term(), duration_mth: duration_mth(), age_at_entry: age_at_entry(), sex: sex() })

//import { seeded } from "https://cdn.jsdelivr.net/gh/declann/calculang-js-browser-dev@main/random.js"
const seeded = (await import("https://cdn.jsdelivr.net/gh/declann/calculang-js-browser-dev@main/random.js?"+Math.random())).seeded // CLOSE. but depends on which policy is active. i.e. breaks for hot reload, ow repeatable
export const random_seed = () => random_seed_in;

// SHOULDN'T CREATE A CUL_LINK (1,2,3 mitigates); todo look at issues
export const random = () => {
  return seeded(1,2,3) // I lost control of random seed, bring back?
  random_key()
}

export const random_key = () => random_key_in+String(random_seed())



// SEE COMMENTS IN monte-carlo in calcwithdec.dev repo
// seeded random
/*import { prng_alea } from 'https://cdn.jsdelivr.net/npm/esm-seedrandom/+esm'
export const random_seed = () => random_seed_in;
export const seeded = () => prng_alea(random_seed());
export const random = () => seeded({ random_seed_in: random_seed() })();
*/