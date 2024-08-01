// the following is based on the lifelib BasicTerm_SE model
// @ https://lifelib.io/libraries/basiclife/BasicTerm_SE.html

// b3784

export const t = () => t_in

export const age_at_entry = () => age_at_entry_in
export const sex = () => sex_in
export const policy_term = () => policy_term_in
export const policy_count = () => policy_count_in
export const sum_assured = () => sum_assured_in

export const duration_mth = () => {
  if (zero_duration() && t() <= 0) return 0;
  return duration_mth_in+t()
  //if (t() <= 0) return duration_mth_in
  //else return duration_mth({ t_in: t() - 1 }) + 1
}

export const premium_table_function = () => premium_table_function_in

export const zero_duration = () => zero_duration_in

export const premium_rate = () => 
  premium_table_function()()
    .find(d => d.age_at_entry == age_at_entry() && d.policy_term == policy_term())
    .premium_rate;

export const mort_table_function = () => mort_table_function_in

// duration (in years):
export const duration = () => Math.floor(duration_mth() / 12)

// splitting mort_rate into interim functions due to a calculang bug
// anon fn breaks with dep on duration ! BUG
export const mort_rate3 = () => mort_table_function()().find(d => d.Age == age())
export const mort_rate = () => mort_rate3()[mort_rate2()]

//const clamp = (min,max,value) => Math.max(min,Math.min(max,value)) // doesn't work; gets definition/links (I think Number.prototype works)

export const mort_rate2 = () => Math.max(0, Math.min(5, duration()))


export const mort_rate_mth = () => 1 - (1 - mort_rate()) ** (1 / 12)

export const age = () => age_at_entry() + Math.floor(duration_mth() / 12)//duration()

// life.cul.js gives IF projections by default
// override pols_if_init (but not policy_count) to 0 for NB projections (pols_new_biz)
export const pols_if_init = () => {
  return policy_count()
}

export const timing = () => timing_in

// experience should come in as NB
// NB vs. IF ...
export const pols_if_at = () => {
  if (is_active() == 0) return 0 // todo tidy is_active logic
  // works, but also appear as NB
  //if (t() == -duration_mth({t_in:0}) && timing() == 'BEF_MAT') // DN <= for past
    //return 0//pols_if_init() // needs experience
    // todo setup init for super old?
  if (timing() == 'BEF_MAT') {
    if (t() == 0 && pols_if_init()) // pols_if_init makes model an IF model; otherwise pols_new_biz populated
      return pols_if_init();
    return pols_if_at({ t_in: t() - 1, timing_in: 'BEF_DECR' }) - pols_lapse({ t_in: t() - 1 }) - pols_death({ t_in: t() - 1 })
  }
  if (timing() == 'BEF_NB') {
    return pols_if_at({ timing_in: 'BEF_MAT' }) - pols_maturity()
  }
  if (timing() == 'BEF_DECR') return pols_if_at({ timing_in: 'BEF_NB' }) + pols_new_biz()
  return console.error('bad timing_in !')
}

export const pols_lapse = () => is_active() ? (pols_if_at({ timing_in: 'BEF_DECR' }) - pols_death()) * lapse_rate_mth() : 0

// refactor for stress and experience logic
export const lapse_rate_mth = () => (1 - (1 - lapse_rate()) ** (1 / 12))

export const pols_maturity = () => {
  if (duration_mth() == policy_term() * 12)
    return pols_if_at({ timing_in: 'BEF_MAT' })
  else return 0
}

// Q: IF run from start, treat as NB?? Not doing so atm
//   // if (duration_mth({t_in:t()}) == 0 && duration_mth({t_in:0}) > 0) // this type of line is calculang bug if I exclude t_in:t() TOFIX
export const pols_new_biz = () => {
  if (duration_mth() == 0 && !pols_if_init())
    return policy_count()
  else return 0
}

export const pols_death = () => is_active() ? pols_if_at({ timing_in: 'BEF_DECR' }) * mort_rate_mth() : 0;

export const claim_pp = () => sum_assured()

// monthly
export const premium_pp = () => Math.round(sum_assured() * premium_rate() * 100) / 100 // round 2 decimal places

export const premiums = () => premium_pp() * pols_if_at({ timing_in: 'BEF_DECR' })
export const claims = () => -claim_pp() * pols_death()

export const expense_acq = () => 300
export const expense_maint = () => 60

export const inflation_rate = () => 0.01
export const inflation_rate_mth = () => (1 + inflation_rate()) ** (1 / 12) - 1 // probably a slow formula, but not tied to high-cardinality inputs?

//export const inflation_factor = () => (1 + inflation_rate()) ** (t() / 12)
// refactor to support easier stress/delay logic (tested 0 impact on 500 pols, todo refresh complete test)
export const inflation_factor = () => {
  // hindcasting expense inflation, is this right? Replace with other actuals?
  if (t() < 0) return inflation_factor({t_in:t()+1})/(1+inflation_rate_mth())
  if (t() == 0) return 1;
  else return inflation_factor({t_in:t()-1})*(1+inflation_rate_mth())
}

export const expenses = () => -(expense_acq() * pols_new_biz() + pols_if_at({ timing_in: 'BEF_DECR' }) * expense_maint() / 12 * inflation_factor())

export const commissions = () => duration() == 0 ? -premiums() : 0

export const net_cf = () => premiums() + claims() + expenses() + commissions()


export const proj_len = () => Math.max(12 * policy_term() - duration_mth({ t_in: 0 }) + 1, 0)

export const net_premium_pp = () => -pv_fut_claims({ t_in: 0, zero_duration_in: true, timing_in: 'BEF_DECR' }) / pv_fut_pols_if({ t_in: 0, zero_duration_in: true, timing_in: 'BEF_DECR' }) // no-impact bug: not correctly summarised over timing_in?


// todo think re actuals (new)
export const is_active = () => !(duration_mth() < 0 || duration_mth() > policy_term() * 12)
//export const is_active = () => ((duration_mth() >= 0) && (duration_mth() <= /* maturity edit DN: is this a lifelib issue? */ policy_term() * 12) ? 1 : 0)


// I like idea of this relating to month, and sep pv_fut_claims
export const pv_claims = () => claims() * disc_factor()

export const pv_fut_claims = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_claims({ t_in: t() + 1 }) + pv_claims()) / (1 + 0)
}

export const pv_premiums = () => premiums() * disc_factor()

export const pv_fut_premiums = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_premiums({ t_in: t() + 1 }) + pv_premiums()) / (1 + 0)
}

export const pv_expenses = () => expenses() * disc_factor()

export const pv_fut_expenses = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_expenses({ t_in: t() + 1 }) + pv_expenses()) / (1 + 0)
}

export const pv_commissions = () => commissions() * disc_factor()

export const pv_fut_commissions = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_commissions({ t_in: t() + 1 }) + pv_commissions()) / (1 + 0)
}


export const pv_net_cf = () => net_cf() * disc_factor()

export const pv_fut_net_cf = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_net_cf({ t_in: t() + 1 }) + pv_net_cf()) / (1 + 0)
}

export const pols_if = () => pols_if_at(/*{ timing_in: 'BEF_DECR' }*/);

export const pv_pols_if = () => pols_if() * disc_factor()


export const pv_fut_pols_if = () => {
  if (t() >= proj_len()) return 0 // redundant when pols if reaches 0? keep?
  return (pv_fut_pols_if({ t_in: t() + 1 }) + pv_pols_if()) / (1 + 0)
}


export const disc_rate_ann_table_function = () => disc_rate_ann_table_function_in

export const disc_rate_ann = () => disc_rate_ann_table_function()()[Math.floor(t() / 12)].zero_spot

export const disc_rate_mth = () => (1 + disc_rate_ann()) ** (1 / 12) - 1

export const disc_factor = () => (1 + disc_rate_mth()) ** (-t())

export const lapse_rate = () => Math.max(0.1 - 0.02 * duration(), 0.02)

// custom memo hash function for better perf than JSON.stringify:
//export const memo_hash = ({formula, model_id, input_cursor_id, ...o}) => Object.values(o)

// const { max, min, floor } = Math // This causes an issue when concated >1 in bundle
