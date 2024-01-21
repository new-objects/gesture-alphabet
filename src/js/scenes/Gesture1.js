import Phaser from 'phaser';
import HandTracking from './game/HandTracking';

export default class G1 extends Phaser.Scene {
  handSprites = {};
  rectSprites = {};

  constructor() {
    super('G1');
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
    // switch scenes
    this.input.keyboard.once(
      'keydown-SPACE',
      () => {
        this.scene.start('G2');
      },
      this,
    );

    // bg
    this.add.image(400, 300, 'sky');

    // left hand
    this.handSprites.handLeft = createHandSprite.call(this, -150);
    this.rectSprites.handLeft = createRectangle.call(this, 0);

    // right hand
    this.handSprites.handRight = createHandSprite.call(this, 100);
    this.rectSprites.handRight = createRectangle.call(this, 400);

    const lineLeft = new Phaser.Geom.Line(200, 50, 200, 500);
    const lineRight = new Phaser.Geom.Line(
      this.width - 200,
      50,
      this.width - 200,
      500,
    );

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
      updateHandPosition.call(
        this,
        this.handSprites.handLeft,
        trackedHands.handLeft,
      );

      // update the right circle
      updateHandPosition.call(
        this,
        this.handSprites.handRight,
        trackedHands.handRight,
      );
    }
  }
}

function handleGesture(hand) {
  const sprite = this.handSprites[hand.handName];

  if (hand.gesture === 'Closed_Fist') {
    sprite.fillColor = 0xffff00;
    // sync rect and sphere's y-value
    this.rectSprites[hand.handName].y = this.handSprites[hand.handName].y;
  } else {
    sprite.fillColor = 0xe4bfc8;
  }
}

function createRectangle(xOffset) {
  const rect = this.add.rectangle(200 + xOffset, 50, 10, 10, 0x0000ff);
  this.physics.add.existing(rect);

  return rect;
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
