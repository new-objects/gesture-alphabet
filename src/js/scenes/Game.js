import Phaser from 'phaser';
import HandTracking from './game/HandTracking';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
    // init hand tracking
    this.handTracking = new HandTracking({ hands: 2 });

    // register event handler
    this.handTracking.on('gestureDetected', handleGesture.bind(this));

    this.width = 800;
    this.height = 600;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    // bg
    this.add.image(400, 300, 'sky');

    // left hand
    this.leftHandSprite = createHandSprite.call(this, -150);

    // right hand
    this.rightHandSprite = createHandSprite.call(this, 100);

    const lineLeft = new Phaser.Geom.Line(200, 50, 200, 500);
    const lineRight = new Phaser.Geom.Line(
      this.width - 200,
      50,
      this.width - 200,
      500,
    );
    // const cursorRect = new Phaser.Geom.Rectangle(200, 200, 300, 200);

    const graphics = this.add.graphics({
      lineStyle: { width: 4, color: 0xaa00aa },
    });
    graphics.strokeLineShape(lineLeft);
    graphics.strokeLineShape(lineRight);
  }

  update() {
    const trackedHands = this.handTracking.getHands(this.width, this.height);
    if (trackedHands.detected) {
      // update the left circle
      updateHandPosition.call(this, this.leftHandSprite, trackedHands.handLeft);

      // update the right circle
      updateHandPosition.call(
        this,
        this.rightHandSprite,
        trackedHands.handRight,
      );
    }
  }
}

function handleGesture(hand) {
  const sprite =
    hand.handName === 'handLeft' ? this.leftHandSprite : this.rightHandSprite;

  sprite.fillColor = hand.gesture === 'Closed_Fist' ? 0xffff00 : 0xe4bfc8;
}

function createHandSprite(xOffset) {
  const circle = this.add.circle(
    this.width * 0.5 + xOffset,
    this.height * 0.5,
    30,
    0xe4bfc8,
  );
  // Fill the circle with a color
  // circle.setStrokeStyle(6, 0xe4bfc8);
  // circle;
  this.physics.add.existing(circle);
  return circle;
}

function updateHandPosition(sprite, handData) {
  if (!handData) return;

  const { x, y } = handData;
  sprite.setX(x);
  sprite.setY(y);
  sprite.body.reset(x, y);
}
