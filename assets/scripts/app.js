const ATTACK_VALUE = 10;
const STRONG_ATTACK_VALUE = 19;
const MONSTER_ATTACK_VALUE = 13;
const HEAL_VALUE = 30;
const MODE_ATTACK = "ATTACK";
const MODE_STRONG_ATTACK = "STRONG_ATTACK";
const LOG_EVENT_PLAYER_ATTACK = "PLAYER_ATTACK";
const LOG_EVENT_PLAYER_STRONG_ATTACK = "PLAYER_STRONG_ATTACK";
const LOG_EVENT_MONSTER_ATTACK = "MONESTER_ATTACK";
const LOG_EVENT_PLAYER_HEAL = "PLAYER_HEAL";
const LOG_EVENT_GAME_OVER = "GAME_OVER";

function getMaxlifeValue() {
    const enteredValue = 100 || prompt("Maximum life for you and the monster.");
    const parsedValue = +enteredValue;
    if (isNaN(parsedValue) || parsedValue <= 0) {
        throw { message: "User input is not a number. Please enter a number." };
    }
    return parsedValue;
}
let chosenMaxLife;

try {
    chosenMaxLife = getMaxlifeValue();
} catch (error) {
    chosenMaxLife = 100;
    alert("Entered value is not a number so the default max life is taken!");
}

let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true
let battleLog = [];
adjustHealthBars(chosenMaxLife);

function writeToLog(event, value, monsterHealth, playerHealth) {
    let logEntry = {
        event: event,
        value: value,
        finalMonsterHealth: monsterHealth,
        finalPlayerHealth: playerHealth,
    }
    switch (event) {
        case LOG_EVENT_PLAYER_ATTACK:
            logEntry.target = "MONSTER";
            break;
        case LOG_EVENT_PLAYER_STRONG_ATTACK:
            logEntry.target = "MONSTER";
            break;
        case LOG_EVENT_MONSTER_ATTACK:
            logEntry.target = "PLAYER";
            break;
        case LOG_EVENT_PLAYER_HEAL:
            logEntry.target = "PLAYER";
            break;
        case LOG_EVENT_GAME_OVER:
            logEntry = {
                event: event,
                value: value,
                finalMonsterHealth: monsterHealth,
                finalPlayerHealth: playerHealth,
            }
            break;
        default:
            logEntry = {};
    }
    battleLog.push(logEntry)
}

function reset() {
    currentMonsterHealth = chosenMaxLife;
    currentPlayerHealth = chosenMaxLife;
    resetGame(chosenMaxLife);
}

function endRound() {
    const initialPlayerHealth = currentPlayerHealth;
    const playerDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= playerDamage;
    writeToLog(LOG_EVENT_MONSTER_ATTACK, playerDamage, currentMonsterHealth, currentPlayerHealth);
    if (currentPlayerHealth <= 0 && hasBonusLife) {
        hasBonusLife = false;
        removeBonusLife();
        currentPlayerHealth = initialPlayerHealth;
        alert("You would be dead but the bonus life saved you!")
        setPlayerHealth(initialPlayerHealth);
    }
    if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
        alert('You won!')
        writeToLog(LOG_EVENT_GAME_OVER, "PLAYER WON!", currentMonsterHealth, currentPlayerHealth);
        reset()
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
        alert('You lost!')
        writeToLog(LOG_EVENT_GAME_OVER, "MONSTER WON!", currentMonsterHealth, currentPlayerHealth);
        reset()
    } else if (currentMonsterHealth <= 0 && currentPlayerHealth <= 0) {
        alert("It's a Draw!")
        writeToLog(LOG_EVENT_GAME_OVER, "IT'S A DRAW!", currentMonsterHealth, currentPlayerHealth);
        reset()
    }
}

function attackMonster(mode) {
    const maxDamage = mode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK_VALUE;
    const logEvent = mode === MODE_ATTACK ? LOG_EVENT_PLAYER_ATTACK : LOG_EVENT_PLAYER_STRONG_ATTACK;
    const damage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= damage;
    writeToLog(logEvent, damage, currentMonsterHealth, currentPlayerHealth);
    animateAttack(mode)
    endRound()
}

function attackHandler() {
    attackMonster(MODE_ATTACK)
}

function strongAttackHandler() {
    attackMonster(MODE_STRONG_ATTACK);
}

function healPlayerHealth() {
    let healValue;
    if (currentPlayerHealth >= chosenMaxLife) {
        alert("You can't heal yourself more than max life")
    }
    else if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
        healValue = chosenMaxLife - currentPlayerHealth;
    } else {
        healValue = HEAL_VALUE
    }
    increasePlayerHealth(healValue);
    currentPlayerHealth += healValue;
    writeToLog(LOG_EVENT_PLAYER_HEAL, healValue, currentMonsterHealth, currentPlayerHealth);
    endRound()
    animateHeal()
}

function printLogHandler() {
    let i = 0;
    for (const logEntry of battleLog) {
        console.log(`#${i}`)
        for (const key in logEntry) {
            console.log(key, logEntry[key])
        }
        i++
    }
}


function animateAttack(mode) {
    let image = document.createElement("img");
    const multi = (mode == MODE_STRONG_ATTACK)
    let src = multi ? "./assets/images/arrowMulti.png" : "./assets/images/arrow.png"
    image.setAttribute("src", src);
    image.classList.add("arrow");
    gameBoard.appendChild(image)

    player.classList.add("shrink")

    setTimeout(() => {
        monster.classList.add("shake")
    }, 210)

    setTimeout(() => {
        gameBoard.removeChild(image)
        player.classList.remove("shrink")
        monster.classList.remove("shake")
    }, 500)
}


function animateHeal(mode) {
    let image = document.createElement("img");
    const multi = (mode == MODE_STRONG_ATTACK)
    let src = "./assets/images/heal.png"
    image.setAttribute("src", src);
    image.classList.add("heal");
    gameBoard.appendChild(image)

    player.classList.add("healing")

    setTimeout(() => {
        gameBoard.removeChild(image)
        player.classList.remove("healing")
    }, 500)
}
attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healPlayerHealth);
logBtn.addEventListener('click', printLogHandler);