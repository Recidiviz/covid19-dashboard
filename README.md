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

### Environment variables

Default environment variables (for feature flags, etc) for local development can be found
in `.env-example`. You should copy them to `.env.development` (untracked) to properly configure
your development environment; this file will be consumed by Gatsby dev builds. Edit your local
`.env.development` as needed and commit new env vars to the example file when appropriate.

Environment variables for deployments are configured by Now. Let admins know when there are
new env vars that need to be set for Preview or Production deployments. (You can test them in
production builds locally with a `.env.production` file, also untracked.)

### Production

```sh
yarn build
```

Built files can be found in `public/`.

An easy way to test out the built files:

```sh
yarn serve
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

### Miscellaneous

* You'll want to install the [React Dev Tools](https://reactjs.org/tutorial/tutorial.html#developer-tools) in the browser
* If you're using VSCode, you may find these extensions helpful:
  * https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel
  * https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components
  * https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
  * https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
