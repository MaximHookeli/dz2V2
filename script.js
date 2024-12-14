document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const dino = document.getElementById('dino');
    const scoreElement = document.getElementById('score');
    const messageElement = document.getElementById('message');
    const autoJumpButton = document.getElementById('autoJumpButton');

    let score = 0;
    let isJumping = false;
    let baseSpeed = 8;
    let shieldActive = false;
    let doubleScoreActive = false;
    let jumpBlocked = false; // Флаг для блокировки прыжков
    let immortal = false; // Флаг для бессмертия
    let autoJumpEnabled = false; // Изначально авто-прыжок выключен

    function jump() {
        if (isJumping || jumpBlocked) return;
        isJumping = true;
        dino.classList.add('jump');
        setTimeout(() => {
            dino.classList.remove('jump');
            isJumping = false;
        }, 500);
    }

    function createObstacle(type, subType = null, bottomPosition = '0') {
        const obstacle = document.createElement('div');
        obstacle.classList.add(type);
        if (subType) {
            obstacle.dataset.subType = subType;
        }
        obstacle.style.right = '-50px';
        obstacle.style.bottom = bottomPosition;

        gameArea.appendChild(obstacle);

        const interval = setInterval(() => {
            let right = parseInt(obstacle.style.right || '0') + baseSpeed;
            obstacle.style.right = `${right}px`;

            if (right > gameArea.offsetWidth + 50) {
                obstacle.remove();
                clearInterval(interval);
            }
        }, 20);
    }

    function spawnCactus() {
        createObstacle('cactus');
        const randomSpawningSpeed = Math.random() * (3000 - 1000) + 1000;
        setTimeout(spawnCactus, randomSpawningSpeed);
    }

    function spawnBonus() {
        const bonusTypes = ['shield', 'doubleScore', 'magnet', 'slowdown'];
        const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        createObstacle('bonus', bonusType);
        setTimeout(spawnBonus, 30000);
    }

    function spawnDebuff() {
        const debuffTypes = ['speed', 'blur', 'jumpBlock'];
        const debuffType = debuffTypes[Math.floor(Math.random() * debuffTypes.length)];
        createObstacle('debuff', debuffType);
        setTimeout(spawnDebuff, 30000);
    }

    function spawnBird() {
        if (score >= 1000) {
            createObstacle('bird', null, '100px');
            setTimeout(spawnBird, Math.random() * 5000 + 5000);
        }
    }

    function updateScore() {
        setInterval(() => {
            score += doubleScoreActive ? 2 : 1;
            scoreElement.textContent = score;

            if (score % 100 === 0) {
                baseSpeed += 1;
            }

            if (score >= 1000) {
                spawnBird();
            }
        }, 100);
    }

    function endGame() {
        alert('Конец игры! Ваш счёт: ' + score);
        document.location.reload();
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') jump();
    });

    function isCollision(dinoRect, obstacleRect) {
        return !(
            dinoRect.top > obstacleRect.bottom ||
            dinoRect.bottom < obstacleRect.top ||
            dinoRect.right < obstacleRect.left ||
            dinoRect.left > obstacleRect.right
        );
    }

    function checkForObstacles() {
        const dinoRect = dino.getBoundingClientRect();
        const obstacles = document.querySelectorAll('.cactus');

        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            const distance = obstacleRect.left - dinoRect.right;

            // Уменьшаем дистанцию для прыжка с 150 до 80 пикселей
            if (distance > 0 && distance < 80 && !isJumping && autoJumpEnabled) {
                jump();
            }
        });
    }

    function checkCollisions() {
        setInterval(() => {
            checkForObstacles(); // Добавляем проверку препятствий
            const dinoRect = dino.getBoundingClientRect();
            const obstacles = document.querySelectorAll('.cactus, .bird, .bonus, .debuff');
            obstacles.forEach(obstacle => {
                const obstacleRect = obstacle.getBoundingClientRect();
                if (isCollision(dinoRect, obstacleRect)) {
                    const type = obstacle.className;
                    const subType = obstacle.dataset.subType;

                    obstacle.remove();

                    if (type.includes('bonus')) {
                        handleBonus(subType);
                    } else if (type.includes('debuff')) {
                        handleDebuff(subType);
                    } else if (immortal) {
                        if (type.includes('cactus')) {
                            score = Math.max(0, score - 100); // Снимает 100 очков за сбитый кактус
                            scoreElement.textContent = score;
                        }
                    } else if (!shieldActive) {
                        endGame();
                    }
                }
            });
        }, 100);
    }

    function handleBonus(subType) {
        switch(subType) {
            case 'shield':
                activateShield();
                showMessage('Активирован бафф: Щит!');
                break;
            case 'doubleScore':
                activateDoubleScore();
                showMessage('Активирован бафф: Двойные очки!');
                break;
            case 'magnet':
                activateMagnet();
                showMessage('Активирован бафф: Магнит!');
                break;
            case 'slowdown':
                activateSlowdown();
                showMessage('Активирован бафф: Замедление препятствий!');
                break;
        }
    }

    function handleDebuff(subType) {
        switch(subType) {
            case 'speed':
                baseSpeed += 2;
                showMessage('На вас наложен дебафф: Ускорение препятствий!');
                break;
            case 'blur':
                activateBlur();
                showMessage('На вас наложен дебафф: Эффект тумана!');
                break;
            case 'jumpBlock':
                activateJumpBlock();
                showMessage('На вас наложен дебафф: Блокировка прыжков!');
                break;
        }
    }

    function activateShield() {
        shieldActive = true;
        setTimeout(() => shieldActive = false, 10000);
    }

    function activateDoubleScore() {
        doubleScoreActive = true;
        setTimeout(() => doubleScoreActive = false, 10000);
    }

    function activateMagnet() {
        // Логика для магнита, если необходимо
    }

    function activateSlowdown() {
        const originalSpeed = baseSpeed;
        baseSpeed = Math.max(baseSpeed - 3, 1);
        setTimeout(() => baseSpeed = originalSpeed, 5000);
    }

    function activateBlur() {
        document.body.style.filter = 'blur(5px)';
        setTimeout(() => document.body.style.filter = 'none', 5000);
    }

    function activateJumpBlock() {
        jumpBlocked = true;
        immortal = true;
        setTimeout(() => {
            jumpBlocked = false;
            immortal = false;
        }, 5000);
    }

    function showMessage(message) {
        messageElement.textContent = message;
        setTimeout(() => {
            messageElement.textContent = '';
        }, 3000);
    }

    // Обработчик нажатия на кнопку авто-прыжка
    autoJumpButton.addEventListener('click', () => {
        autoJumpEnabled = !autoJumpEnabled;
        autoJumpButton.textContent = autoJumpEnabled ? 'Выключить авто-прыжок' : 'Включить авто-прыжок';
        showMessage(autoJumpEnabled ? 'Авто-прыжок включен!' : 'Авто-прыжок выключен!');
    });

    function startGame() {
        updateScore();
        spawnCactus();
        spawnBonus();
        spawnDebuff();
        checkCollisions();
    }

    startGame();
});