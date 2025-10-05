class PlayerSprite {
  constructor(spriteSheet, x, y) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 200;
    this.scale = 0.5;
    this.hue = parseInt(localStorage.getItem('spriteColorHue') || '0', 10);
    this.frameIndex = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.1;
    this.walkCycleLength = 4;
    this.keys = {};
    this.maxSpeed = 220;
    this.gravity = 1800;
    this.jumpForce = 700;
    this.isOnGround = false;
    this.state = 'idle';
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this.setupKeyboardControls();
  }
  setupKeyboardControls() {
    window.addEventListener('keydown', this._handleKeyDown, { passive: false });
    window.addEventListener('keyup', this._handleKeyUp, { passive: true });
  }
  isTypingInInput(e) {
    const target = e.target;
    if (!target) return false;
    const tag = (target.tagName || '').toLowerCase();
    const editable = target.getAttribute && target.getAttribute('contenteditable');
    return tag === 'input' || tag === 'textarea' || tag === 'select' || editable === 'true';
  }
  _handleKeyDown(e) {
    if (this.isTypingInInput(e)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
      this.keys[e.key] = true;
    }
  }
  _handleKeyUp(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      this.keys[e.key] = false;
    }
  }
  onRemoved() {
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
  }
  update(deltaTime) {
    // Horizontal input
    this.vx = 0;
    if (this.keys['ArrowLeft'] || this.keys['a']) this.vx = -this.maxSpeed;
    if (this.keys['ArrowRight'] || this.keys['d']) this.vx = this.maxSpeed;

    // Jump input (trigger only when on ground)
    const wantsJump = this.keys['ArrowUp'] || this.keys['w'];
    if (wantsJump && this.isOnGround) {
      this.vy = -this.jumpForce;
      this.isOnGround = false;
    }

    // Apply gravity
    this.vy += this.gravity * deltaTime;

    // Integrate position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Clamp to world bounds
    const width = this.spriteSheet.frameWidth * this.scale;
    const height = this.spriteSheet.frameHeight * this.scale;
    const dpr = window.devicePixelRatio || 1;
    const maxX = (this.engine.canvas.width / dpr) - width;
    const groundY = this.engine.groundY - height;

    // Horizontal clamp
    if (this.x < 0) this.x = 0;
    if (this.x > maxX) this.x = maxX;

    // Ground collision
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // Animation state
    if (!this.isOnGround) {
      this.state = 'jumping';
    } else if (this.vx !== 0) {
      this.state = 'walking';
    } else {
      this.state = 'idle';
    }

    // Advance animation
    if (this.state === 'walking') {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.animationSpeed) {
        this.frameIndex = (this.frameIndex + 1) % this.walkCycleLength; // frames 0..3
        this.animationTimer = 0;
      }
    } else if (this.state === 'idle') {
      this.frameIndex = 0; // idle frame
    } else if (this.state === 'jumping') {
      this.frameIndex = 4; // jumping frame
    }
  }
  render(ctx) {
    this.spriteSheet.drawFrame(ctx, this.frameIndex, this.x, this.y, this.scale, this.hue);
  }
  setHue(hue) {
    this.hue = hue;
    localStorage.setItem('spriteColorHue', hue.toString());
  }
}