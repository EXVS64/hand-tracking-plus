class HandTrackingPlus {
    constructor() {
        this.id = 'handtrackingplus';

        /* ====== CONFIG ====== */
        this.SMOOTH_ALPHA = 0.35;
        this.HAND_TIMEOUT = 150;
        this.GESTURE_STABILITY_FRAMES = 3;
        this.PINCH_THRESHOLD = 55;
        this.FIST_THRESHOLD = 55; // ⭐ FIST THRESHOLD = 55 ⭐

        /* ====== STATE ====== */
        this.video = null;
        this.hands = null;
        this.results = null;
        this.smoothed = null;

        this.handPresent = false;
        this.lastSeen = 0;
        
        this._hatHandAppeared = false;
        this._hatHandDisappeared = false;
        this._hatPinchStart = false;
        this._hatPinchEnd = false;
        this.prevHandPresent = false;
        this.prevPinchActive = false;
        
        this.currentGesture = 'NONE';
        this.gestureFrames = 0;

        /* ====== CANVAS ====== */
        this.stageW = 480;
        this.stageH = 360;
        this.videoCanvas = null;
        this.videoCtx = null;
        this.bonesCanvas = null;
        this.bonesCtx = null;

        this.showCameraFlag = false;
        this.showBonesFlag = false;
        this.showContourFlag = false;
        this.cameraOpacity = 0.5;
        
        this.runtime = null;
        
        this.gestureHistory = [];
        this.MAX_GESTURE_HISTORY = 10;
    }

    getInfo() {
        return {
            id: this.id,
            name: 'Hand Tracking Plus',
            color1: '#4A90E2',
            color2: '#357ABD',
            blocks: [
                {
                    opcode: 'init',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'start hand tracking',
                    arguments: {}
                },

                {
                    opcode: 'showCamera',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'show camera background',
                    arguments: {}
                },
                {
                    opcode: 'hideCamera',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'hide camera background',
                    arguments: {}
                },
                {
                    opcode: 'setCameraOpacity',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'set camera opacity to [OPACITY]%',
                    arguments: {
                        OPACITY: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'showBones',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'show hand skeleton',
                    arguments: {}
                },
                {
                    opcode: 'hideBones',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'hide hand skeleton',
                    arguments: {}
                },
                {
                    opcode: 'showContour',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'show hand contour',
                    arguments: {}
                },
                {
                    opcode: 'hideContour',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'hide hand contour',
                    arguments: {}
                },

                {
                    opcode: 'whenHandAppears',
                    blockType: Scratch.BlockType.HAT,
                    text: 'when hand appears',
                    arguments: {}
                },
                {
                    opcode: 'whenHandDisappears',
                    blockType: Scratch.BlockType.HAT,
                    text: 'when hand disappears',
                    arguments: {}
                },
                {
                    opcode: 'whenPinchStarts',
                    blockType: Scratch.BlockType.HAT,
                    text: 'when pinch starts',
                    arguments: {}
                },
                {
                    opcode: 'whenPinchEnds',
                    blockType: Scratch.BlockType.HAT,
                    text: 'when pinch ends',
                    arguments: {}
                },

                {
                    opcode: 'handDetected',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'hand detected?',
                    arguments: {}
                },

                {
                    opcode: 'palmX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'palm X',
                    arguments: {}
                },
                {
                    opcode: 'palmY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'palm Y',
                    arguments: {}
                },
                {
                    opcode: 'fingerX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[F] X',
                    arguments: {
                        F: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'fingers'
                        }
                    }
                },
                {
                    opcode: 'fingerY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[F] Y',
                    arguments: {
                        F: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'fingers'
                        }
                    }
                },
                {
                    opcode: 'goToFinger',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'go to [F]',
                    arguments: {
                        F: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'fingers'
                        }
                    }
                },
                {
                    opcode: 'distanceToFinger',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'distance to [F]',
                    arguments: {
                        F: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'fingers'
                        }
                    }
                },

                {
                    opcode: 'pinchStrength',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'pinch strength',
                    arguments: {}
                },
                {
                    opcode: 'gripStrength',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'grip strength',
                    arguments: {}
                },
                {
                    opcode: 'handOpenness',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'hand openness',
                    arguments: {}
                },

                {
                    opcode: 'isFist',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is fist?',
                    arguments: {}
                },
                {
                    opcode: 'isOpenHand',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is open hand?',
                    arguments: {}
                },
                {
                    opcode: 'isPinching',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is pinching?',
                    arguments: {}
                },
                {
                    opcode: 'isPointing',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is pointing?',
                    arguments: {}
                },

                {
                    opcode: 'handTilt',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'hand tilt',
                    arguments: {}
                },
                {
                    opcode: 'handSize',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'hand size',
                    arguments: {}
                },
                {
                    opcode: 'handSpeed',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'hand speed',
                    arguments: {}
                },
                {
                    opcode: 'isLeftHand',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is left hand?',
                    arguments: {}
                },
                {
                    opcode: 'fingerExtended',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '[F] extended?',
                    arguments: {
                        F: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'fingers'
                        }
                    }
                }
            ],
            menus: {
                fingers: {
                    acceptReporters: false,
                    items: [
                        { text: 'Palm', value: 'PALM' },
                        { text: 'Thumb', value: 'THUMB' },
                        { text: 'Index', value: 'INDEX' },
                        { text: 'Middle', value: 'MIDDLE' },
                        { text: 'Ring', value: 'RING' },
                        { text: 'Pinky', value: 'PINKY' }
                    ]
                }
            }
        };
    }

    /* ================= INIT ================= */

    async init() {
        this.runtime = window.Scratch.vm ? window.Scratch.vm.runtime : null;
        
        await this._initVideo();
        await this._initCanvases();
        await this._initMediaPipe();
    }

    async _initVideo() {
        try {
            this.video = document.createElement('video');
            this.video.autoplay = true;
            this.video.playsInline = true;
            this.video.width = this.stageW;
            this.video.height = this.stageH;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: this.stageW },
                    height: { ideal: this.stageH },
                    facingMode: 'user'
                }
            });
            this.video.srcObject = stream;
            await new Promise(resolve => {
                this.video.onloadedmetadata = resolve;
            });
        } catch (error) {
            console.error('Camera error:', error);
            throw new Error('Could not access camera');
        }
    }

    async _initCanvases() {
        const stageCanvas = this._findStageCanvas();
        if (!stageCanvas) {
            console.warn('Stage canvas not found');
            return;
        }

        const parent = stageCanvas.parentElement;
        if (!parent) return;

        parent.style.position = parent.style.position || 'relative';

        this.videoCanvas = document.createElement('canvas');
        this.videoCanvas.width = this.stageW;
        this.videoCanvas.height = this.stageH;
        this.videoCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            opacity: ${this.cameraOpacity};
        `;
        parent.insertBefore(this.videoCanvas, stageCanvas);
        this.videoCtx = this.videoCanvas.getContext('2d');
        
        this.videoCtx.globalAlpha = this.cameraOpacity;

        this.bonesCanvas = document.createElement('canvas');
        this.bonesCanvas.width = this.stageW;
        this.bonesCanvas.height = this.stageH;
        this.bonesCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        `;
        parent.appendChild(this.bonesCanvas);
        this.bonesCtx = this.bonesCanvas.getContext('2d');
        
        this.contourCanvas = document.createElement('canvas');
        this.contourCanvas.width = this.stageW;
        this.contourCanvas.height = this.stageH;
        this.contourCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3;
            pointer-events: none;
        `;
        parent.appendChild(this.contourCanvas);
        this.contourCtx = this.contourCanvas.getContext('2d');
    }

    _findStageCanvas() {
        const canvases = document.querySelectorAll('canvas');
        for (const canvas of canvases) {
            if (canvas.width === this.stageW && canvas.height === this.stageH) {
                return canvas;
            }
        }
        return null;
    }

    async _initMediaPipe() {
        await this._loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await this._loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this._onResults(results));

        const camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.hands) {
                    await this.hands.send({ image: this.video });
                }
            },
            width: this.stageW,
            height: this.stageH
        });

        camera.start();
        
        this.prevPalmPosition = { x: 0, y: 0 };
        this.prevTime = Date.now();
    }

    /* ================= RESULTS ================= */

    _onResults(results) {
        const now = Date.now();
        const landmarks = results.multiHandLandmarks?.[0];
        const handedness = results.multiHandedness?.[0];
        
        const wasHandPresent = this.handPresent;
        
        if (landmarks && handedness?.score > 0.7) {
            this.lastSeen = now;
            this.handPresent = true;
            this._smoothLandmarks(landmarks);
            this.results = results;
            this.isLeft = handedness?.label === 'Left';
            
            const currentPalm = this._getCoordinate(0, 'x', 'y');
            const dt = (now - this.prevTime) / 1000;
            if (dt > 0 && this.prevPalmPosition.x !== 0) {
                const dx = currentPalm.x - this.prevPalmPosition.x;
                const dy = currentPalm.y - this.prevPalmPosition.y;
                this.handSpeedValue = Math.hypot(dx, dy) / dt;
            }
            this.prevPalmPosition = currentPalm;
            this.prevTime = now;
            
            this._updateGestures();
            
        } else if (now - this.lastSeen > this.HAND_TIMEOUT) {
            this.handPresent = false;
            this.smoothed = null;
            this.handSpeedValue = 0;
            this.currentGesture = 'NONE';
            this.gestureFrames = 0;
            this.gestureHistory = [];
        }
        
        this._updateHatTriggers(wasHandPresent);
        
        this._draw();
    }

    _smoothLandmarks(landmarks) {
        if (!this.smoothed) {
            this.smoothed = landmarks.map(point => ({ ...point }));
            return;
        }

        for (let i = 0; i < landmarks.length; i++) {
            this.smoothed[i].x = this.SMOOTH_ALPHA * this.smoothed[i].x +
                (1 - this.SMOOTH_ALPHA) * landmarks[i].x;
            this.smoothed[i].y = this.SMOOTH_ALPHA * this.smoothed[i].y +
                (1 - this.SMOOTH_ALPHA) * landmarks[i].y;
            this.smoothed[i].z = this.SMOOTH_ALPHA * (this.smoothed[i].z || 0) +
                (1 - this.SMOOTH_ALPHA) * (landmarks[i].z || 0);
        }
    }

    _updateHatTriggers(wasHandPresent) {
        const isHandPresent = this.handPresent;
        const isPinchActive = this.pinchStrength() > this.PINCH_THRESHOLD;
        
        if (isHandPresent && !wasHandPresent) {
            this._hatHandAppeared = true;
            if (this.runtime) {
                this.runtime.startHats(`${this.id}_whenHandAppears`);
            }
        } else if (!isHandPresent && wasHandPresent) {
            this._hatHandDisappeared = true;
            if (this.runtime) {
                this.runtime.startHats(`${this.id}_whenHandDisappears`);
            }
        }
        
        if (isPinchActive && !this.prevPinchActive) {
            this._hatPinchStart = true;
            if (this.runtime) {
                this.runtime.startHats(`${this.id}_whenPinchStarts`);
            }
        } else if (!isPinchActive && this.prevPinchActive) {
            this._hatPinchEnd = true;
            if (this.runtime) {
                this.runtime.startHats(`${this.id}_whenPinchEnds`);
            }
        }
        
        this.prevHandPresent = isHandPresent;
        this.prevPinchActive = isPinchActive;
    }

    _updateGestures() {
        const newGesture = this._detectCurrentGesture();
        
        this.gestureHistory.push(newGesture);
        if (this.gestureHistory.length > this.MAX_GESTURE_HISTORY) {
            this.gestureHistory.shift();
        }
        
        const gestureCounts = {};
        for (const gesture of this.gestureHistory) {
            gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1;
        }
        
        let mostCommonGesture = 'NONE';
        let maxCount = 0;
        for (const [gesture, count] of Object.entries(gestureCounts)) {
            if (count > maxCount) {
                mostCommonGesture = gesture;
                maxCount = count;
            }
        }
        
        if (mostCommonGesture !== this.currentGesture) {
            this.gestureFrames++;
            if (this.gestureFrames >= this.GESTURE_STABILITY_FRAMES) {
                this.currentGesture = mostCommonGesture;
                this.gestureFrames = 0;
            }
        } else {
            this.gestureFrames = 0;
        }
    }

    _detectCurrentGesture() {
        if (!this.smoothed) return 'NONE';
        
        const pinch = this.pinchStrength();
        const grip = this.gripStrength();
        const openness = this.handOpenness();
        
        if (pinch > this.PINCH_THRESHOLD) return 'PINCHING';
        
        // ⭐ FIST THRESHOLD = 55 ⭐
        if (grip > this.FIST_THRESHOLD && openness < 40) return 'FIST';
        
        if (openness > 70 && grip < 30) return 'OPEN';
        if (this._isPointingSimple()) return 'POINTING';
        
        return 'NONE';
    }

    /* ================= DRAW ================= */

    _draw() {
        if (this.videoCtx) {
            this.videoCtx.clearRect(0, 0, this.stageW, this.stageH);
        }
        if (this.bonesCtx) {
            this.bonesCtx.clearRect(0, 0, this.stageW, this.stageH);
        }
        if (this.contourCtx) {
            this.contourCtx.clearRect(0, 0, this.stageW, this.stageH);
        }
        
        if (this.showCameraFlag && this.videoCtx && this.video) {
            this.videoCtx.save();
            this.videoCtx.globalAlpha = this.cameraOpacity;
            this.videoCtx.drawImage(this.video, 0, 0, this.stageW, this.stageH);
            this.videoCtx.restore();
        }
        
        if (!this.smoothed) return;
        
        if (this.showBonesFlag) {
            this._drawSkeleton();
        }
        
        if (this.showContourFlag) {
            this._drawContour();
        }
    }

    _drawSkeleton() {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20]
        ];
        
        this.bonesCtx.strokeStyle = '#00AFFF';
        this.bonesCtx.lineWidth = 3;
        this.bonesCtx.lineJoin = 'round';
        this.bonesCtx.lineCap = 'round';
        
        for (const [start, end] of connections) {
            if (!this.smoothed[start] || !this.smoothed[end]) continue;
            
            this.bonesCtx.beginPath();
            this.bonesCtx.moveTo(
                this.smoothed[start].x * this.stageW,
                this.smoothed[start].y * this.stageH
            );
            this.bonesCtx.lineTo(
                this.smoothed[end].x * this.stageW,
                this.smoothed[end].y * this.stageH
            );
            this.bonesCtx.stroke();
        }
        
        for (let i = 0; i < this.smoothed.length; i++) {
            const point = this.smoothed[i];
            this.bonesCtx.beginPath();
            this.bonesCtx.fillStyle = i === 0 ? '#FF4444' : '#0099FF';
            this.bonesCtx.arc(
                point.x * this.stageW,
                point.y * this.stageH,
                i === 0 ? 6 : 4,
                0,
                Math.PI * 2
            );
            this.bonesCtx.fill();
        }
    }

    _drawContour() {
        if (!this.smoothed) return;
        
        const points = [
            this.smoothed[0],
            this.smoothed[1], this.smoothed[2], this.smoothed[3], this.smoothed[4],
            this.smoothed[8],
            this.smoothed[12],
            this.smoothed[16],
            this.smoothed[20],
            this.smoothed[19], this.smoothed[18], this.smoothed[17],
            this.smoothed[0]
        ];
        
        this.contourCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.contourCtx.lineWidth = 4;
        this.contourCtx.lineJoin = 'round';
        this.contourCtx.lineCap = 'round';
        
        this.contourCtx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const x = point.x * this.stageW;
            const y = point.y * this.stageH;
            
            if (i === 0) {
                this.contourCtx.moveTo(x, y);
            } else {
                this.contourCtx.lineTo(x, y);
            }
        }
        this.contourCtx.closePath();
        
        this.contourCtx.shadowColor = 'rgba(100, 200, 255, 0.6)';
        this.contourCtx.shadowBlur = 15;
        this.contourCtx.stroke();
        this.contourCtx.shadowBlur = 0;
    }

    /* ================= BLOCKS IMPLEMENTATION ================= */

    whenHandAppears() {
        if (this._hatHandAppeared) {
            this._hatHandAppeared = false;
            return true;
        }
        return false;
    }

    whenHandDisappears() {
        if (this._hatHandDisappeared) {
            this._hatHandDisappeared = false;
            return true;
        }
        return false;
    }

    whenPinchStarts() {
        if (this._hatPinchStart) {
            this._hatPinchStart = false;
            return true;
        }
        return false;
    }

    whenPinchEnds() {
        if (this._hatPinchEnd) {
            this._hatPinchEnd = false;
            return true;
        }
        return false;
    }

    handDetected() {
        return this.handPresent;
    }

    palmX() {
        return this._getCoordinate(0, 'x');
    }

    palmY() {
        return this._getCoordinate(0, 'y');
    }

    fingerX(args) {
        const fingerId = this._getFingerId(args.F);
        return this._getCoordinate(fingerId, 'x');
    }

    fingerY(args) {
        const fingerId = this._getFingerId(args.F);
        return this._getCoordinate(fingerId, 'y');
    }

    goToFinger(args, util) {
        const x = this.fingerX(args);
        const y = this.fingerY(args);
        util.target.setXY(x, y);
    }

    distanceToFinger(args, util) {
        const fingerId = this._getFingerId(args.F);
        if (!this.smoothed || !this.smoothed[fingerId]) return 0;
        
        const sprite = util.target;
        const spriteX = sprite.x;
        const spriteY = sprite.y;
        
        const fingerX = this._getCoordinate(fingerId, 'x');
        const fingerY = this._getCoordinate(fingerId, 'y');
        
        return Math.sqrt(Math.pow(spriteX - fingerX, 2) + Math.pow(spriteY - fingerY, 2));
    }

    pinchStrength() {
        if (!this.smoothed || !this.smoothed[4] || !this.smoothed[8]) {
            return 0;
        }

        const thumb = this.smoothed[4];
        const index = this.smoothed[8];
        
        const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
        
        const normalized = Math.max(0, 1 - (distance * 5));
        const strength = Math.pow(normalized, 2) * 100;
        
        return Math.round(Math.min(100, Math.max(0, strength)));
    }

    gripStrength() {
        if (!this.smoothed || !this.smoothed[0]) return 0;
        
        const palm = this.smoothed[0];
        const tips = [4, 8, 12, 16, 20];
        
        let avgDistance = 0;
        let count = 0;
        
        for (const tipIndex of tips) {
            if (this.smoothed[tipIndex]) {
                const dist = Math.hypot(
                    this.smoothed[tipIndex].x - palm.x,
                    this.smoothed[tipIndex].y - palm.y
                );
                avgDistance += dist;
                count++;
            }
        }
        
        if (count === 0) return 0;
        avgDistance /= count;
        
        const baseOpen = 0.35;
        const baseClosed = 0.12;
        
        let normalized;
        if (avgDistance >= baseOpen) {
            normalized = 0;
        } else if (avgDistance <= baseClosed) {
            normalized = 100;
        } else {
            normalized = 100 * (1 - (avgDistance - baseClosed) / (baseOpen - baseClosed));
        }
        
        return Math.round(Math.min(100, Math.max(0, normalized)));
    }

    handOpenness() {
        if (!this.smoothed || !this.smoothed[0]) return 0;
        
        const palm = this.smoothed[0];
        const tips = [4, 8, 12, 16, 20];
        
        let maxDistance = 0;
        
        for (const tipIndex of tips) {
            if (this.smoothed[tipIndex]) {
                const dist = Math.hypot(
                    this.smoothed[tipIndex].x - palm.x,
                    this.smoothed[tipIndex].y - palm.y
                );
                if (dist > maxDistance) {
                    maxDistance = dist;
                }
            }
        }
        
        const normalized = Math.min(100, Math.max(0, (maxDistance * 300)));
        return Math.round(normalized);
    }

    isFist() {
        const grip = this.gripStrength();
        const openness = this.handOpenness();
        
        // ⭐ FIST THRESHOLD = 55 ⭐
        return grip > this.FIST_THRESHOLD && openness < 40;
    }

    isOpenHand() {
        const grip = this.gripStrength();
        const openness = this.handOpenness();
        return grip < 40 && openness > 60;
    }

    isPinching() {
        return this.pinchStrength() > this.PINCH_THRESHOLD;
    }

    isPointing() {
        return this._isPointingSimple();
    }

    _isPointingSimple() {
        if (!this.smoothed) return false;
        
        const palm = this.smoothed[0];
        const indexTip = this.smoothed[8];
        const middleTip = this.smoothed[12];
        const ringTip = this.smoothed[16];
        const pinkyTip = this.smoothed[20];
        
        if (!palm || !indexTip || !middleTip || !ringTip || !pinkyTip) {
            return false;
        }
        
        const indexDist = Math.hypot(indexTip.x - palm.x, indexTip.y - palm.y);
        const middleDist = Math.hypot(middleTip.x - palm.x, middleTip.y - palm.y);
        const ringDist = Math.hypot(ringTip.x - palm.x, ringTip.y - palm.y);
        const pinkyDist = Math.hypot(pinkyTip.x - palm.x, pinkyTip.y - palm.y);
        
        return indexDist > middleDist * 1.5 && 
               indexDist > ringDist * 1.5 && 
               indexDist > pinkyDist * 1.5;
    }

    fingerExtended(args) {
        if (!this.smoothed || !this.smoothed[0]) return false;
        
        const fingerId = this._getFingerId(args.F);
        if (fingerId === 0) return false;
        
        const palm = this.smoothed[0];
        const fingerTip = this.smoothed[fingerId];
        if (!fingerTip) return false;
        
        const fingerDist = Math.hypot(fingerTip.x - palm.x, fingerTip.y - palm.y);
        
        const otherTips = [4, 8, 12, 16, 20].filter(id => id !== fingerId && id !== 0);
        let otherAvg = 0;
        let count = 0;
        
        for (const otherId of otherTips) {
            if (this.smoothed[otherId]) {
                const dist = Math.hypot(
                    this.smoothed[otherId].x - palm.x,
                    this.smoothed[otherId].y - palm.y
                );
                otherAvg += dist;
                count++;
            }
        }
        
        if (count === 0) return fingerDist > 0.15;
        
        otherAvg /= count;
        return fingerDist > otherAvg * 1.3;
    }

    handTilt() {
        if (!this.smoothed || !this.smoothed[0] || !this.smoothed[12]) {
            return 0;
        }
        
        const wrist = this.smoothed[0];
        const middleBase = this.smoothed[12];
        
        const dx = middleBase.x - wrist.x;
        const dy = middleBase.y - wrist.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return (angle + 360) % 360;
    }

    handSize() {
        if (!this.smoothed || !this.smoothed[0] || !this.smoothed[12]) {
            return 0;
        }
        
        const wrist = this.smoothed[0];
        const middleBase = this.smoothed[12];
        
        const distance = Math.hypot(
            (wrist.x - middleBase.x) * this.stageW,
            (wrist.y - middleBase.y) * this.stageH
        );
        
        return Math.round(distance);
    }

    handSpeed() {
        return Math.round(this.handSpeedValue || 0);
    }

    isLeftHand() {
        return this.isLeft === true;
    }

    showCamera() {
        this.showCameraFlag = true;
        this._draw();
    }

    hideCamera() {
        this.showCameraFlag = false;
        this._draw();
    }

    setCameraOpacity(args) {
        this.cameraOpacity = Math.max(0, Math.min(1, args.OPACITY / 100));
        if (this.videoCanvas) {
            this.videoCanvas.style.opacity = this.cameraOpacity;
        }
        this._draw();
    }

    showBones() {
        this.showBonesFlag = true;
        this._draw();
    }

    hideBones() {
        this.showBonesFlag = false;
        this._draw();
    }

    showContour() {
        this.showContourFlag = true;
        this._draw();
    }

    hideContour() {
        this.showContourFlag = false;
        this._draw();
    }

    /* ================= UTILITIES ================= */

    _getFingerId(fingerName) {
        const mapping = {
            'PALM': 0,
            'THUMB': 4,
            'INDEX': 8,
            'MIDDLE': 12,
            'RING': 16,
            'PINKY': 20
        };
        return mapping[fingerName] || 0;
    }

    _getCoordinate(landmarkIndex, axis, returnBoth = false) {
        if (!this.smoothed || !this.smoothed[landmarkIndex]) {
            return returnBoth ? { x: 0, y: 0 } : 0;
        }

        const point = this.smoothed[landmarkIndex];

        if (returnBoth) {
            return {
                x: (point.x - 0.5) * this.stageW,
                y: (0.5 - point.y) * this.stageH
            };
        }

        if (axis === 'x') {
            return (point.x - 0.5) * this.stageW;
        } else {
            return (0.5 - point.y) * this.stageH;
        }
    }

    _loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Register extension
Scratch.extensions.register(new HandTrackingPlus());