/*const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;
const keys = {
    left: false,
    right: false,
    up: false,
    space: false,
};
let mouseX = 0;
let mouseY = 0;
let score = 0;
let gamePaused = false;
let animationId;
let invincible = false;
let currentWeaponIndex = 0;
let cameraOffsetX = 0;

class Survivor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.color = 'blue';
        this.dy = 0;
        this.dx = 0;
        this.speed = 5;
        this.jumpPower = 10;
        this.grounded = false;
        this.health = 100;
        this.fuel = 100; // Jetpack fuel
        this.jetpackPower = 2;
    }

    draw() {
        ctx.fillStyle = invincible ? 'yellow' : this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width * (this.health / 100), 5);
        // Draw fuel bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width * (this.fuel / 100), 5);
    }

    update(blocks) {
        if (keys.left) this.dx = -this.speed;
        else if (keys.right) this.dx = this.speed;
        else this.dx = 0;

        if (keys.up && this.fuel > 0) {
            this.dy = -this.jetpackPower;
            this.fuel -= 0.5; // Decrease fuel when jetpack is used
        } else {
            this.dy += gravity;
            if (this.fuel < 100) this.fuel += 0.1; // Slowly refill fuel when not using jetpack
        }

        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {
        
                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + block.width;
                }
            }
        });

        this.draw();
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }
}

class Zombie {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.color = 'green';
        this.dy = 0;
        this.dx = speed * direction;
        this.speed = speed;
        this.jumpPower = 10;
        this.grounded = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(blocks, survivor) {
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {

                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                }
            }
        });

        // Check for collision with survivor
        const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
        if (dist - survivor.width / 2 - this.width / 2 < 1) {
            if (!invincible) survivor.health -= 10;
            this.x += this.dx * 30;  // Move zombie past the survivor
            score += 10;  // Increase score for surviving an encounter
        }

        this.draw();
        return false;
    }
}

class FastZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed * 1.8, direction);
        this.color = 'red';
    }
}

class StrongZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed, direction);
        this.color = 'purple';
    }

    update(blocks, survivor) {
        const remove = super.update(blocks, survivor);
        if (!remove) {
            // Stronger attack
            const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
            if (dist - survivor.width / 2 - this.width / 2 < 1 && !invincible) {
                survivor.health -= 30;  // Strong zombies deal more damage
                this.x += this.dx * 30;  // Move zombie past the survivor
                score += 20;  // Increase score for surviving an encounter
            }
        }
        return remove;
    }
}

class Bullet {
    constructor(x, y, angle, speed, color, gravity) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        this.gravity = gravity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x - cameraOffsetX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

class Weapon {
    constructor(name, bulletSpeed, bulletColor, bulletGravity) {
        this.name = name;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletGravity = bulletGravity;
    }

    shoot(x, y, angle) {
        return new Bullet(x, y, angle, this.bulletSpeed, this.bulletColor, this.bulletGravity);
    }
}

class HealthBooster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(survivor) {
        // Check for collision with survivor
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            invincible = true;
            this.x = -100;  // Move booster off-screen
            setTimeout(() => { invincible = false; }, 10000);  // Invincibility lasts for 10 seconds
        }
        this.draw();
    }
}

class Defense {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'blue';
        this.fireRate = 4000;  // Fire every 2 seconds
        this.lastFireTime = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(zombies) {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            this.fire(zombies);
            this.lastFireTime = now;
        }
        this.draw();
    }

    fire(zombies) {
        if (zombies.length > 0) {
            const targetZombie = zombies[0];
            const angle = Math.atan2(targetZombie.y - this.y, targetZombie.x - this.x);
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle, 10, 'blue', 0);
            bullets.push(bullet);
        }
    }
}

let survivor = new Survivor(100, canvas.height - 60);
const blocks = [];
const zombies = [];
const bullets = [];
const defenses = [];
const healthBoosters = [];

// Define different types of weapons
const weapons = [
    new Weapon('Pistol', 15, 'yellow', 0.1),
    new Weapon('Shotgun', 10, 'orange', 0.05),
    new Weapon('Rifle', 20, 'red', 0.2)
];

function spawnZombie() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60;
    const speed = Math.random() * 1 + 0.8;
    const direction = -1;

    // Randomly select a zombie type
    const zombieType = Math.random();
    if (zombieType < 0.5) {
        zombies.push(new Zombie(x, y, speed, direction));
    } else if (zombieType < 0.75) {
        zombies.push(new FastZombie(x, y, speed, direction));
    } else {
        zombies.push(new StrongZombie(x, y, speed, direction));
    }

    setTimeout(spawnZombie, 2000 + Math.random() * 3000);
}

function spawnBlock() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60 - Math.random() * 200;
    const width = 50;
    const height = 50;
    blocks.push(new Block(x, y, width, height));

    setTimeout(spawnBlock, 3000 + Math.random() * 3000);
}

function spawnDefense() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 100;
    defenses.push(new Defense(x, y));

    setTimeout(spawnDefense, 10000 + Math.random() * 10000);
}

function spawnHealthBooster() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = Math.random() * (canvas.height - 200) + 60;
    healthBoosters.push(new HealthBooster(x, y));

    setTimeout(spawnHealthBooster, 15000 + Math.random() * 15000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraOffsetX = survivor.x - canvas.width / 2;

    survivor.update(blocks);

    blocks.forEach(block => {
        block.draw();
    });

    defenses.forEach(defense => {
        defense.update(zombies);
    });

    zombies.forEach((zombie, index) => {
        const removeZombie = zombie.update(blocks, survivor);
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(zombie.x + zombie.width / 2 - bullet.x, zombie.y + zombie.height / 2 - bullet.y);
            if (dist - zombie.width / 2 - bullet.radius < 1) {
                setTimeout(() => {
                    zombies.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 50;  // Increase score for killing a zombie
                }, 0);
            }
        });
        if (removeZombie || zombie.x < cameraOffsetX) {
            zombies.splice(index, 1);
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < cameraOffsetX || bullet.x > cameraOffsetX + canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    healthBoosters.forEach(booster => {
        booster.update(survivor);
    });

    // Display score and current weapon
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Weapon: ${weapons[currentWeaponIndex].name}`, 10, 60);

    // Check for game over
    if (survivor.health <= 0) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', cameraOffsetX + canvas.width / 2 - 120, canvas.height / 2);
        setTimeout(showLeaderboard, 1000);  // Show leaderboard after game over
        return;
    }

    if (!gamePaused) {
        animationId = requestAnimationFrame(animate);
    }
}

function showLeaderboard() {
    const playerName = prompt("Enter your name:");
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    survivor = new Survivor(100, canvas.height - 60);
    blocks.length = 0;
    zombies.length = 0;
    bullets.length = 0;
    defenses.length = 0;
    healthBoosters.length = 0;
    score = 0;
    gamePaused = false;
    invincible = false;
    animate();
    spawnZombie();
    spawnBlock();
    spawnDefense();
    spawnHealthBooster();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';
        animate();
    } else {
        gamePaused = true;
        document.getElementById('playPauseBtn').textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

resetGame();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyQ') {
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft + cameraOffsetX;
    mouseY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('click', (e) => {
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    bullets.push(weapons[currentWeaponIndex].shoot(survivor.x + survivor.width / 2, survivor.y + survivor.height / 2, angle));
});*/

/*const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;
const keys = {
    left: false,
    right: false,
    up: false,
    space: false,
};
let mouseX = 0;
let mouseY = 0;
let score = 0;
let gamePaused = false;
let animationId;
let invincible = false;
let currentWeaponIndex = 0;
let cameraOffsetX = 0;

// Load sprite sheets
const zombieWalkImg = new Image();
zombieWalkImg.src = 'zombie_walk.png';
const zombieAttackImg = new Image();
zombieAttackImg.src = 'zombie_attack.png';
const zombieJumpImg = new Image();
zombieJumpImg.src = 'zombie_jump.png';
const zombieDieImg = new Image();
zombieDieImg.src = 'zombie_die.png';

class Survivor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.color = 'blue';
        this.dy = 0;
        this.dx = 0;
        this.speed = 5;
        this.jumpPower = 10;
        this.grounded = false;
        this.health = 100;
        this.fuel = 100; // Jetpack fuel
        this.jetpackPower = 2;
    }

    draw() {
        ctx.fillStyle = invincible ? 'yellow' : this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width * (this.health / 100), 5);
        // Draw fuel bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width * (this.fuel / 100), 5);
    }

    update(blocks) {
        if (keys.left) this.dx = -this.speed;
        else if (keys.right) this.dx = this.speed;
        else this.dx = 0;

        if (keys.up && this.fuel > 0) {
            this.dy = -this.jetpackPower;
            this.fuel -= 0.5; // Decrease fuel when jetpack is used
        } else {
            this.dy += gravity;
            if (this.fuel < 100) this.fuel += 0.1; // Slowly refill fuel when not using jetpack
        }

        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {
        
                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + block.width;
                }
            }
        });

        this.draw();
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }
}

class Zombie {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.dx = speed * direction;
        this.speed = speed;
        this.jumpPower = 10;
        this.grounded = false;
        this.frame = 0;
        this.frameRate = 0;
        this.maxFrame = 6; // Adjust based on the sprite sheet
        this.spriteSheet = zombieWalkImg;
        this.spriteWidth = 225; // Adjust based on the sprite sheet
        this.spriteHeight = 410; // Adjust based on the sprite sheet
        this.width = this.spriteWidth/5;
        this.height = this.spriteHeight/5;
        this.isJumping = false;
    }

    draw() {
        let spriteSheet = this.spriteSheet;
        if (this.isJumping) {
            spriteSheet = zombieJumpImg;
            this.spriteWidth = 215; // Adjust based on the jump sprite sheet
            this.spriteHeight = 460; // Adjust based on the jump sprite sheet
            this.maxFrame = 6; // Adjust based on the jump sprite sheet
        }

        ctx.drawImage(
            spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x - cameraOffsetX, this.y,
            this.width, this.height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.maxFrame;
        }
    }

    update(blocks, survivor) {
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            this.isJumping = false;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {

                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    this.isJumping = false;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                }
            }
        });

        // Check for collision with survivor
        const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
        if (dist - survivor.width / 2 - this.width / 2 < 1) {
            if (!invincible) survivor.health -= 10;
            this.x += this.dx * 30;  // Move zombie past the survivor
            score += 10;  // Increase score for surviving an encounter
        }

        this.draw();
        return false;
    }
}

class FastZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed * 1.8, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'red';
    }
}

class StrongZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'purple';
    }

    update(blocks, survivor) {
        const remove = super.update(blocks, survivor);
        if (!remove) {
            // Stronger attack
            const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
            if (dist - survivor.width / 2 - this.width / 2 < 1 && !invincible) {
                survivor.health -= 30;  // Strong zombies deal more damage
                this.x += this.dx * 30;  // Move zombie past the survivor
                score += 20;  // Increase score for surviving an encounter
            }
        }
        return remove;
    }
}

class Bullet {
    constructor(x, y, angle, speed, color, gravity) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        this.gravity = gravity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x - cameraOffsetX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

class Weapon {
    constructor(name, bulletSpeed, bulletColor, bulletGravity) {
        this.name = name;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletGravity = bulletGravity;
    }

    shoot(x, y, angle) {
        return new Bullet(x, y, angle, this.bulletSpeed, this.bulletColor, this.bulletGravity);
    }
}

class HealthBooster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(survivor) {
        // Check for collision with survivor
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            invincible = true;
            this.x = -100;  // Move booster off-screen
            setTimeout(() => { invincible = false; }, 10000);  // Invincibility lasts for 10 seconds
        }
        this.draw();
    }
}

class Defense {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'blue';
        this.fireRate = 4000;  // Fire every 2 seconds
        this.lastFireTime = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(zombies) {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            this.fire(zombies);
            this.lastFireTime = now;
        }
        this.draw();
    }

    fire(zombies) {
        if (zombies.length > 0) {
            const targetZombie = zombies[0];
            const angle = Math.atan2(targetZombie.y - this.y, targetZombie.x - this.x);
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle, 10, 'blue', 0);
            bullets.push(bullet);
        }
    }
}

let survivor = new Survivor(100, canvas.height - 60);
const blocks = [];
const zombies = [];
const bullets = [];
const defenses = [];
const healthBoosters = [];

// Define different types of weapons
const weapons = [
    new Weapon('Pistol', 15, 'yellow', 0.1),
    new Weapon('Shotgun', 10, 'orange', 0.05),
    new Weapon('Rifle', 20, 'red', 0.2)
];

function spawnZombie() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60;
    const speed = Math.random() * 1 + 0.8;
    const direction = -1;

    // Randomly select a zombie type
    const zombieType = Math.random();
    if (zombieType < 0.5) {
        zombies.push(new Zombie(x, y, speed, direction));
    } else if (zombieType < 0.75) {
        zombies.push(new FastZombie(x, y, speed, direction));
    } else {
        zombies.push(new StrongZombie(x, y, speed, direction));
    }

    setTimeout(spawnZombie, 2000 + Math.random() * 3000);
}

function spawnBlock() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60 - Math.random() * 200;
    const width = 50;
    const height = 50;
    blocks.push(new Block(x, y, width, height));

    setTimeout(spawnBlock, 3000 + Math.random() * 3000);
}

function spawnDefense() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 100;
    defenses.push(new Defense(x, y));

    setTimeout(spawnDefense, 10000 + Math.random() * 10000);
}

function spawnHealthBooster() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = Math.random() * (canvas.height - 200) + 60;
    healthBoosters.push(new HealthBooster(x, y));

    setTimeout(spawnHealthBooster, 15000 + Math.random() * 15000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraOffsetX = survivor.x - canvas.width / 2;

    survivor.update(blocks);

    blocks.forEach(block => {
        block.draw();
    });

    defenses.forEach(defense => {
        defense.update(zombies);
    });

    zombies.forEach((zombie, index) => {
        const removeZombie = zombie.update(blocks, survivor);
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(zombie.x + zombie.width / 2 - bullet.x, zombie.y + zombie.height / 2 - bullet.y);
            if (dist - zombie.width / 2 - bullet.radius < 1) {
                setTimeout(() => {
                    zombies.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 50;  // Increase score for killing a zombie
                }, 0);
            }
        });
        if (removeZombie || zombie.x < cameraOffsetX) {
            zombies.splice(index, 1);
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < cameraOffsetX || bullet.x > cameraOffsetX + canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    healthBoosters.forEach(booster => {
        booster.update(survivor);
    });

    // Display score and current weapon
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Weapon: ${weapons[currentWeaponIndex].name}`, 10, 60);

    // Check for game over
    if (survivor.health <= 0) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', cameraOffsetX + canvas.width / 2 - 120, canvas.height / 2);
        setTimeout(showLeaderboard, 1000);  // Show leaderboard after game over
        return;
    }

    if (!gamePaused) {
        animationId = requestAnimationFrame(animate);
    }
}

function showLeaderboard() {
    const playerName = prompt("Enter your name:");
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    survivor = new Survivor(100, canvas.height - 60);
    blocks.length = 0;
    zombies.length = 0;
    bullets.length = 0;
    defenses.length = 0;
    healthBoosters.length = 0;
    score = 0;
    gamePaused = false;
    invincible = false;
    animate();
    spawnZombie();
    spawnBlock();
    spawnDefense();
    spawnHealthBooster();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';
        animate();
    } else {
        gamePaused = true;
        document.getElementById('playPauseBtn').textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

resetGame();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyQ') {
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft + cameraOffsetX;
    mouseY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('click', (e) => {
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    bullets.push(weapons[currentWeaponIndex].shoot(survivor.x + survivor.width / 2, survivor.y + survivor.height / 2, angle));
});*/

/*const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;
const keys = {
    left: false,
    right: false,
    up: false,
    space: false,
};
let mouseX = 0;
let mouseY = 0;
let score = 0;
let gamePaused = false;
let animationId;
let invincible = false;
let currentWeaponIndex = 0;
let cameraOffsetX = 0;

// Load sprite sheets
const zombieWalkImg = new Image();
zombieWalkImg.src = 'zombie_walk.png';
const zombieAttackImg = new Image();
zombieAttackImg.src = 'zombie_attack.png';
const zombieJumpImg = new Image();
zombieJumpImg.src = 'zombie_jump.png';
const zombieDieImg = new Image();
zombieDieImg.src = 'zombie_die.png';

const survivorIdleImg = new Image();
survivorIdleImg.src = '__jet_pack_man_with_weapon_standing_idle.png';
const survivorRunImg = new Image();
survivorRunImg.src = '__jet_pack_man_with_weapon_standing_run.png';
const survivorJumpImg = new Image();
survivorJumpImg.src = '__jet_pack_man_with_weapon_standing_jump.png';
const survivorShootImg = new Image();
survivorShootImg.src = '__jet_pack_man_with_weapon_standing_shoot.png';
const survivorDieImg = new Image();
survivorDieImg.src = '__jet_pack_man_with_weapon_standing_die.png';

class AnimationState {
    constructor(spriteSheet, frameCount, spriteWidth, spriteHeight) {
        this.spriteSheet = spriteSheet;
        this.frameCount = frameCount;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.frame = 0;
        this.frameRate = 0;
    }

    draw(ctx, x, y, width, height, cameraOffsetX) {
        ctx.drawImage(
            this.spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            x - cameraOffsetX, y,
            width, height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.frameCount;
        }
    }
}

class Survivor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 88;
        this.height = 64;
        this.dy = 0;
        this.dx = 0;
        this.speed = 5;
        this.jumpPower = 10;
        this.grounded = false;
        this.health = 100;
        this.fuel = 100; // Jetpack fuel
        this.jetpackPower = 2;
        this.state = 'idle'; // Default state

        this.animationStates = {
            idle: new AnimationState(survivorIdleImg, 5, 881, 639),
            run: new AnimationState(survivorRunImg, 4, 881, 639),
            jump: new AnimationState(survivorJumpImg, 6, 881, 639),
            shoot: new AnimationState(survivorShootImg, 6, 881, 639),
            die: new AnimationState(survivorDieImg, 6, 881, 639),
        };
    }

    draw() {
        this.animationStates[this.state].draw(ctx, this.x, this.y, this.width, this.height, cameraOffsetX);

        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width * (this.health / 100), 5);
        // Draw fuel bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width * (this.fuel / 100), 5);
    }

    update(blocks) {
        if (keys.left) this.dx = -this.speed;
        else if (keys.right) this.dx = this.speed;
        else this.dx = 0;

        if (keys.up && this.fuel > 0) {
            this.dy = -this.jetpackPower;
            this.fuel -= 0.5; // Decrease fuel when jetpack is used
            this.state = 'jump';
        } else {
            this.dy += gravity;
            if (this.fuel < 100) this.fuel += 0.1; // Slowly refill fuel when not using jetpack
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.dx !== 0) this.state = 'run';
        else this.state = 'idle';

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            if (this.state === 'jump') this.state = 'idle';
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {
        
                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    if (this.state === 'jump') this.state = 'idle';
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + block.width;
                }
            }
        });

        this.draw();
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }
}

class Zombie {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.dx = speed * direction;
        this.speed = speed;
        this.jumpPower = 10;
        this.grounded = false;
        this.frame = 0;
        this.frameRate = 0;
        this.maxFrame = 6; // Adjust based on the sprite sheet
        this.spriteSheet = zombieWalkImg;
        this.spriteWidth = 215; // Adjust based on the sprite sheet
        this.spriteHeight = 410; // Adjust based on the sprite sheet
        this.width = this.spriteWidth/5;
        this.height = this.spriteHeight/5;
        this.isJumping = false;
    }

    draw() {
        let spriteSheet = this.spriteSheet;
        if (this.isJumping) {
            spriteSheet = zombieJumpImg;
            this.spriteWidth = 215; // Adjust based on the jump sprite sheet
            this.spriteHeight = 460; // Adjust based on the jump sprite sheet
            this.maxFrame = 6; // Adjust based on the jump sprite sheet
        }

        ctx.drawImage(
            spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x - cameraOffsetX, this.y,
            this.width, this.height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.maxFrame;
        }
    }

    update(blocks, survivor) {
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            this.isJumping = false;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {

                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    this.isJumping = false;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                }
            }
        });

        // Check for collision with survivor
        const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
        if (dist - survivor.width / 2 - this.width / 2 < 1) {
            if (!invincible) survivor.health -= 10;
            this.x += this.dx * 30;  // Move zombie past the survivor
            score += 10;  // Increase score for surviving an encounter
        }

        this.draw();
        return false;
    }
}

class FastZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed * 1.8, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'red';
    }
}

class StrongZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'purple';
    }

    update(blocks, survivor) {
        const remove = super.update(blocks, survivor);
        if (!remove) {
            // Stronger attack
            const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
            if (dist - survivor.width / 2 - this.width / 2 < 1 && !invincible) {
                survivor.health -= 30;  // Strong zombies deal more damage
                this.x += this.dx * 30;  // Move zombie past the survivor
                score += 20;  // Increase score for surviving an encounter
            }
        }
        return remove;
    }
}

class Bullet {
    constructor(x, y, angle, speed, color, gravity) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        this.gravity = gravity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x - cameraOffsetX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

class Weapon {
    constructor(name, bulletSpeed, bulletColor, bulletGravity) {
        this.name = name;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletGravity = bulletGravity;
    }

    shoot(x, y, angle) {
        return new Bullet(x, y, angle, this.bulletSpeed, this.bulletColor, this.bulletGravity);
    }
}

class HealthBooster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(survivor) {
        // Check for collision with survivor
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            invincible = true;
            this.x = -100;  // Move booster off-screen
            setTimeout(() => { invincible = false; }, 10000);  // Invincibility lasts for 10 seconds
        }
        this.draw();
    }
}

class Defense {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'blue';
        this.fireRate = 4000;  // Fire every 2 seconds
        this.lastFireTime = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(zombies) {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            this.fire(zombies);
            this.lastFireTime = now;
        }
        this.draw();
    }

    fire(zombies) {
        if (zombies.length > 0) {
            const targetZombie = zombies[0];
            const angle = Math.atan2(targetZombie.y - this.y, targetZombie.x - this.x);
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle, 10, 'blue', 0);
            bullets.push(bullet);
        }
    }
}

let survivor = new Survivor(100, canvas.height - 60);
const blocks = [];
const zombies = [];
const bullets = [];
const defenses = [];
const healthBoosters = [];

// Define different types of weapons
const weapons = [
    new Weapon('Pistol', 15, 'yellow', 0.1),
    new Weapon('Shotgun', 10, 'orange', 0.05),
    new Weapon('Rifle', 20, 'red', 0.2)
];

function spawnZombie() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60;
    const speed = Math.random() * 1 + 0.8;
    const direction = -1;

    // Randomly select a zombie type
    const zombieType = Math.random();
    if (zombieType < 0.5) {
        zombies.push(new Zombie(x, y, speed, direction));
    } else if (zombieType < 0.75) {
        zombies.push(new FastZombie(x, y, speed, direction));
    } else {
        zombies.push(new StrongZombie(x, y, speed, direction));
    }

    setTimeout(spawnZombie, 2000 + Math.random() * 3000);
}

function spawnBlock() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60 - Math.random() * 200;
    const width = 50;
    const height = 50;
    blocks.push(new Block(x, y, width, height));

    setTimeout(spawnBlock, 3000 + Math.random() * 3000);
}

function spawnDefense() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 100;
    defenses.push(new Defense(x, y));

    setTimeout(spawnDefense, 10000 + Math.random() * 10000);
}

function spawnHealthBooster() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = Math.random() * (canvas.height - 200) + 60;
    healthBoosters.push(new HealthBooster(x, y));

    setTimeout(spawnHealthBooster, 15000 + Math.random() * 15000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraOffsetX = survivor.x - canvas.width / 2;

    survivor.update(blocks);

    blocks.forEach(block => {
        block.draw();
    });

    defenses.forEach(defense => {
        defense.update(zombies);
    });

    zombies.forEach((zombie, index) => {
        const removeZombie = zombie.update(blocks, survivor);
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(zombie.x + zombie.width / 2 - bullet.x, zombie.y + zombie.height / 2 - bullet.y);
            if (dist - zombie.width / 2 - bullet.radius < 1) {
                setTimeout(() => {
                    zombies.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 50;  // Increase score for killing a zombie
                }, 0);
            }
        });
        if (removeZombie || zombie.x < cameraOffsetX) {
            zombies.splice(index, 1);
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < cameraOffsetX || bullet.x > cameraOffsetX + canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    healthBoosters.forEach(booster => {
        booster.update(survivor);
    });

    // Display score and current weapon
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Weapon: ${weapons[currentWeaponIndex].name}`, 10, 60);

    // Check for game over
    if (survivor.health <= 0) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', cameraOffsetX + canvas.width / 2 - 120, canvas.height / 2);
        setTimeout(showLeaderboard, 1000);  // Show leaderboard after game over
        return;
    }

    if (!gamePaused) {
        animationId = requestAnimationFrame(animate);
    }
}

function showLeaderboard() {
    const playerName = prompt("Enter your name:");
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    survivor = new Survivor(100, canvas.height - 60);
    blocks.length = 0;
    zombies.length = 0;
    bullets.length = 0;
    defenses.length = 0;
    healthBoosters.length = 0;
    score = 0;
    gamePaused = false;
    invincible = false;
    animate();
    spawnZombie();
    spawnBlock();
    spawnDefense();
    spawnHealthBooster();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';
        animate();
    } else {
        gamePaused = true;
        document.getElementById('playPauseBtn').textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

resetGame();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyQ') {
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft + cameraOffsetX;
    mouseY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('click', (e) => {
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    bullets.push(weapons[currentWeaponIndex].shoot(survivor.x + survivor.width / 2, survivor.y + survivor.height / 2, angle));
});*/

/*const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;
const keys = {
    left: false,
    right: false,
    up: false,
    space: false,
};
let mouseX = 0;
let mouseY = 0;
let score = 0;
let gamePaused = false;
let animationId;
let invincible = false;
let currentWeaponIndex = 0;
let cameraOffsetX = 0;

// Load sprite sheets
const zombieWalkImg = new Image();
zombieWalkImg.src = 'zombie_walk.png';
const zombieAttackImg = new Image();
zombieAttackImg.src = 'zombie_attack.png';
const zombieJumpImg = new Image();
zombieJumpImg.src = 'zombie_jump.png';
const zombieDieImg = new Image();
zombieDieImg.src = 'zombie_die.png';

const survivorIdleImg = new Image();
survivorIdleImg.src = '__jet_pack_man_with_weapon_standing_idle.png';
const survivorRunImg = new Image();
survivorRunImg.src = '__jet_pack_man_with_weapon_standing_run.png';
const survivorJumpImg = new Image();
survivorJumpImg.src = '__jet_pack_man_with_weapon_standing_jump.png';
const survivorShootImg = new Image();
survivorShootImg.src = '__jet_pack_man_with_weapon_standing_shoot.png';
const survivorDieImg = new Image();
survivorDieImg.src = '__jet_pack_man_with_weapon_standing_die.png';
const survivorJetpackImg = new Image();
survivorJetpackImg.src = '__jet_pack_man_with_weapon_flying.png'; // Add your jetpack sprite sheet here

class AnimationState {
    constructor(spriteSheet, frameCount, spriteWidth, spriteHeight) {
        this.spriteSheet = spriteSheet;
        this.frameCount = frameCount;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.frame = 0;
        this.frameRate = 0;
    }

    draw(ctx, x, y, width, height, cameraOffsetX) {
        ctx.drawImage(
            this.spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            x - cameraOffsetX, y,
            width, height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.frameCount;
        }
    }
}

class Survivor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 88;
        this.height = 64;
        this.dy = 0;
        this.dx = 0;
        this.speed = 5;
        this.jumpPower = 10;
        this.grounded = false;
        this.health = 100;
        this.fuel = 100; // Jetpack fuel
        this.jetpackPower = 2;
        this.state = 'idle'; // Default state

        this.animationStates = {
            idle: new AnimationState(survivorIdleImg, 5, 881, 639),
            run: new AnimationState(survivorRunImg, 4, 881, 639),
            jump: new AnimationState(survivorJumpImg, 6, 881, 639),
            shoot: new AnimationState(survivorShootImg, 6, 881, 639),
            die: new AnimationState(survivorDieImg, 6, 881, 639),
            jetpack: new AnimationState(survivorJetpackImg, 6, 881, 639), // Add jetpack state
        };
    }

    draw() {
        this.animationStates[this.state].draw(ctx, this.x, this.y, this.width, this.height, cameraOffsetX);

        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width * (this.health / 100), 5);
        // Draw fuel bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width * (this.fuel / 100), 5);
    }

    update(blocks) {
        if (keys.left) this.dx = -this.speed;
        else if (keys.right) this.dx = this.speed;
        else this.dx = 0;

        if (keys.up && this.fuel > 0) {
            this.dy = -this.jetpackPower;
            this.fuel -= 0.5; // Decrease fuel when jetpack is used
            this.state = 'jetpack'; // Use jetpack animation state
        } else {
            this.dy += gravity;
            if (this.fuel < 100) this.fuel += 0.1; // Slowly refill fuel when not using jetpack
            if (this.state === 'jetpack' && this.grounded) this.state = 'idle'; // Change state to idle if grounded
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.dx !== 0 && this.state !== 'jetpack') this.state = 'run';
        else if (this.state !== 'jetpack') this.state = 'idle';

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            if (this.state === 'jump') this.state = 'idle';
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {
        
                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    if (this.state === 'jump' || this.state === 'jetpack') this.state = 'idle';
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + block.width;
                }
            }
        });

        this.draw();
    }

    shoot() {
        const prevState = this.state;
        this.state = 'shoot';
        setTimeout(() => {
            this.state = prevState;
        }, 300);
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }
}

class Zombie {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.dx = speed * direction;
        this.speed = speed;
        this.jumpPower = 10;
        this.grounded = false;
        this.frame = 0;
        this.frameRate = 0;
        this.maxFrame = 6; // Adjust based on the sprite sheet
        this.spriteSheet = zombieWalkImg;
        this.spriteWidth = 215; // Adjust based on the sprite sheet
        this.spriteHeight = 410; // Adjust based on the sprite sheet
        this.width = this.spriteWidth / 5;
        this.height = this.spriteHeight / 5;
        this.isJumping = false;
    }

    draw() {
        let spriteSheet = this.spriteSheet;
        if (this.isJumping) {
            spriteSheet = zombieJumpImg;
            this.spriteWidth = 215; // Adjust based on the jump sprite sheet
            this.spriteHeight = 460; // Adjust based on the jump sprite sheet
            this.maxFrame = 6; // Adjust based on the jump sprite sheet
        }

        ctx.drawImage(
            spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x - cameraOffsetX, this.y,
            this.width, this.height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.maxFrame;
        }
    }

    update(blocks, survivor) {
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            this.isJumping = false;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {

                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    this.isJumping = false;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                }
            }
        });

        // Check for collision with survivor
        const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
        if (dist - survivor.width / 2 - this.width / 2 < 1) {
            if (!invincible) survivor.health -= 10;
            this.x += this.dx * 30;  // Move zombie past the survivor
            score += 10;  // Increase score for surviving an encounter
        }

        this.draw();
        return false;
    }
}

class FastZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed * 1.8, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'red';
    }
}

class StrongZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'purple';
    }

    update(blocks, survivor) {
        const remove = super.update(blocks, survivor);
        if (!remove) {
            // Stronger attack
            const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
            if (dist - survivor.width / 2 - this.width / 2 < 1 && !invincible) {
                survivor.health -= 30;  // Strong zombies deal more damage
                this.x += this.dx * 30;  // Move zombie past the survivor
                score += 20;  // Increase score for surviving an encounter
            }
        }
        return remove;
    }
}

class Bullet {
    constructor(x, y, angle, speed, color, gravity) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        this.gravity = gravity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x - cameraOffsetX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

class Weapon {
    constructor(name, bulletSpeed, bulletColor, bulletGravity) {
        this.name = name;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletGravity = bulletGravity;
    }

    shoot(x, y, angle) {
        return new Bullet(x, y, angle, this.bulletSpeed, this.bulletColor, this.bulletGravity);
    }
}

class HealthBooster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(survivor) {
        // Check for collision with survivor
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            invincible = true;
            this.x = -100;  // Move booster off-screen
            setTimeout(() => { invincible = false; }, 10000);  // Invincibility lasts for 10 seconds
        }
        this.draw();
    }
}

class Defense {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'blue';
        this.fireRate = 4000;  // Fire every 2 seconds
        this.lastFireTime = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(zombies) {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            this.fire(zombies);
            this.lastFireTime = now;
        }
        this.draw();
    }

    fire(zombies) {
        if (zombies.length > 0) {
            const targetZombie = zombies[0];
            const angle = Math.atan2(targetZombie.y - this.y, targetZombie.x - this.x);
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle, 10, 'blue', 0);
            bullets.push(bullet);
        }
    }
}

let survivor = new Survivor(100, canvas.height - 60);
const blocks = [];
const zombies = [];
const bullets = [];
const defenses = [];
const healthBoosters = [];

// Define different types of weapons
const weapons = [
    new Weapon('Pistol', 15, 'yellow', 0.1),
    new Weapon('Shotgun', 10, 'orange', 0.05),
    new Weapon('Rifle', 20, 'red', 0.2)
];

function spawnZombie() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60;
    const speed = Math.random() * 1 + 0.8;
    const direction = -1;

    // Randomly select a zombie type
    const zombieType = Math.random();
    if (zombieType < 0.5) {
        zombies.push(new Zombie(x, y, speed, direction));
    } else if (zombieType < 0.75) {
        zombies.push(new FastZombie(x, y, speed, direction));
    } else {
        zombies.push(new StrongZombie(x, y, speed, direction));
    }

    setTimeout(spawnZombie, 2000 + Math.random() * 3000);
}

function spawnBlock() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60 - Math.random() * 200;
    const width = 50;
    const height = 50;
    blocks.push(new Block(x, y, width, height));

    setTimeout(spawnBlock, 3000 + Math.random() * 3000);
}

function spawnDefense() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 100;
    defenses.push(new Defense(x, y));

    setTimeout(spawnDefense, 10000 + Math.random() * 10000);
}

function spawnHealthBooster() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = Math.random() * (canvas.height - 200) + 60;
    healthBoosters.push(new HealthBooster(x, y));

    setTimeout(spawnHealthBooster, 15000 + Math.random() * 15000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraOffsetX = survivor.x - canvas.width / 2;

    survivor.update(blocks);

    blocks.forEach(block => {
        block.draw();
    });

    defenses.forEach(defense => {
        defense.update(zombies);
    });

    zombies.forEach((zombie, index) => {
        const removeZombie = zombie.update(blocks, survivor);
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(zombie.x + zombie.width / 2 - bullet.x, zombie.y + zombie.height / 2 - bullet.y);
            if (dist - zombie.width / 2 - bullet.radius < 1) {
                setTimeout(() => {
                    zombies.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 50;  // Increase score for killing a zombie
                }, 0);
            }
        });
        if (removeZombie || zombie.x < cameraOffsetX) {
            zombies.splice(index, 1);
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < cameraOffsetX || bullet.x > cameraOffsetX + canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    healthBoosters.forEach(booster => {
        booster.update(survivor);
    });

    // Display score and current weapon
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Weapon: ${weapons[currentWeaponIndex].name}`, 10, 60);

    // Check for game over
    if (survivor.health <= 0) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', cameraOffsetX + canvas.width / 2 - 120, canvas.height / 2);
        setTimeout(showLeaderboard, 1000);  // Show leaderboard after game over
        return;
    }

    if (!gamePaused) {
        animationId = requestAnimationFrame(animate);
    }
}

function showLeaderboard() {
    const playerName = prompt("Enter your name:");
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    survivor = new Survivor(100, canvas.height - 60);
    blocks.length = 0;
    zombies.length = 0;
    bullets.length = 0;
    defenses.length = 0;
    healthBoosters.length = 0;
    score = 0;
    gamePaused = false;
    invincible = false;
    animate();
    spawnZombie();
    spawnBlock();
    spawnDefense();
    spawnHealthBooster();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';
        animate();
    } else {
        gamePaused = true;
        document.getElementById('playPauseBtn').textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

resetGame();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyQ') {
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft + cameraOffsetX;
    mouseY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('click', (e) => {
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    bullets.push(weapons[currentWeaponIndex].shoot(survivor.x + survivor.width / 2, survivor.y + survivor.height / 2, angle));
    survivor.shoot(); // Trigger shooting animation
});*/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;
const keys = {
    left: false,
    right: false,
    up: false,
    space: false,
};
let mouseX = 0;
let mouseY = 0;
let score = 0;
let gamePaused = false;
let animationId;
let invincible = false;
let currentWeaponIndex = 0;
let cameraOffsetX = 0;

// Load sprite sheets
const zombieWalkImg = new Image();
zombieWalkImg.src = 'zombie_walk.png';
const zombieAttackImg = new Image();
zombieAttackImg.src = 'zombie_attack.png';
const zombieJumpImg = new Image();
zombieJumpImg.src = 'zombie_jump.png';
const zombieDieImg = new Image();
zombieDieImg.src = 'zombie_die.png';

const survivorIdleImg = new Image();
survivorIdleImg.src = '__jet_pack_man_with_weapon_standing_idle.png';
const survivorRunImg = new Image();
survivorRunImg.src = '__jet_pack_man_with_weapon_standing_run.png';
const survivorJumpImg = new Image();
survivorJumpImg.src = '__jet_pack_man_with_weapon_standing_jump.png';
const survivorShootImg = new Image();
survivorShootImg.src = '__jet_pack_man_with_weapon_standing_shoot.png';
const survivorDieImg = new Image();
survivorDieImg.src = '__jet_pack_man_with_weapon_standing_die.png';
const survivorJetpackImg = new Image();
survivorJetpackImg.src = '__jet_pack_man_with_weapon_flying.png'; // Add your jetpack sprite sheet here

const backgroundImg = new Image();
backgroundImg.src = 'background.jpg'; // Load the background image

class AnimationState {
    constructor(spriteSheet, frameCount, spriteWidth, spriteHeight) {
        this.spriteSheet = spriteSheet;
        this.frameCount = frameCount;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.frame = 0;
        this.frameRate = 0;
    }

    draw(ctx, x, y, width, height, cameraOffsetX) {
        ctx.drawImage(
            this.spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            x - cameraOffsetX, y,
            width, height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.frameCount;
        }
    }
}

class Survivor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 88;
        this.height = 64;
        this.dy = 0;
        this.dx = 0;
        this.speed = 5;
        this.jumpPower = 10;
        this.grounded = false;
        this.health = 100;
        this.fuel = 100; // Jetpack fuel
        this.jetpackPower = 2;
        this.state = 'idle'; // Default state

        this.animationStates = {
            idle: new AnimationState(survivorIdleImg, 5, 881, 639),
            run: new AnimationState(survivorRunImg, 4, 881, 639),
            jump: new AnimationState(survivorJumpImg, 6, 881, 639),
            shoot: new AnimationState(survivorShootImg, 6, 881, 639),
            die: new AnimationState(survivorDieImg, 6, 881, 639),
            jetpack: new AnimationState(survivorJetpackImg, 6, 881, 639), // Add jetpack state
        };
    }

    draw() {
        this.animationStates[this.state].draw(ctx, this.x, this.y, this.width, this.height, cameraOffsetX);

        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 10, this.width * (this.health / 100), 5);
        // Draw fuel bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x - cameraOffsetX, this.y - 20, this.width * (this.fuel / 100), 5);
    }

    update(blocks) {
        if (keys.left) this.dx = -this.speed;
        else if (keys.right) this.dx = this.speed;
        else this.dx = 0;

        if (keys.up && this.fuel > 0) {
            this.dy = -this.jetpackPower;
            this.fuel -= 0.5; // Decrease fuel when jetpack is used
            this.state = 'jetpack'; // Use jetpack animation state
        } else {
            this.dy += gravity;
            if (this.fuel < 100) this.fuel += 0.1; // Slowly refill fuel when not using jetpack
            if (this.state === 'jetpack' && this.grounded) this.state = 'idle'; // Change state to idle if grounded
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.dx !== 0 && this.state !== 'jetpack') this.state = 'run';
        else if (this.state !== 'jetpack') this.state = 'idle';

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            if (this.state === 'jump') this.state = 'idle';
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {
        
                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    if (this.state === 'jump' || this.state === 'jetpack') this.state = 'idle';
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + block.width;
                }
            }
        });

        this.draw();
    }

    shoot() {
        const prevState = this.state;
        this.state = 'shoot';
        setTimeout(() => {
            this.state = prevState;
        }, 300);
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }
}

class Zombie {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.dy = 0;
        this.dx = speed * direction;
        this.speed = speed;
        this.jumpPower = 10;
        this.grounded = false;
        this.frame = 0;
        this.frameRate = 0;
        this.maxFrame = 6; // Adjust based on the sprite sheet
        this.spriteSheet = zombieWalkImg;
        this.spriteWidth = 215; // Adjust based on the sprite sheet
        this.spriteHeight = 410; // Adjust based on the sprite sheet
        this.width = this.spriteWidth / 5;
        this.height = this.spriteHeight / 5;
        this.isJumping = false;
    }

    draw() {
        let spriteSheet = this.spriteSheet;
        if (this.isJumping) {
            spriteSheet = zombieJumpImg;
            this.spriteWidth = 215; // Adjust based on the jump sprite sheet
            this.spriteHeight = 460; // Adjust based on the jump sprite sheet
            this.maxFrame = 6; // Adjust based on the jump sprite sheet
        }

        ctx.drawImage(
            spriteSheet,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x - cameraOffsetX, this.y,
            this.width, this.height
        );

        this.frameRate++;
        if (this.frameRate % 6 === 0) {
            this.frame = (this.frame + 1) % this.maxFrame;
        }
    }

    update(blocks, survivor) {
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;

        // Boundary collision detection
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            this.isJumping = false;
        }

        // Block collision detection
        blocks.forEach(block => {
            if (this.x < block.x + block.width &&
                this.x + this.width > block.x &&
                this.y < block.y + block.height &&
                this.y + this.height > block.y) {

                if (this.dy > 0 && this.y + this.height - this.dy <= block.y) {  // Landing on top of the block
                    this.y = block.y - this.height;
                    this.dy = 0;
                    this.grounded = true;
                    this.isJumping = false;
                } else if (this.dy < 0 && this.y >= block.y + block.height) {  // Hitting the bottom of the block
                    this.dy = 0;
                    this.y = block.y + block.height;
                } else if (this.dx > 0) {  // Colliding with the left side of the block
                    this.x = block.x - this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                } else if (this.dx < 0) {  // Colliding with the right side of the block
                    this.x = block.x + this.width;
                    this.dy = -this.jumpPower;  // Jump over the block
                    this.isJumping = true;
                }
            }
        });

        // Check for collision with survivor
        const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
        if (dist - survivor.width / 2 - this.width / 2 < 1) {
            if (!invincible) survivor.health -= 10;
            this.x += this.dx * 30;  // Move zombie past the survivor
            score += 10;  // Increase score for surviving an encounter
        }

        this.draw();
        return false;
    }
}

class FastZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed * 1.8, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'red';
    }
}

class StrongZombie extends Zombie {
    constructor(x, y, speed, direction) {
        super(x, y, speed, direction);
        this.spriteSheet = zombieWalkImg; // Use a different sprite sheet if needed
        this.color = 'purple';
    }

    update(blocks, survivor) {
        const remove = super.update(blocks, survivor);
        if (!remove) {
            // Stronger attack
            const dist = Math.hypot(survivor.x + survivor.width / 2 - this.x, survivor.y + survivor.height / 2 - this.y);
            if (dist - survivor.width / 2 - this.width / 2 < 1 && !invincible) {
                survivor.health -= 30;  // Strong zombies deal more damage
                this.x += this.dx * 30;  // Move zombie past the survivor
                score += 20;  // Increase score for surviving an encounter
            }
        }
        return remove;
    }
}

class Bullet {
    constructor(x, y, angle, speed, color, gravity) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        this.gravity = gravity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x - cameraOffsetX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

class Weapon {
    constructor(name, bulletSpeed, bulletColor, bulletGravity) {
        this.name = name;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletGravity = bulletGravity;
    }

    shoot(x, y, angle) {
        return new Bullet(x, y, angle, this.bulletSpeed, this.bulletColor, this.bulletGravity);
    }
}

class HealthBooster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(survivor) {
        // Check for collision with survivor
        if (this.x < survivor.x + survivor.width &&
            this.x + this.width > survivor.x &&
            this.y < survivor.y + survivor.height &&
            this.y + this.height > survivor.y) {
            invincible = true;
            this.x = -100;  // Move booster off-screen
            setTimeout(() => { invincible = false; }, 10000);  // Invincibility lasts for 10 seconds
        }
        this.draw();
    }
}

class Defense {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'blue';
        this.fireRate = 4000;  // Fire every 2 seconds
        this.lastFireTime = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraOffsetX, this.y, this.width, this.height);
    }

    update(zombies) {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            this.fire(zombies);
            this.lastFireTime = now;
        }
        this.draw();
    }

    fire(zombies) {
        if (zombies.length > 0) {
            const targetZombie = zombies[0];
            const angle = Math.atan2(targetZombie.y - this.y, targetZombie.x - this.x);
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle, 10, 'blue', 0);
            bullets.push(bullet);
        }
    }
}

let survivor = new Survivor(100, canvas.height - 60);
const blocks = [];
const zombies = [];
const bullets = [];
const defenses = [];
const healthBoosters = [];

// Define different types of weapons
const weapons = [
    new Weapon('Pistol', 15, 'yellow', 0.1),
    new Weapon('Shotgun', 10, 'orange', 0.05),
    new Weapon('Rifle', 20, 'red', 0.2)
];

function spawnZombie() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60;
    const speed = Math.random() * 1 + 0.8;
    const direction = -1;

    // Randomly select a zombie type
    const zombieType = Math.random();
    if (zombieType < 0.5) {
        zombies.push(new Zombie(x, y, speed, direction));
    } else if (zombieType < 0.75) {
        zombies.push(new FastZombie(x, y, speed, direction));
    } else {
        zombies.push(new StrongZombie(x, y, speed, direction));
    }

    setTimeout(spawnZombie, 2000 + Math.random() * 3000);
}

function spawnBlock() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 60 - Math.random() * 200;
    const width = 50;
    const height = 50;
    blocks.push(new Block(x, y, width, height));

    setTimeout(spawnBlock, 3000 + Math.random() * 3000);
}

function spawnDefense() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = canvas.height - 100;
    defenses.push(new Defense(x, y));

    setTimeout(spawnDefense, 10000 + Math.random() * 10000);
}

function spawnHealthBooster() {
    const x = survivor.x + canvas.width + Math.random() * 200;
    const y = Math.random() * (canvas.height - 200) + 60;
    healthBoosters.push(new HealthBooster(x, y));

    setTimeout(spawnHealthBooster, 15000 + Math.random() * 15000);
}

/*function drawBackground() {
    const backgroundWidth = backgroundImg.width;
    const backgroundHeight = backgroundImg.height;
    const scaledHeight = canvas.height;
    const scaledWidth = (scaledHeight / backgroundHeight) * backgroundWidth;

    const repeatCount = Math.ceil(canvas.width / scaledWidth) + 1;

    for (let i = 0; i < repeatCount; i++) {
        ctx.drawImage(backgroundImg, i * scaledWidth - (cameraOffsetX % scaledWidth), 0, scaledWidth, scaledHeight);
    }
}*/

function drawBackground() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Determine the scale factor to cover the entire canvas
    const scaleWidth = canvasWidth / backgroundImg.width;
    const scaleHeight = canvasHeight / backgroundImg.height;
    const scaleFactor = Math.max(scaleWidth, scaleHeight);
    
    // Calculate the scaled dimensions
    const scaledWidth = backgroundImg.width * scaleFactor;
    const scaledHeight = backgroundImg.height * scaleFactor;

    // Calculate the position to center the image
    const xOffset = (canvasWidth - scaledWidth) / 2;
    const yOffset = (canvasHeight - scaledHeight) / 2;
    
    // Draw the background image scaled to cover the entire canvas
    ctx.drawImage(backgroundImg, xOffset, yOffset, scaledWidth, scaledHeight);
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraOffsetX = survivor.x - canvas.width / 2;

    drawBackground(); // Draw the background before everything else

    survivor.update(blocks);

    blocks.forEach(block => {
        block.draw();
    });

    defenses.forEach(defense => {
        defense.update(zombies);
    });

    zombies.forEach((zombie, index) => {
        const removeZombie = zombie.update(blocks, survivor);
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(zombie.x + zombie.width / 2 - bullet.x, zombie.y + zombie.height / 2 - bullet.y);
            if (dist - zombie.width / 2 - bullet.radius < 1) {
                setTimeout(() => {
                    zombies.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 50;  // Increase score for killing a zombie
                }, 0);
            }
        });
        if (removeZombie || zombie.x < cameraOffsetX) {
            zombies.splice(index, 1);
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.x < cameraOffsetX || bullet.x > cameraOffsetX + canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    healthBoosters.forEach(booster => {
        booster.update(survivor);
    });

    // Display score and current weapon
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Weapon: ${weapons[currentWeaponIndex].name}`, 10, 60);

    // Check for game over
    if (survivor.health <= 0) {
        cancelAnimationFrame(animationId);
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', cameraOffsetX + canvas.width / 2 - 120, canvas.height / 2);
        setTimeout(showLeaderboard, 1000);  // Show leaderboard after game over
        return;
    }

    if (!gamePaused) {
        animationId = requestAnimationFrame(animate);
    }
}

function showLeaderboard() {
    const playerName = prompt("Enter your name:");
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function resetGame() {
    survivor = new Survivor(100, canvas.height - 60);
    blocks.length = 0;
    zombies.length = 0;
    bullets.length = 0;
    defenses.length = 0;
    healthBoosters.length = 0;
    score = 0;
    gamePaused = false;
    invincible = false;
    animate();
    spawnZombie();
    spawnBlock();
    spawnDefense();
    spawnHealthBooster();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (gamePaused) {
        gamePaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';
        animate();
    } else {
        gamePaused = true;
        document.getElementById('playPauseBtn').textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

resetGame();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyQ') {
        currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - canvas.offsetLeft + cameraOffsetX;
    mouseY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('click', (e) => {
    const angle = Math.atan2(mouseY - (survivor.y + survivor.height / 2), mouseX - (survivor.x + survivor.width / 2));
    bullets.push(weapons[currentWeaponIndex].shoot(survivor.x + survivor.width / 2, survivor.y + survivor.height / 2, angle));
    survivor.shoot(); // Trigger shooting animation
});
