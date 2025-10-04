class SpriteManager {
  constructor(engine, spriteSheet) {
    this.engine = engine;
    this.spriteSheet = spriteSheet;
    this.peerSprites = new Map();
    this.positionedUsernames = [];
    this._handleResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._handleResize);
  }
  _handleResize() { this.repositionPeers(); }
  computeSlots(count, spriteWidth) {
    const viewportWidth = this.engine.canvas.width / (window.devicePixelRatio || 1);
    if (count <= 0) return [];
    const leftMargin = viewportWidth * 0.10;
    const usable = viewportWidth - (leftMargin * 2);
    if (count === 1) return [leftMargin + usable / 2 - spriteWidth / 2];
    const gap = usable / (count - 1);
    return Array.from({ length: count }, (_, i) => leftMargin + i * gap - spriteWidth / 2);
  }
  repositionPeers() {
    const list = this.positionedUsernames;
    if (!list.length) return;
    const spriteWidth = this.spriteSheet.frameWidth * 0.8; // Peer scale
    const xs = this.computeSlots(list.length, spriteWidth);
    const y = this.engine.groundY - this.spriteSheet.frameHeight * 0.8;
    list.forEach((username, i) => {
      const sprite = this.peerSprites.get(username);
      if (sprite) {
        sprite.x = Math.max(0, xs[i]);
        sprite.y = y;
      }
    });
  }
  handlePeerAnswer(username, isCorrect) {
    if (!window.turboModeActive) return;
    let peerSprite = this.peerSprites.get(username);
    if (!peerSprite) {
      this.positionedUsernames.push(username);
      const y = this.engine.groundY - this.spriteSheet.frameHeight * 0.8;
      peerSprite = new PeerSprite(this.spriteSheet, username, 0, y);
      this.peerSprites.set(username, peerSprite);
      this.engine.addEntity(`peer_${username}`, peerSprite);
      this.repositionPeers();
    }
    if (isCorrect) {
      peerSprite.celebrate();
    } else {
      peerSprite.jump();
    }
  }
  removePeerSprite(username) {
    if (!this.peerSprites.has(username)) return;
    this.engine.removeEntity(`peer_${username}`);
    this.peerSprites.delete(username);
    this.positionedUsernames = this.positionedUsernames.filter((u) => u !== username);
    this.repositionPeers();
  }
  clearAllPeerSprites() {
    this.peerSprites.forEach((_, username) => this.engine.removeEntity(`peer_${username}`));
    this.peerSprites.clear();
    this.positionedUsernames = [];
  }
}