import { BIRDSIZE, CANVAS_HEIGHT, CANVAS_WIDTH, BIRDANIMATIONFRAME, FLOOROFFSET } from './constants';


export default class Bird {

    constructor(p5, spriteImage, userPhoto = null) {
        this.p5 = p5;
        this.gravity = 0.5;
        this.velocity = 0;
        this.lift = -8;
        this.birdPosition = { y: (CANVAS_HEIGHT / 2) - (BIRDSIZE.Width / 2), x: (CANVAS_WIDTH / 2) - (BIRDSIZE.Height / 2) };
        this.image = spriteImage;
        this.userPhoto = userPhoto;
        this.frame = 0;
        this.dead = false;
        this.birdRotate = { angle: 0, xOffset: 0, yOffset: 0 };
    }

    draw() {
        if (this.dead === false)
            this.frame++;

        this.p5.push();

        // Only apply rotation if NOT using user photo
        if (!this.userPhoto) {
            this.p5.translate(this.birdPosition.x + this.birdRotate.xOffset, this.birdPosition.y + this.birdRotate.yOffset);
            this.p5.rotate(Math.PI / 180 * this.birdRotate.angle);
        } else {
            // No rotation for user photo - keep it upright
            this.p5.translate(this.birdPosition.x, this.birdPosition.y);
        }
        
        // Draw user photo if available, otherwise use sprite
        if (this.userPhoto) {
            // Draw circular user photo with proper clipping
            this.p5.push();
            
            const circleSize = Math.min(BIRDSIZE.Width, BIRDSIZE.Height);
            const centerX = circleSize / 2;
            const centerY = circleSize / 2;
            
            // Create graphics buffer for circular clipping
            const pg = this.p5.createGraphics(circleSize, circleSize);
            
            // Draw circle mask
            pg.fill(255);
            pg.noStroke();
            pg.circle(centerX, centerY, circleSize);
            
            // Get the mask
            const mask = pg.get();
            
            // Resize and mask the user photo
            const img = this.userPhoto.get();
            img.resize(circleSize, circleSize);
            img.mask(mask);
            
            // Draw the circular image
            this.p5.imageMode(this.p5.CENTER);
            this.p5.image(img, centerX, centerY);
            this.p5.imageMode(this.p5.CORNER);
            
            // Draw circular border for better visibility
            this.p5.noFill();
            this.p5.stroke(255, 255, 255, 200);
            this.p5.strokeWeight(2);
            this.p5.circle(centerX, centerY, circleSize);
            
            pg.remove(); // Clean up graphics buffer
            
            this.p5.pop();
        } else {
            let animationFrame = (Math.floor(this.frame / 8)) % 4;
            this.p5.image(this.image, 0, 0, BIRDSIZE.Width, BIRDSIZE.Height, BIRDANIMATIONFRAME[animationFrame], 0, BIRDSIZE.Width, BIRDSIZE.Height);
        }

        this.p5.pop();
    }

    getCircleCenter() {
        // Return center point and radius for circular collision detection
        const circleSize = Math.min(BIRDSIZE.Width, BIRDSIZE.Height);
        return {
            x: this.birdPosition.x + circleSize / 2,
            y: this.birdPosition.y + circleSize / 2,
            radius: circleSize / 2
        };
    }

    jump() {
        this.velocity = this.lift;
        this.birdRotate = { angle: -25, xOffset: -10, yOffset: 15 };
    }

    isDead() {
        return this.birdPosition.y >= CANVAS_HEIGHT - BIRDSIZE.Height - FLOOROFFSET ? true : false;
    }

    update() {
        this.velocity += this.gravity;
        this.birdPosition.y += this.velocity;

        if (this.velocity > 8)
            this.birdRotate = { angle: 0, xOffset: 0, yOffset: 0 };
        if (this.velocity > 9)
            this.birdRotate = { angle: 22.5, xOffset: 12, yOffset: -10 };

        if (this.velocity > 10)
            this.birdRotate = { angle: 45, xOffset: 30, yOffset: -15 };

        if (this.velocity > 11)
            this.birdRotate = { angle: 67.5, xOffset: 45, yOffset: -10 };

        if (this.velocity > 12)
            this.birdRotate = { angle: 90, xOffset: 60, yOffset: -10 };

        if (this.isDead()) {
            this.birdPosition.y = CANVAS_HEIGHT - BIRDSIZE.Height - FLOOROFFSET;
            this.velocity = 0;
            this.dead = true;
        }

        if (this.velocity > 15)
            this.velocity = 15;
    }
}
