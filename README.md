# Using Hand Tracking (mediapipe) in a Phaser 3 project

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

This example demonstrates how to setup the `HandTracker` class in a Phaser 3 project.

## Tools / stack

- **[Phaser 3](https://phaser.io/)** for rendering 2D graphics
- [Vite](https://vitejs.dev/) for bundling
- [VanillaJS](http://vanilla-js.com/) (no framework)
- [TailwindCSS](https://tailwindcss.com/) for styling
- [PostCSS](https://postcss.org/) for CSS processing
- [ESLint](https://eslint.org/) for linting
- [Prettier](https://prettier.io/) for code formatting
- [GitHub actions](https://github.com/features/actions) for continuous integration

All tools are defined as **`dev-dependencies`**!

## Init the class

Copy the `HandTracking.js` to a fitting directory and import it to your **Game** class.

```js
import Phaser from 'phaser';
import HandTracking from './game/HandTracking';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
    // init hand tracking
    this.handTracking = new HandTracking({ hands: 2 });
  }
  //...
}
```

This will create an instance of HandTracking in `this.handTracking` and creates a `<video id="webcam"></video>` in the DOM tree, which will be the source for video feed sent to the tracker.

## Usage

To get the raw values from the traker use the `.getResultRaw()` method which is on every instance of HandTracking.

```js
const trackedHandsMediapipe = this.handTracking.getResultRaw();
```

As we often need mapped coordinates, we have a function that maps the raw values to the app's dimension - width and height.

```js
const trackedHands = this.handTracking.getHands(800, 600);
```

Look at the `update()` method how we only update the circles on the screen, if hands are detected. This is also a nice moment to look at the `updateHandPosition()` method which translates the hand coordinates to the sprite coordinates.

## Best practices

To hide the video output, use this **css** snippet:

```css
video#webcam {
  display: none;
}
```
