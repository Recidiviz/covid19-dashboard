## Run locally

You'll need access to the Firebase project at https://console.firebase.google.com/project/c19-backend.

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

(Python cloud functions)[https://cloud.google.com/functions/docs/quickstart-python] are not
administered by Firebase, though they are associated
with the same project specified above, so you will need the same access to administer them.

They live in `backend/python-functions/main.py`.

## Testing locally

In `python-functions` set up your virtual environment:

```sh
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

Unlike Firebase, we don't have tools to emulate these functions locally.
But we can write tests against them, in `python-functions/test.py`. Run them with:

```sh
python -m unittest
```

## Deployment

Deploy the functions using the `gcloud` command line tool for Google Cloud Platform.

```sh
gcloud functions deploy <FUNCTION_NAME> --runtime python37 --trigger-http --allow-unauthenticated
```
