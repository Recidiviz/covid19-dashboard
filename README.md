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
bin/parcel build index.html
```

Built files can be found in `/dist`.

An easy way to try running the built files:

```sh
cd dist/
npx serve
```
