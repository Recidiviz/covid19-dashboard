## Run locally

The backend of the production app is hosted via Firebase, using Cloud Firestore
and Google Cloud Functions.

### Sign into Firebase

From the `backend` directory:

```
npm install -g firebase-tools
firebase login
```

### Start the functions

Install `nvm` if you don't have it already: https://github.com/nvm-sh/nvm#installing-and-updating

Run `nvm use`. If you get an error, you may need to install the configured node version using the `nvm` command in the
error.

```
cd functions
yarn install
firebase functions:config:get > .runtimeconfig.json
yarn serve
```

## Linting

```
yarn lint
```

## Set config

See https://firebase.google.com/docs/functions/config-env.

Example: `firebase functions:config:set auth0.domain='model-login.recidiviz.org'`

## Deploy security rules

From the `backend` directory:

```
firebase deploy --only firestore:rules
```

## Deploy the functions

From the `backend` directory:

```
yarn deploy
```

# Python cloud functions

[Python cloud functions](https://cloud.google.com/functions/docs/quickstart-python) are not
administered by Firebase, though they are associated
with the same project specified above, so you will need the same access to administer them.

They live in `backend/python-functions/main.py`.

## Testing

In `python-functions` set up your virtual environment:

```sh
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

Unlike in Firebase, we don't have tools to emulate these functions locally.
But we can write tests against them, in `python-functions/test.py`. Run them with:

```sh
python -m unittest
```

## Development

While we cannot emulate the Cloud Functions environment locally, we can deploy separate
development and production versions of the function to facilitate end-to-end development
and more rigorous pre-release testing.

All developers' local builds of the dashboard will consume the `development` version of
the function, so please be aware of how any changes you make will affect others and take
reasonable measures to avoid breaking it and let others know if it will be unavailable
or unstable for a time while you are actively developing it.

For local development of functions that need to interact with Google Cloud services, you
can save a service account private key to `backend/python-functions/service-account.json`
(it will be untracked) and export its path to an environment variable called
`GOOGLE_APPLICATION_CREDENTIALS`. Service clients from the Google Cloud Python API libraries
will consume this environment variable automatically. Please note this has no effect
on the deployed functions, it is to help with local development only.

See the "Deployment" section below for deployment instructions.

## Deployment

To deploy the functions, you will need the `gcloud` command line tool for Google Cloud Platform,
configured with access to the `c19-backend` project. However, to ensure proper configuration
of the deployed functions, you should use the deploy script in `python-functions/deploy.py`
rather than using `gcloud` directly.

To deploy a function, pass the deploy script the function name and target environment (`development`
or `production`):

```sh
python deploy.py calculate_whatever development
```

Deploying a function for development will result in a function URL with `_development` appended.
This is the only real difference between the "environments" but it allows the prod
endpoint to remain stable while changes are staged for pre-release testing.
