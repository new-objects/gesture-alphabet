import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

export default class HandTracking {
  events = {};
  hands;
  videoId;
  videoEl;
  webcamWidth;
  webcamHeight;
  tracker;
  result;

  constructor(options) {
    this.videoId = options?.videoEl || 'webcam';
    this.hands = options?.hands || 1;
    this.videoEl = document.querySelector(`#${this.videoId}`);
    if (!this.videoEl) {
      this.videoEl = document.createElement('video');
      this.videoEl.setAttribute('id', this.videoId);

      document.body.appendChild(this.videoEl);
      // throw new Error('No video element found');
    }
    this.totalTime = 0;
    this.lastVideoTime = -1;

    this.#loadGestureRecognizer()
      .then(result => {
        this.tracker = result;
        console.log('HandTracking initialized');
      })
      .then(() => {
        this.#initVideo();
        console.log('Video initialized');
      })
      .catch(err => {
        console.error(err);
      });
  }

  on(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(fn => fn(data));
    }
  }

  async #loadGestureRecognizer() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );
    return GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
        delegate: 'GPU',
      },
      numHands: this.hands,
      runningMode: 'VIDEO',
    });
  }

  async #initVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoEl.srcObject = stream;

      const tracks = stream.getVideoTracks();
      if (tracks?.length > 0) {
        const trackSettings = tracks[0].getSettings();
        this.webcamHeight = trackSettings.height;
        this.webcamWidth = trackSettings.width;
        console.dir(
          `Camera settings: width: ${trackSettings.width} height: ${trackSettings.height} facingMode: ${trackSettings.facingMode}`,
        );
      }

      await new Promise(resolve => {
        this.videoEl.addEventListener(
          'loadedmetadata',
          () => {
            this.videoEl.play();
            resolve();
          },
          { once: true },
        );
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Returns the raw data of mediapipe hand tracking module for Video streams
   */
  getResultRaw() {
    if (!this.tracker) {
      return this;
    }
    if (this.videoEl.readyState !== this.videoEl.HAVE_ENOUGH_DATA) {
      return this;
    }
    /** @type {import('@mediapipe/tasks-vision').GestureRecognizerResult} */
    this.result = this.tracker.recognizeForVideo(this.videoEl, Date.now());

    return this.result;
  }

  /**
   * Returns an objects with x, y values and gesture for the tracked hands
   * @param {Number} width - width of the game
   * @returns {Object} - An object containing x, y and gesture per tracked hand
   */
  getHands(width, height) {
    const hands = { detected: false };
    const trackingResultsRaw = this.getResultRaw();

    if (trackingResultsRaw.landmarks?.length > 0) {
      hands.detected = true;
      trackingResultsRaw.handedness.forEach((hand, index) => {
        const handName =
          hand[0].categoryName === 'Left' ? 'handLeft' : 'handRight'; // left or right

        const { x, y } = trackingResultsRaw.landmarks[index][9];

        const gesture = trackingResultsRaw.gestures[index][0].categoryName;

        hands[handName] = {
          handName,
          x: width - x * width || 0,
          y: y * height || 0,
          gesture,
          x_raw: x,
          y_raw: y,
        };

        // Emit if gesture is "openFist"
        if (
          gesture === 'Closed_Fist' ||
          gesture === 'Open_Palm' ||
          gesture === 'Thumbs_Down' ||
          gesture === 'Thumbs_Up'
        ) {
          this.emit('gestureDetected', hands[handName]);
        }
      });
    } else {
      hands.detected = false;
    }

    return hands;
  }
}
