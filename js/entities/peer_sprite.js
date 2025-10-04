class PeerSprite {
  constructor(spriteSheet, username, x, y) {
    this.spriteSheet = spriteSheet;
    this.username = username;
    this.x = x;
    this.y = y;
    this.scale = 0.8; // Smaller scale for peers
    this.hue = 0;
    this.state = 'idle';
    this.jumpVelocity = 0;
    this.jumpPower = -400; // Increased jump power
    this.gravity = 980;
    this.isGold = false;
    this.goldTimer = 0;
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
    this.isGold = true;
    this.goldTimer = 3; // Celebrate for 3 seconds
  }
  update(deltaTime) {
    if (this.state === 'jumping') {
      this.jumpVelocity += this.gravity * deltaTime;
      this.y += this.jumpVelocity * deltaTime;
      const maxY = this.groundY - this.size.height;
      if (this.y >= maxY) {
        this.y = maxY;
        this.jumpVelocity = 0;
        this.state = 'idle';
      }
    }
    if (this.isGold) {
      this.goldTimer -= deltaTime;
      if (this.goldTimer <= 0) this.isGold = false;
    }
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.frameIndex = (this.frameIndex + 1) % this.walkCycleLength;
      this.animationTimer = 0;
    }
    const maxX = (this.engine.canvas.width / (window.devicePixelRatio || 1)) - this.size.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }
  render(ctx) {
    const hue = this.isGold ? 45 : this.hue;
    this.spriteSheet.drawFrame(ctx, this.frameIndex, this.x, this.y, this.scale, hue);
  }
  getLabelSpec() {
    const centerX = this.x + this.size.width / 2;
    const topY = this.y;
    return { text: this.username, x: centerX, y: topY, isGold: this.isGold };
  }
}