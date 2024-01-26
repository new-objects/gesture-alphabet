import Phaser from 'phaser';
import HandTracking from './game/HandTracking';

export default class G2 extends Phaser.Scene {
  handSprites = {};
  rectSprites = {};
  circles = {};

  constructor() {
    super('G2');
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
        this.scene.start('G1');
      },
      this,
    );
    // bg
    // this.add.image(400, 300, 'sky');

    this.graphics = this.add.graphics({
      lineStyle: { width: 4, color: 0xaa00aa },
    });

    // arc (x, y, radius, startAngle, endAngle, anticlockwise)
    this.circles.handRight = createArc.call(this, 550, 300, 45, 315);
    this.circles.handLeft = createArc.call(this, 200, 300, 225, 135);

    // left hand
    this.handSprites.handLeft = createHandSprite.call(this, -150);
    this.rectSprites.handLeft = createRectangle.call(this, 0);

    // right hand
    this.handSprites.handRight = createHandSprite.call(this, 100);
    this.rectSprites.handRight = createRectangle.call(this, 400);
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
  const handSprite = this.handSprites[hand.handName];
  const rectSprite = this.rectSprites[hand.handName];

  if (hand.gesture === 'Closed_Fist') {
    handSprite.fillColor = 0xffff00;
    // calculate x, y for the rectSprite
    const v = mapToArc(this.circles[hand.handName], hand);
    // add the circle offset to the vector
    rectSprite.y = v.y + this.circles[hand.handName].y;
    rectSprite.x = v.x + this.circles[hand.handName].x;
  } else {
    handSprite.fillColor = 0xe4bfc8;
  }
}

function createArc(x, y, degStart, degEnd) {
  const arc = this.add.arc(x, y, 90, degStart, degEnd, true);
  arc.setStrokeStyle(2, 0xaa00aa);

  return arc;
}

function createRectangle(xOffset) {
  const rect = this.add.rectangle(200 + xOffset, 50, 10, 10, 0x0000ff);
  this.physics.add.existing(rect);

  return rect;
}
/**
 * We calculate the vector between cirle center and hand position and scale it
 * down by creating a unit vector multiplied by the radius
 */
function mapToArc(circle, handPosition) {
  const v = new Phaser.Math.Vector2(
    handPosition.x - circle.x,
    handPosition.y - circle.y,
  );
  // create the unit vector (magnitude = 1)
  v.normalize();

  // scale it by radius
  v.scale(circle.radius);
  console.log(v.x, v.y);

  return v;
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

function updateHandPosition(sprite, handData, circle) {
  if (!handData) return;

  const { x, y } = handData;
  sprite.setX(x);
  sprite.setY(y);
  sprite.body.reset(x, y);
}
