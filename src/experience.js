
////////////// cul scope id 0 //////////

// TODO change shape of simulation (more deaths/expd deaths (older-weighted book))








// I need to simulate Lapse Date, Date of Death
// always 1 < x < duration_mth  ??
// use mort_rate_mth, lapse_rate_mth
// then override them to use Lapse Date, Date of Death

// TODO just simulate this
export const s0_lapse_rate_mth$ = ({ t_in, random_seed_in, zero_duration_in }) => {
  if (s1_t({ t_in }) < 0) return s0_random({ random_seed_in, random_key_in: 'lapse_rate_mth' + s1_t({ t_in }) }) < s1_lapse_rate_mth_({ zero_duration_in, t_in, random_seed_in }) ? 1 : 0;else
  return s1_lapse_rate_mth_({ zero_duration_in, t_in, random_seed_in });
};


// TODO refactor so I can see DOD, cancellation date etc.
export const s0_mort_rate_mth$ = ({ t_in, random_key_in, random_seed_in, mort_table_function_in, zero_duration_in }) => {
  //return (t() == 52 && is_active()) ? 1 : 0
  if (s1_t({ t_in }) < 0) return s0_random({ random_seed_in, random_key_in: 'mort_rate_mth' + s1_t({ t_in }) }) < 1 * s1_mort_rate_mth_({ mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in }) ? 1 : 0; // dramatic poor expe vs expected, but i want deaths to show up in limited experience (and i want to find expe impact)
  else return s1_mort_rate_mth_({ mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in });
};

export const s0_age_at_entry = ({ random_seed_in }) => Math.floor(s0_random({ random_seed_in, random_key_in: 'age_at_entry' }) * 20) + 20;
export const s0_sex = ({ random_seed_in }) => s0_random({ random_seed_in, random_key_in: 'sex' }) < 0.4 ? 'F' : 'M';
export const s0_policy_term = ({ random_seed_in }) => s0_random({ random_seed_in, random_key_in: 'policy_term' }) < 0.5 ? 10 : 20;

export const s0_policy_count = ({}) => 1;
//export const expense_acq = () => 0; // for clearer visual only


export const s0_sum_assured = ({}) => 100000;
///
// dupe logic??? BAD
export const s0_duration_mth_r$ = ({ random_seed_in }) => Math.floor(s0_random({ random_seed_in, random_key_in: 'duration_mth' }) * 50); // all IF

export const s0_duration_mth = ({ zero_duration_in, t_in, random_seed_in }) => {
  if (s1_zero_duration({ zero_duration_in })) return 0 + s1_t({ t_in });else
  return s0_duration_mth_r({ random_seed_in }) + s1_t({ t_in });
  //if (t() <= 0) return duration_mth_r()+1
  //else return duration_mth({t_in:t()-1})+1////
}; ////

export const s0_model_point$ = ({ random_seed_in, zero_duration_in, t_in }) => ({ policy_term: s0_policy_term({ random_seed_in }), duration_mth: s0_duration_mth({ zero_duration_in, t_in, random_seed_in }), age_at_entry: s0_age_at_entry({ random_seed_in }), sex: s0_sex({ random_seed_in }) });

//import { seeded } from "https://cdn.jsdelivr.net/gh/declann/calculang-js-browser-dev@main/random.js"
const seeded = (await import("https://cdn.jsdelivr.net/gh/declann/calculang-js-browser-dev@main/random.js?" + Math.random())).seeded; // CLOSE. but depends on which policy is active. i.e. breaks for hot reload, ow repeatable
export const s0_random_seed = ({ random_seed_in }) => random_seed_in;

// SHOULDN'T CREATE A CUL_LINK (1,2,3 mitigates); todo look at issues
export const s0_random$ = ({ random_key_in, random_seed_in }) => {
  return seeded(1, 2, 3); // I lost control of random seed, bring back?
  s0_random_key({ random_key_in, random_seed_in });
};

export const s0_random_key = ({ random_key_in, random_seed_in }) => random_key_in + String(s0_random_seed({ random_seed_in }));



// SEE COMMENTS IN monte-carlo in calcwithdec.dev repo
// seeded random
/*import { prng_alea } from 'https://cdn.jsdelivr.net/npm/esm-seedrandom/+esm'
export const random_seed = () => random_seed_in;
export const seeded = () => prng_alea(random_seed());
export const random = () => seeded({ random_seed_in: random_seed() })();
*/



////////////// cul scope id 1 //////////

// the following is based on the lifelib BasicTerm_SE model
// @ https://lifelib.io/libraries/basiclife/BasicTerm_SE.html

// b3784

export const s1_t = ({ t_in }) => t_in;

export const s1_age_at_entry_ = ({ age_at_entry_in }) => age_at_entry_in;
export const s1_sex_ = ({ sex_in }) => sex_in;
export const s1_policy_term_ = ({ policy_term_in }) => policy_term_in;
export const s1_policy_count_ = ({ policy_count_in }) => policy_count_in;
export const s1_sum_assured_ = ({ sum_assured_in }) => sum_assured_in;

export const s1_duration_mth_ = ({ zero_duration_in, t_in, duration_mth_in }) => {
  if (s1_zero_duration({ zero_duration_in }) && s1_t({ t_in }) <= 0) return 0;
  return duration_mth_in + s1_t({ t_in });
  //if (t() <= 0) return duration_mth_in
  //else return duration_mth({ t_in: t() - 1 }) + 1
};

export const s1_premium_table_function = ({ premium_table_function_in }) => premium_table_function_in;

export const s1_zero_duration = ({ zero_duration_in }) => zero_duration_in;

export const s1_premium_rate$ = ({ premium_table_function_in, random_seed_in }) =>
s1_premium_table_function({ premium_table_function_in })().
find((d) => d.age_at_entry == s0_age_at_entry({ random_seed_in }) && d.policy_term == s0_policy_term({ random_seed_in })).
premium_rate;

export const s1_mort_table_function = ({ mort_table_function_in }) => mort_table_function_in;

// duration (in years):
export const s1_duration$ = ({ zero_duration_in, t_in, random_seed_in }) => Math.floor(s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) / 12);

// splitting mort_rate into interim functions due to a calculang bug
// anon fn breaks with dep on duration ! BUG
export const s1_mort_rate3$ = ({ mort_table_function_in, random_seed_in, zero_duration_in, t_in }) => s1_mort_table_function({ mort_table_function_in })().find((d) => d.Age == s1_age({ random_seed_in, zero_duration_in, t_in }));
export const s1_mort_rate$ = ({ mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in }) => s1_mort_rate3({ mort_table_function_in, random_seed_in, zero_duration_in, t_in })[s1_mort_rate2({ zero_duration_in, t_in, random_seed_in })];

//const clamp = (min,max,value) => Math.max(min,Math.min(max,value)) // doesn't work; gets definition/links (I think Number.prototype works)

export const s1_mort_rate2$ = ({ zero_duration_in, t_in, random_seed_in }) => Math.max(0, Math.min(5, s1_duration({ zero_duration_in, t_in, random_seed_in })));


export const s1_mort_rate_mth_ = ({ mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in }) => 1 - (1 - s1_mort_rate({ mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in })) ** (1 / 12);

export const s1_age$ = ({ random_seed_in, zero_duration_in, t_in }) => s0_age_at_entry({ random_seed_in }) + Math.floor(s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) / 12); //duration()

// life.cul.js gives IF projections by default
// override pols_if_init (but not policy_count) to 0 for NB projections (pols_new_biz)
export const s1_pols_if_init$ = ({}) => {
  return s0_policy_count({});
};

export const s1_timing = ({ timing_in }) => timing_in;

// experience should come in as NB
// NB vs. IF ...
export const s1_pols_if_at$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in }) => {
  if (s1_is_active({ zero_duration_in, t_in, random_seed_in }) == 0) return 0; // todo tidy is_active logic
  // works, but also appear as NB
  //if (t() == -duration_mth({t_in:0}) && timing() == 'BEF_MAT') // DN <= for past
  //return 0//pols_if_init() // needs experience
  // todo setup init for super old?
  if (s1_timing({ timing_in }) == 'BEF_MAT') {
    if (s1_t({ t_in }) == 0 && s1_pols_if_init({})) // pols_if_init makes model an IF model; otherwise pols_new_biz populated
      return s1_pols_if_init({});
    return s1_pols_if_at({ zero_duration_in, random_key_in, random_seed_in, mort_table_function_in, t_in: s1_t({ t_in }) - 1, timing_in: 'BEF_DECR' }) - s1_pols_lapse({ zero_duration_in, random_key_in, random_seed_in, mort_table_function_in, t_in: s1_t({ t_in }) - 1 }) - s1_pols_death({ zero_duration_in, random_key_in, random_seed_in, mort_table_function_in, t_in: s1_t({ t_in }) - 1 });
  }
  if (s1_timing({ timing_in }) == 'BEF_NB') {
    return s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_MAT' }) - s1_pols_maturity({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in });
  }
  if (s1_timing({ timing_in }) == 'BEF_DECR') return s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_NB' }) + s1_pols_new_biz({ zero_duration_in, t_in, random_seed_in });
  return console.error('bad timing_in !');
};

export const s1_pols_lapse$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) => s1_is_active({ zero_duration_in, t_in, random_seed_in }) ? (s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_DECR' }) - s1_pols_death({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in })) * s0_lapse_rate_mth({ t_in, random_seed_in, zero_duration_in }) : 0;

// refactor for stress and experience logic
export const s1_lapse_rate_mth_ = ({ zero_duration_in, t_in, random_seed_in }) => 1 - (1 - s1_lapse_rate({ zero_duration_in, t_in, random_seed_in })) ** (1 / 12);

export const s1_pols_maturity$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) => {
  if (s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) == s0_policy_term({ random_seed_in }) * 12)
  return s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_MAT' });else
  return 0;
};

// Q: IF run from start, treat as NB?? Not doing so atm
//   // if (duration_mth({t_in:t()}) == 0 && duration_mth({t_in:0}) > 0) // this type of line is calculang bug if I exclude t_in:t() TOFIX
export const s1_pols_new_biz$ = ({ zero_duration_in, t_in, random_seed_in }) => {
  if (s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) == 0 && !s1_pols_if_init({}))
  return s0_policy_count({});else
  return 0;
};

export const s1_pols_death$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) => s1_is_active({ zero_duration_in, t_in, random_seed_in }) ? s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_DECR' }) * s0_mort_rate_mth({ t_in, random_key_in, random_seed_in, mort_table_function_in, zero_duration_in }) : 0;

export const s1_claim_pp$ = ({}) => s0_sum_assured({});

// monthly
export const s1_premium_pp$ = ({ premium_table_function_in, random_seed_in }) => Math.round(s0_sum_assured({}) * s1_premium_rate({ premium_table_function_in, random_seed_in }) * 100) / 100; // round 2 decimal places

export const s1_premiums$ = ({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) => s1_premium_pp({ premium_table_function_in, random_seed_in }) * s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_DECR' });
export const s1_claims$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) => -s1_claim_pp({}) * s1_pols_death({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in });

export const s1_expense_acq$ = ({}) => 300;
export const s1_expense_maint$ = ({}) => 60;

export const s1_inflation_rate$ = ({}) => 0.01;
export const s1_inflation_rate_mth$ = ({}) => (1 + s1_inflation_rate({})) ** (1 / 12) - 1; // probably a slow formula, but not tied to high-cardinality inputs?

//export const inflation_factor = () => (1 + inflation_rate()) ** (t() / 12)
// refactor to support easier stress/delay logic (tested 0 impact on 500 pols, todo refresh complete test)
export const s1_inflation_factor$ = ({ t_in }) => {
  // hindcasting expense inflation, is this right? Replace with other actuals?
  if (s1_t({ t_in }) < 0) return s1_inflation_factor({ t_in: s1_t({ t_in }) + 1 }) / (1 + s1_inflation_rate_mth({}));
  if (s1_t({ t_in }) == 0) return 1;else
  return s1_inflation_factor({ t_in: s1_t({ t_in }) - 1 }) * (1 + s1_inflation_rate_mth({}));
};

export const s1_expenses$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) => -(s1_expense_acq({}) * s1_pols_new_biz({ zero_duration_in, t_in, random_seed_in }) + s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, timing_in: 'BEF_DECR' }) * s1_expense_maint({}) / 12 * s1_inflation_factor({ t_in }));

export const s1_commissions$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in }) => s1_duration({ zero_duration_in, t_in, random_seed_in }) == 0 ? -s1_premiums({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) : 0;

export const s1_net_cf$ = ({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) => s1_premiums({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) + s1_claims({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) + s1_expenses({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) + s1_commissions({ zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in });


export const s1_proj_len$ = ({ random_seed_in, zero_duration_in }) => Math.max(12 * s0_policy_term({ random_seed_in }) - s0_duration_mth({ zero_duration_in, random_seed_in, t_in: 0 }) + 1, 0);

export const s1_net_premium_pp$ = ({ random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in }) => -s1_pv_fut_claims({ random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: 0, zero_duration_in: true, timing_in: 'BEF_DECR' }) / s1_pv_fut_pols_if({ random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: 0, zero_duration_in: true, timing_in: 'BEF_DECR' }); // no-impact bug: not correctly summarised over timing_in?


// todo think re actuals (new)
export const s1_is_active$ = ({ zero_duration_in, t_in, random_seed_in }) => !(s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) < 0 || s0_duration_mth({ zero_duration_in, t_in, random_seed_in }) > s0_policy_term({ random_seed_in }) * 12);
//export const is_active = () => ((duration_mth() >= 0) && (duration_mth() <= /* maturity edit DN: is this a lifelib issue? */ policy_term() * 12) ? 1 : 0)


// I like idea of this relating to month, and sep pv_fut_claims
export const s1_pv_claims$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_claims({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });

export const s1_pv_fut_claims$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_claims({ random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_claims({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};

export const s1_pv_premiums$ = ({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_premiums({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });

export const s1_pv_fut_premiums$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_premiums({ random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_premiums({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};

export const s1_pv_expenses$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_expenses({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });

export const s1_pv_fut_expenses$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_expenses({ random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_expenses({ zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};

export const s1_pv_commissions$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_commissions({ zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });

export const s1_pv_fut_commissions$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_commissions({ random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_commissions({ zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};


export const s1_pv_net_cf$ = ({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_net_cf({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });

export const s1_pv_fut_net_cf$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_net_cf({ random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_net_cf({ premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};

export const s1_pols_if$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in }) => s1_pols_if_at({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in }) /*{ timing_in: 'BEF_DECR' }*/;

export const s1_pv_pols_if$ = ({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => s1_pols_if({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in }) * s1_disc_factor({ disc_rate_ann_table_function_in, t_in });


export const s1_pv_fut_pols_if$ = ({ t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in }) => {
  if (s1_t({ t_in }) >= s1_proj_len({ random_seed_in, zero_duration_in })) return 0; // redundant when pols if reaches 0? keep?
  return (s1_pv_fut_pols_if({ random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in, t_in: s1_t({ t_in }) + 1 }) + s1_pv_pols_if({ zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in })) / (1 + 0);
};


export const s1_disc_rate_ann_table_function = ({ disc_rate_ann_table_function_in }) => disc_rate_ann_table_function_in;

export const s1_disc_rate_ann$ = ({ disc_rate_ann_table_function_in, t_in }) => s1_disc_rate_ann_table_function({ disc_rate_ann_table_function_in })()[Math.floor(s1_t({ t_in }) / 12)].zero_spot;

export const s1_disc_rate_mth$ = ({ disc_rate_ann_table_function_in, t_in }) => (1 + s1_disc_rate_ann({ disc_rate_ann_table_function_in, t_in })) ** (1 / 12) - 1;

export const s1_disc_factor$ = ({ disc_rate_ann_table_function_in, t_in }) => (1 + s1_disc_rate_mth({ disc_rate_ann_table_function_in, t_in })) ** -s1_t({ t_in });

export const s1_lapse_rate$ = ({ zero_duration_in, t_in, random_seed_in }) => Math.max(0.1 - 0.02 * s1_duration({ zero_duration_in, t_in, random_seed_in }), 0.02);

// custom memo hash function for better perf than JSON.stringify:
//export const memo_hash = ({formula, model_id, input_cursor_id, ...o}) => Object.values(o)

// const { max, min, floor } = Math // This causes an issue when concated >1 in bundle


export const s0_lapse_rate_mth$m = memoize(s0_lapse_rate_mth$, JSON.stringify);
export const s0_lapse_rate_mth = ({t_in, random_seed_in, zero_duration_in}) => s0_lapse_rate_mth$m({t_in, random_seed_in, zero_duration_in})

export const s0_mort_rate_mth$m = memoize(s0_mort_rate_mth$, JSON.stringify);
export const s0_mort_rate_mth = ({t_in, random_key_in, random_seed_in, mort_table_function_in, zero_duration_in}) => s0_mort_rate_mth$m({t_in, random_key_in, random_seed_in, mort_table_function_in, zero_duration_in})

export const s0_duration_mth_r$m = memoize(s0_duration_mth_r$, JSON.stringify);
export const s0_duration_mth_r = ({random_seed_in}) => s0_duration_mth_r$m({random_seed_in})

export const s0_model_point$m = memoize(s0_model_point$, JSON.stringify);
export const s0_model_point = ({random_seed_in, zero_duration_in, t_in}) => s0_model_point$m({random_seed_in, zero_duration_in, t_in})

export const s0_random$m = memoize(s0_random$, JSON.stringify);
export const s0_random = ({random_key_in, random_seed_in}) => s0_random$m({random_key_in, random_seed_in})

export const s1_premium_rate$m = memoize(s1_premium_rate$, JSON.stringify);
export const s1_premium_rate = ({premium_table_function_in, random_seed_in}) => s1_premium_rate$m({premium_table_function_in, random_seed_in})

export const s1_duration$m = memoize(s1_duration$, JSON.stringify);
export const s1_duration = ({zero_duration_in, t_in, random_seed_in}) => s1_duration$m({zero_duration_in, t_in, random_seed_in})

export const s1_mort_rate3$m = memoize(s1_mort_rate3$, JSON.stringify);
export const s1_mort_rate3 = ({mort_table_function_in, random_seed_in, zero_duration_in, t_in}) => s1_mort_rate3$m({mort_table_function_in, random_seed_in, zero_duration_in, t_in})

export const s1_mort_rate$m = memoize(s1_mort_rate$, JSON.stringify);
export const s1_mort_rate = ({mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in}) => s1_mort_rate$m({mort_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in})

export const s1_mort_rate2$m = memoize(s1_mort_rate2$, JSON.stringify);
export const s1_mort_rate2 = ({zero_duration_in, t_in, random_seed_in}) => s1_mort_rate2$m({zero_duration_in, t_in, random_seed_in})

export const s1_age$m = memoize(s1_age$, JSON.stringify);
export const s1_age = ({random_seed_in, zero_duration_in, t_in}) => s1_age$m({random_seed_in, zero_duration_in, t_in})

export const s1_pols_if_init$m = memoize(s1_pols_if_init$, JSON.stringify);
export const s1_pols_if_init = ({}) => s1_pols_if_init$m({})

export const s1_pols_if_at$m = memoize(s1_pols_if_at$, JSON.stringify);
export const s1_pols_if_at = ({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in}) => s1_pols_if_at$m({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in})

export const s1_pols_lapse$m = memoize(s1_pols_lapse$, JSON.stringify);
export const s1_pols_lapse = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in}) => s1_pols_lapse$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in})

export const s1_pols_maturity$m = memoize(s1_pols_maturity$, JSON.stringify);
export const s1_pols_maturity = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in}) => s1_pols_maturity$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in})

export const s1_pols_new_biz$m = memoize(s1_pols_new_biz$, JSON.stringify);
export const s1_pols_new_biz = ({zero_duration_in, t_in, random_seed_in}) => s1_pols_new_biz$m({zero_duration_in, t_in, random_seed_in})

export const s1_pols_death$m = memoize(s1_pols_death$, JSON.stringify);
export const s1_pols_death = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in}) => s1_pols_death$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in})

export const s1_claim_pp$m = memoize(s1_claim_pp$, JSON.stringify);
export const s1_claim_pp = ({}) => s1_claim_pp$m({})

export const s1_premium_pp$m = memoize(s1_premium_pp$, JSON.stringify);
export const s1_premium_pp = ({premium_table_function_in, random_seed_in}) => s1_premium_pp$m({premium_table_function_in, random_seed_in})

export const s1_premiums$m = memoize(s1_premiums$, JSON.stringify);
export const s1_premiums = ({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in}) => s1_premiums$m({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in})

export const s1_claims$m = memoize(s1_claims$, JSON.stringify);
export const s1_claims = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in}) => s1_claims$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in})

export const s1_expense_acq$m = memoize(s1_expense_acq$, JSON.stringify);
export const s1_expense_acq = ({}) => s1_expense_acq$m({})

export const s1_expense_maint$m = memoize(s1_expense_maint$, JSON.stringify);
export const s1_expense_maint = ({}) => s1_expense_maint$m({})

export const s1_inflation_rate$m = memoize(s1_inflation_rate$, JSON.stringify);
export const s1_inflation_rate = ({}) => s1_inflation_rate$m({})

export const s1_inflation_rate_mth$m = memoize(s1_inflation_rate_mth$, JSON.stringify);
export const s1_inflation_rate_mth = ({}) => s1_inflation_rate_mth$m({})

export const s1_inflation_factor$m = memoize(s1_inflation_factor$, JSON.stringify);
export const s1_inflation_factor = ({t_in}) => s1_inflation_factor$m({t_in})

export const s1_expenses$m = memoize(s1_expenses$, JSON.stringify);
export const s1_expenses = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in}) => s1_expenses$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in})

export const s1_commissions$m = memoize(s1_commissions$, JSON.stringify);
export const s1_commissions = ({zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in}) => s1_commissions$m({zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in})

export const s1_net_cf$m = memoize(s1_net_cf$, JSON.stringify);
export const s1_net_cf = ({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in}) => s1_net_cf$m({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in})

export const s1_proj_len$m = memoize(s1_proj_len$, JSON.stringify);
export const s1_proj_len = ({random_seed_in, zero_duration_in}) => s1_proj_len$m({random_seed_in, zero_duration_in})

export const s1_net_premium_pp$m = memoize(s1_net_premium_pp$, JSON.stringify);
export const s1_net_premium_pp = ({random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_net_premium_pp$m({random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_is_active$m = memoize(s1_is_active$, JSON.stringify);
export const s1_is_active = ({zero_duration_in, t_in, random_seed_in}) => s1_is_active$m({zero_duration_in, t_in, random_seed_in})

export const s1_pv_claims$m = memoize(s1_pv_claims$, JSON.stringify);
export const s1_pv_claims = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_claims$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_claims$m = memoize(s1_pv_fut_claims$, JSON.stringify);
export const s1_pv_fut_claims = ({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_claims$m({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_premiums$m = memoize(s1_pv_premiums$, JSON.stringify);
export const s1_pv_premiums = ({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_premiums$m({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_premiums$m = memoize(s1_pv_fut_premiums$, JSON.stringify);
export const s1_pv_fut_premiums = ({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_premiums$m({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_expenses$m = memoize(s1_pv_expenses$, JSON.stringify);
export const s1_pv_expenses = ({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_expenses$m({zero_duration_in, t_in, random_key_in, random_seed_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_expenses$m = memoize(s1_pv_fut_expenses$, JSON.stringify);
export const s1_pv_fut_expenses = ({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_expenses$m({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_commissions$m = memoize(s1_pv_commissions$, JSON.stringify);
export const s1_pv_commissions = ({zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_commissions$m({zero_duration_in, t_in, random_key_in, random_seed_in, premium_table_function_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_commissions$m = memoize(s1_pv_fut_commissions$, JSON.stringify);
export const s1_pv_fut_commissions = ({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_commissions$m({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_net_cf$m = memoize(s1_pv_net_cf$, JSON.stringify);
export const s1_pv_net_cf = ({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_net_cf$m({premium_table_function_in, random_key_in, random_seed_in, zero_duration_in, t_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_net_cf$m = memoize(s1_pv_fut_net_cf$, JSON.stringify);
export const s1_pv_fut_net_cf = ({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_net_cf$m({t_in, random_key_in, random_seed_in, zero_duration_in, premium_table_function_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pols_if$m = memoize(s1_pols_if$, JSON.stringify);
export const s1_pols_if = ({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in}) => s1_pols_if$m({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in})

export const s1_pv_pols_if$m = memoize(s1_pv_pols_if$, JSON.stringify);
export const s1_pv_pols_if = ({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_pols_if$m({zero_duration_in, t_in, random_key_in, random_seed_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_pv_fut_pols_if$m = memoize(s1_pv_fut_pols_if$, JSON.stringify);
export const s1_pv_fut_pols_if = ({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in}) => s1_pv_fut_pols_if$m({t_in, random_key_in, random_seed_in, zero_duration_in, timing_in, mort_table_function_in, disc_rate_ann_table_function_in})

export const s1_disc_rate_ann$m = memoize(s1_disc_rate_ann$, JSON.stringify);
export const s1_disc_rate_ann = ({disc_rate_ann_table_function_in, t_in}) => s1_disc_rate_ann$m({disc_rate_ann_table_function_in, t_in})

export const s1_disc_rate_mth$m = memoize(s1_disc_rate_mth$, JSON.stringify);
export const s1_disc_rate_mth = ({disc_rate_ann_table_function_in, t_in}) => s1_disc_rate_mth$m({disc_rate_ann_table_function_in, t_in})

export const s1_disc_factor$m = memoize(s1_disc_factor$, JSON.stringify);
export const s1_disc_factor = ({disc_rate_ann_table_function_in, t_in}) => s1_disc_factor$m({disc_rate_ann_table_function_in, t_in})

export const s1_lapse_rate$m = memoize(s1_lapse_rate$, JSON.stringify);
export const s1_lapse_rate = ({zero_duration_in, t_in, random_seed_in}) => s1_lapse_rate$m({zero_duration_in, t_in, random_seed_in})
  // from https://cdn.jsdelivr.net/npm/underscore@1.13.6/underscore-esm.js

  // Memoize an expensive function by storing its results.
  function memoize(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  }

  // Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
}





export const t = s1_t;
export const premium_table_function = s1_premium_table_function;
export const zero_duration = s1_zero_duration;
export const premium_rate = s1_premium_rate;
export const mort_table_function = s1_mort_table_function;
export const duration = s1_duration;
export const mort_rate3 = s1_mort_rate3;
export const mort_rate = s1_mort_rate;
export const mort_rate2 = s1_mort_rate2;
export const age = s1_age;
export const pols_if_init = s1_pols_if_init;
export const timing = s1_timing;
export const pols_if_at = s1_pols_if_at;
export const pols_lapse = s1_pols_lapse;
export const pols_maturity = s1_pols_maturity;
export const pols_new_biz = s1_pols_new_biz;
export const pols_death = s1_pols_death;
export const claim_pp = s1_claim_pp;
export const premium_pp = s1_premium_pp;
export const premiums = s1_premiums;
export const claims = s1_claims;
export const expense_maint = s1_expense_maint;
export const inflation_rate = s1_inflation_rate;
export const inflation_factor = s1_inflation_factor;
export const expenses = s1_expenses;
export const commissions = s1_commissions;
export const net_cf = s1_net_cf;
export const proj_len = s1_proj_len;
export const net_premium_pp = s1_net_premium_pp;
export const pv_claims = s1_pv_claims;
export const pv_fut_claims = s1_pv_fut_claims;
export const pv_premiums = s1_pv_premiums;
export const pv_fut_premiums = s1_pv_fut_premiums;
export const pv_expenses = s1_pv_expenses;
export const pv_fut_expenses = s1_pv_fut_expenses;
export const pv_commissions = s1_pv_commissions;
export const pv_fut_commissions = s1_pv_fut_commissions;
export const pv_net_cf = s1_pv_net_cf;
export const pv_fut_net_cf = s1_pv_fut_net_cf;
export const pols_if = s1_pols_if;
export const pv_pols_if = s1_pv_pols_if;
export const pv_fut_pols_if = s1_pv_fut_pols_if;
export const disc_rate_ann_table_function = s1_disc_rate_ann_table_function;
export const disc_rate_ann = s1_disc_rate_ann;
export const disc_rate_mth = s1_disc_rate_mth;
export const disc_factor = s1_disc_factor;
export const lapse_rate = s1_lapse_rate;
export const lapse_rate_mth_orig = s1_lapse_rate_mth_;
export const mort_rate_mth_orig = s1_mort_rate_mth_;
export const is_active = s1_is_active






////////// defaults: ////

export const lapse_rate_mth = s0_lapse_rate_mth;
export const mort_rate_mth = s0_mort_rate_mth;
export const age_at_entry = s0_age_at_entry;
export const sex = s0_sex;
export const policy_term = s0_policy_term;
export const policy_count = s0_policy_count;
export const sum_assured = s0_sum_assured;
export const duration_mth_r = s0_duration_mth_r;
export const duration_mth = s0_duration_mth;
export const model_point = s0_model_point;
export const random_seed = s0_random_seed;
export const random = s0_random;
export const random_key = s0_random_key



