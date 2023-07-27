import self from "../img/self.png";
import mock1 from "../img/mock1.png";

export let colors = ["rgb(0,255,164)", "rgb(166,104,255)"];

/*
I highly recommend using a gradient generator like https://gradientgenerator.paytonpierce.dev/ to generate a pair of colors that you like.
These colors will be used to style your name on the homepage, the background of your picture, and some other accents throughout
the site.
 */

export const info = {
  firstName: "Peter",
  lastName: "Argany",
  initials: "pa", // the example uses first and last, but feel free to use three or more if you like.
  position: "a Sofware Engineer",
  selfPortrait: self, // don't change this unless you want to name your self-portrait in the "img" folder something else!
  gradient: `-webkit-linear-gradient(135deg, ${colors})`, // don't change this either
  baseColor: colors[0],
  miniBio: [
    {
      emoji: "☕",
      text: "fueled by coffee",
    },
    {
      emoji: "🌎",
      text: "based in San Francisco, California",
    },
    {
      emoji: "🍁",
      text: "from Toronto, Canada",
    },
    {
      emoji: "💼",
      text: "Software Engineer at Retool",
    },
    {
      emoji: "📧",
      text: "pargany81@gmail.com",
    },
  ],
  socials: [
    {
      link: "https://github.com/PeteTheHeat",
      icon: "fa fa-github",
      label: "github",
    },
    {
      link: "https://www.linkedin.com/in/peterargany/",
      icon: "fa fa-linkedin",
      label: "linkedin",
    },
    {
      link: "https://twitter.com/peterargany",
      icon: "fa fa-twitter",
      label: "twitter",
    },
  ],
  bio: "Hi! I'm Peter. I'm a software engineer at Retool. I studied Computer Engineering at the University of Waterloo. I enjoy going down rabbit holes and learning new things.",
  skills: {
    proficientWith: [
      "react",
      "react native",
      "node.js",
      "javascript",
      "typescript",
      "objective-c",
      "rust",
      "python",
      "graphql",
    ],
  },
  hobbies: [
    {
      label: "golf",
      emoji: "⛳️",
    },
    {
      label: "weightlifting",
      emoji: "🏋️‍♂️",
    },
    {
      label: "reading",
      emoji: "📖",
    },
    {
      label: "cooking",
      emoji: "🌶",
    },
    {
      label: "cocktails",
      emoji: "🍸",
    },
  ],
  portfolio: [
    // This is where your portfolio projects will be detailed
    {
      title: "Project 1",
      live: "https://paytonpierce.dev", //this should be a link to the live version of your project, think github pages, netlify, heroku, etc. Or your own domain, if you have it.
      source: "https://github.com/paytonjewell", // this should be a link to the **repository** of the project, where the code is hosted.
      image: mock1,
    },
  ],
};
