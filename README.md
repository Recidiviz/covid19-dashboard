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

Serves from <http://localhost:8000/>.

If you want to a specific port, like 1234, just add `--port 1234`.

### Production

```sh
yarn build
```

Built files can be found in `public/`.

An easy way to test out the built files:

```sh
yarn gatsby serve
```

If you want to a specific port, like 1234, just add `--port 1234`.

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
