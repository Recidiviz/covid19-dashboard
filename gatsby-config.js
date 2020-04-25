/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  plugins: [
    "gatsby-plugin-emotion",
    "gatsby-plugin-postcss",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    "gatsby-plugin-typescript",

    // prettier-ignore
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        short_name: "COVID-19",
        name: "COVID-19 Dashboard",
        icon: "src/site-metadata/icon-512.png",
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    },
  ],
};
