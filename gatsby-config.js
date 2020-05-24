/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    "gatsby-plugin-typescript",

    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-117977508-2",
        head: true,
      },
    },

    {
      resolve: "gatsby-plugin-segment-js",
      options: {
        prodKey: "eU6WeIwGhtdYhNGvienKPYXd60Q4jYdU",
        trackPage: true,
      },
    },

    {
      resolve: "gatsby-plugin-manifest",
      options: {
        short_name: "COVID-19",
        name: "COVID-19 Dashboard",
        icon: "src/components/site-metadata/icon-512.png",
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    },

    {
      resolve: "gatsby-plugin-prefetch-google-fonts",
      options: {
        fonts: [
          { family: "Libre Baskerville" },
          { family: "Poppins", variants: ["300", "400", "600"] },
          { family: "Rubik" },
        ],
      },
    },
  ],
};
