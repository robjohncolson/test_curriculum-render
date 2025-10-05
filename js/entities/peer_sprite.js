class PeerSprite {
  constructor(spriteSheet, username, x, y) {
    this.spriteSheet = spriteSheet;
    this.username = username;
    this.x = x;
    this.y = y;
    this.scale = 0.25; // Smaller scale for peers
    this.hue = 0;
    this.state = 'idle';
    this.jumpVelocity = 0;
    this.jumpPower = -400; // Increased jump power
    this.gravity = 980;
    this.isGold = false;
    this.goldTimer = 0;
    this.suspensionTimer = 0;
    this.deferGoldUntilSuspended = false;
    this.frameIndex = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.15;
    this.walkCycleLength = 4;
  }
  get size() {
    return {
      width: this.spriteSheet.frameWidth * this.scale,
      height: this.spriteSheet.frameHeight * this.scale
    };
  }
  get groundY() { return this.engine.groundY; }
  jump() {
    if (this.state === 'idle') {
      this.state = 'jumping';
      this.jumpVelocity = this.jumpPower;
    }
  }
  celebrate() {
    this.jump();
    this.goldTimer = 3;
    this.deferGoldUntilSuspended = true;
  }
  update(deltaTime) {
    // Physics/state
    const groundTopY = this.groundY - this.size.height;
    switch (this.state) {
      case 'jumping': {
        this.jumpVelocity += this.gravity * deltaTime;
        this.y += this.jumpVelocity * deltaTime;
        // Reached apex when upward velocity crosses zero
        if (this.jumpVelocity >= 0) {
          this.state = 'suspended';
          this.suspensionTimer = 5;
          this.jumpVelocity = 0;
          // Begin gold only during suspension window
          if (this.deferGoldUntilSuspended && this.goldTimer > 0) {
            this.deferGoldUntilSuspended = false;
          }
        }
        break;
      }
      case 'suspended': {
        // Hold at apex; decrement timers
        if (this.goldTimer > 0) {
          this.goldTimer -= deltaTime;
          if (this.goldTimer < 0) this.goldTimer = 0;
        }
        this.suspensionTimer -= deltaTime;
        if (this.suspensionTimer <= 0) {
          this.state = 'falling';
          this.jumpVelocity = 0;
        }
        break;
      }
      case 'falling': {
        this.jumpVelocity += this.gravity * deltaTime;
        this.y += this.jumpVelocity * deltaTime;
        if (this.y >= groundTopY) {
          this.y = groundTopY;
          this.jumpVelocity = 0;
          this.state = 'idle';
          this.deferGoldUntilSuspended = false;
        }
        break;
      }
      case 'idle':
      default: {
        // no-op
        break;
      }
    }
    // Simple frame logic: idle=0, air=4
    if (this.state === 'idle') {
      this.frameIndex = 0;
    } else {
      this.frameIndex = 4;
    }
    // Horizontal clamp
    const maxX = (this.engine.canvas.width / (window.devicePixelRatio || 1)) - this.size.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }
  render(ctx) {
    const hue = (this.goldTimer > 0 && !this.deferGoldUntilSuspended) ? 45 : this.hue;
    this.spriteSheet.drawFrame(ctx, this.frameIndex, this.x, this.y, this.scale, hue);
  }
  getLabelSpec() {
    const centerX = this.x + this.size.width / 2;
    const topY = this.y;
    return {
      text: this.username,
      x: centerX,
      y: topY,
      isGold: (this.goldTimer > 0 && !this.deferGoldUntilSuspended)
    };
  }
}