class PlayerSprite {
  constructor(spriteSheet, x, y) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 200;
    this.scale = 1.0; // Corrected from 1.5 to match new larger sprite size
    this.hue = parseInt(localStorage.getItem('spriteColorHue') || '0', 10);
    this.frameIndex = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.1;
    this.walkCycleLength = 4;
    this.keys = {};
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
    this.vx = 0; this.vy = 0;
    if (this.keys['ArrowLeft'] || this.keys['a']) this.vx = -this.speed;
    if (this.keys['ArrowRight'] || this.keys['d']) this.vx = this.speed;
    if (this.keys['ArrowUp'] || this.keys['w']) this.vy = -this.speed;
    if (this.keys['ArrowDown'] || this.keys['s']) this.vy = this.speed;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    const width = this.spriteSheet.frameWidth * this.scale;
    const height = this.spriteSheet.frameHeight * this.scale;
    const maxX = (this.engine.canvas.width / (window.devicePixelRatio || 1)) - width;
    const maxY = this.engine.groundY - height;
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.min(this.y, maxY);
    this.y = Math.max(0, this.y);
    if (this.vx !== 0 || this.vy !== 0) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.animationSpeed) {
        this.frameIndex = (this.frameIndex + 1) % this.walkCycleLength;
        this.animationTimer = 0;
      }
    } else {
      this.frameIndex = 0;
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