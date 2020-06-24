# Adapted from https://github.com/k-sys/covid-19/blob/master/Realtime%20R0.ipynb

# Libraries required for the web version
import pandas as pd
import numpy as np
from scipy import stats as sps
from scipy.interpolate import interp1d

def prepare_cases(cases):
    new_cases = cases.diff()

    smoothed = new_cases.rolling(7,
        win_type='gaussian',
        min_periods=1,
        center=True).mean(std=2).round()

    original = new_cases.loc[smoothed.index]

    return original, smoothed

def get_posteriors(sr, sigma=0.15):

    # We create an array for every possible value of Rt
    R_T_MAX = 12
    r_t_range = np.linspace(0, R_T_MAX, R_T_MAX*100+1)

    # Gamma is 1/serial interval
    # https://wwwnc.cdc.gov/eid/article/26/7/20-0282_article
    # https://www.nejm.org/doi/full/10.1056/NEJMoa2001316
    GAMMA = 1/7

    # (1) Calculate Lambda
    lam = sr[:-1].values * np.exp(GAMMA * (r_t_range[:, None] - 1))


    # (2) Calculate each day's likelihood
    likelihoods = pd.DataFrame(
        data = sps.poisson.pmf(sr[1:].values, lam),
        index = r_t_range,
        columns = sr.index[1:])

    # (3) Create the Gaussian Matrix
    process_matrix = sps.norm(loc=r_t_range,
                              scale=sigma
                             ).pdf(r_t_range[:, None])

    # (3a) Normalize all rows to sum to 1
    process_matrix /= process_matrix.sum(axis=0)

    # (4) Calculate the initial prior
    prior0 = np.ones_like(r_t_range)/len(r_t_range)
    prior0 /= prior0.sum()

    # Create a DataFrame that will hold our posteriors for each day
    # Insert our prior as the first posterior.
    posteriors = pd.DataFrame(
        index=r_t_range,
        columns=sr.index,
        data={sr.index[0]: prior0}
    )

    # We said we'd keep track of the sum of the log of the probability
    # of the data for maximum likelihood calculation.
    log_likelihood = 0.0

    # (5) Iteratively apply Bayes' rule
    for previous_day, current_day in zip(sr.index[:-1], sr.index[1:]):

        #(5a) Calculate the new prior
        current_prior = process_matrix @ posteriors[previous_day]

        #(5b) Calculate the numerator of Bayes' Rule: P(k|R_t)P(R_t)
        numerator = likelihoods[current_day] * current_prior

        #(5c) Calculate the denominator of Bayes' Rule P(k)
        denominator = np.sum(numerator)

        # Execute full Bayes' Rule
        posteriors[current_day] = numerator/denominator

        # Add to the running sum of log likelihoods
        log_likelihood += np.log(denominator)

    return posteriors, log_likelihood

def highest_density_interval(pmf, p=.9, debug=False):
    # If we pass a DataFrame, just call this recursively on the columns
    if(isinstance(pmf, pd.DataFrame)):
        return pd.DataFrame([highest_density_interval(pmf[col], p=p) for col in pmf],
                            index=pmf.columns)

    cumsum = np.cumsum(pmf.values)

    # N x N matrix of total probability mass for each low, high
    total_p = cumsum - cumsum[:, None]

    # Return all indices with total_p > p
    lows, highs = (total_p > p).nonzero()

    # Find the smallest range (highest density)
    best = (highs - lows).argmin()

    low = pmf.index[lows[best]]
    high = pmf.index[highs[best]]

    return pd.Series([low, high],
                     index=[f'Low_{p*100:.0f}',
                            f'High_{p*100:.0f}'])

# High level method for computing the rate of spread over time
def compute_r_t(historical_case_counts):

    # Check required columns are included in the provided input
    for required_column in ['cases', 'dates']:
        if required_column not in historical_case_counts:
            raise ValueError(f'Input is missing required column {required_column}')

    case_df = pd.Series(historical_case_counts['cases'], index=historical_case_counts['dates'])
    case_df.index = pd.to_datetime(case_df.index)
    case_df.index.name = 'date'
    case_df.sort_index(inplace=True)

    # counts must be cumulative; reject any that are obviously not
    # (i.e. their values decrease over time)
    if case_df.diff().min() < 0:
        raise ValueError(
            'Case counts must be cumulative and monotonically increasing')

    _, smoothed = prepare_cases(case_df)

    # Raise an error if there are not enough valid cases to use
    # we need at least two days to represent change over time
    if len(smoothed) < 2:
        raise ValueError('Not enough data to compute R(t);'
            ' at least two days of non-repeating case counts are required')

    # Note that we're fixing sigma to a value just for the example
    posteriors, _ = get_posteriors(smoothed, sigma=.25)

    # Note that this takes a while to execute - it's not the most efficient algorithm
    try:
        hdis = highest_density_interval(posteriors, p=.9)
    except:
        raise ValueError('Unable to compute R(t) with the provided data')

    most_likely = posteriors.idxmax().rename('ML')
    # the first day is not a valid value because it has no priors; exclude it
    result = pd.concat([most_likely, hdis], axis=1).iloc[1:]
    # smooth the final result to reduce noise from infrequent testing
    result = result.rolling(7, win_type='gaussian',
                            min_periods=1, center=True).mean(std=2).round(2)
    return result
