# covid19.cjstatus.org

covid18.cjstatus.org is a project that helps address how we can keep our prison and greater community population safe and healthy as COVID-19 spreads.

## Getting Started

### Installing Dependencies

This project assumes that you have [Yarn](https://yarnpkg.com/) installed on your local machine. To install this project's dependencies, run the following command in this project's root:

```sh
yarn install
```

### Running the Project

To "run" this project locally, execute the following command:

```sh
yarn build-local
```

This will compile the stylesheet such that it can then be linked inside of an html file. To view this project, open the `index.html` file included the `src` directory.

### Deployment Instructions

To compile this project such that it's ready to be deployed in a production environment, run the following command:

```sh
yarn build-prod
```

This will compile the stylesheet and remove any styles that are not being used within the html. This is an important step as it reduced the CSS file's footprint from several megabytes to tens of kilobytes.

This command will copy all of the markup and stylesheet files into the `build` directory. Once there, these files can be copied and deployed to any static asset file host (i.e. Cloudfront, Netlify, GitHub Pages, etc.).

## Development Notes and Resources

This project uses [Tailwind CSS](https://tailwindcss.com/)\*, a utility-first CSS framework similar to [Tachyons](https://tachyons.io/) (which I believe is used for other recidiviz projects). This framework allows for the very rapid development of mobile-responsive websites without having to worry about writing much CSS, coming up with class names, or switching between markup and style files.

The downside of using this framework is that without some discipline and additional tooling, there is a lot of duplication and the code can get difficult to maintain pretty quickly. For example, as it stands, this is a very simple static website and each new page that gets added to it will have to copy elements such as the header. This will quickly become problematic as changes to the header will need to be made across each file it is included within. As this project progresses, I'd suggest using some sort of templating language that allows including different partials (such as the header, footer, layout, etc.) into a single website.

\*_May Adam have mercy on my soul._
