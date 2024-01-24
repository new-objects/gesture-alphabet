import '../css/style.css';

import Phaser from 'phaser';
import G1 from './scenes/Gesture1';
import G2 from './scenes/Gesture2';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [G2, G1],
});
