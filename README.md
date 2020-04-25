# covid19-dashboard

COVID 19 Dashboard

## Setting up

```sh
npm install -g yarn
yarn install
```

### Development

```sh
yarn dev
```

To clean builds:

```sh
yarn clean
```

Serves from <http://localhost:1234>.

### Production

```sh
yarn build
```

Built files can be found in `/dist`.

An easy way to try running the built files:

```sh
bash -c "cd dist && npx serve"
```

### Authentication

Authentication and authorization are provided by [Auth0](https://auth0.com/).

The Auth0 tenant for the production, hosted instance of this app is controlled by Recidiviz.
If you are working with Recidiviz on the production instance, reach out to covid@recidiviz.org
about receiving your log in credentials.

### Tests

Automated tests can be run with [Jest](https://jestjs.io/) and
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro).
Should you need to inspect the Jest configuration, you will find it
in `/package.json` and `/setupTests.tsx`.

```sh
yarn test  # run the entire test suite
yarn test --watch  # re-run tests as you make changes. Pass any Jest options you like
```
