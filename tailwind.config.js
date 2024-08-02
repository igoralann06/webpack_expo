const colors = require('./src/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        'roboto-black': ['roboto-black'],
        'roboto-black-italic': ['roboto-black-italic'],
        'roboto-bold': ['roboto-bold'],
        'roboto-bold-italic': ['roboto-bold-italic'],
        'roboto-regular': ['roboto-regular'],
        'roboto-italic': ['roboto-italic'],
        'roboto-light': ['roboto-light'],
        'roboto-light-italic': ['roboto-light-italic'],
        'roboto-medium': ['roboto-medium'],
        'roboto-medium-italic': ['roboto-medium-italic'],
        'roboto-thin': ['roboto-thin'],
        'roboto-thin-italic': ['roboto-thin-italic'],
      },
      colors,
    },
  },
  plugins: [],
};
