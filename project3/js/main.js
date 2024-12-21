// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();
// Variables for game
let sceneWidth, sceneHeight;
let stage;
let assets;
let startScene;
let gameScene;
let gameOverScene;
let map;
let mapX = 300;
let mapY = 50;
let town;
let store;
let building = false;
let buildings = [];
let newBuilding;
let mousePosition;
let bullets = [];
let enemies = [];
let warnings = [];
let level = 0;
let levelLabel;
let gold = 6;
let goldLabel;
let elapsedTime = 0;
let hitSound;
let enemyDownSound;
let shootSound;
let highestLevel
let healthLabel;
let health = 3
// Load all assets
loadImages();

async function loadImages() {
    // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
    PIXI.Assets.addBundle("sprites", {
        //spaceship: "images/spaceship.png",
        //explosions: "images/explosions.png",
        //move: "images/move.png",
    });

    // The second argument is a callback function that is called whenever the loader makes progress.
    assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
        console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
    });

    setup();
}

// Sets up the game by setting up labels, buttons, and scenes.
async function setup() {
    // Set up canvas for pixi as well as position based variables
    await app.init({ width: 1000, height: 700 });
    document.body.appendChild(app.canvas);
    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;
    mousePosition = app.renderer.events.pointer.global;
    // Change the color o fthe background
    app.renderer.background.color = 0x39963b
    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    // Create labels for all 3 scenes
    createLabelsAndButtons();
    setUpTownAndStore();
    setUpBuildingLabelsAndButtons();

    // Load Sounds
    enemyDownSound = new Howl({
        src: ["sounds/hitHurt.wav"],
    });

    hitSound = new Howl({
        src: ["sounds/explosion.wav"],
    });

    shootSound = new Howl({
        src: ["sounds/laserShoot.wav"],
    })

    // Establish game loop
    app.ticker.add(gameLoop)
}

// Create labels and buttons for the start and gameOver scenes.
function createLabelsAndButtons(){
    let buttonStyle = {
        fill: 0x000000,
        fontSize: 48,
        fontFamily: "Oswald",
    }

    // 1 set up startScene
    // 1A make top start label
    let startLabel1 = new PIXI.Text("Clyde's Revolution", {
        fill: 0xffffff,
        fontSize: 96,
        fontFamily: "League Gothic",
        stroke: 0x000000,
        strokeThickness: 6,
    })
    startLabel1.x = sceneWidth / 2 - startLabel1.width / 2;
    startLabel1.y = sceneHeight - 600;
    startScene.addChild(startLabel1);

    // 1B make middle start label
    let startLabel2 = new PIXI.Text("Defend Clyde's Sqaure Workforce Union against those pesky circles \n               Buy buildings to attack them and defend the union!", {
        fill: 0xffffff,
        fontSize: 32,
        fontFamily: "League Gothic",
        fontStyle: "italic",
        stroke: 0x000000,
        strokeThickness: 6,
    })
    startLabel2.x = sceneWidth / 2 - startLabel2.width / 2;;
    startLabel2.y = sceneHeight - 450;;
    startScene.addChild(startLabel2);

    // 1C make start game button
    let startButton = new PIXI.Text("Click to Start!", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 150;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", (e) => (e.target.alpha = 0.7));
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    startScene.addChild(startButton);


    // Announce game over label
    let gameOverText = new PIXI.Text("Game Over!\n      o > □", {
        fill: 0xffffff,
        fontSize: 96,
        fontFamily: "League Gothic",
        stroke: 0x000000,
        strokeThickness: 6,
    });
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);


    // Highest level reached label
    highestLevel = new PIXI.Text("Highest Level: " + level, {
        fill: 0xffffff,
        fontSize: 64,
        fontFamily: "League Gothic",
        stroke: 0x000000,
        strokeThickness: 6,
    });
    highestLevel.x = sceneWidth / 2 - highestLevel.width / 2;
    highestLevel.y = sceneHeight / 2  + 60;
    gameOverScene.addChild(highestLevel);


    // Return home button
    let returnHome = new PIXI.Text("Return to Home", buttonStyle);
    returnHome.x = sceneWidth / 2 - returnHome.width / 2;
    returnHome.y = sceneHeight - 160;
    returnHome.interactive = true;
    returnHome.buttonMode = true;
    returnHome.on("pointerup", function () {
        startScene.visible = true;
        gameOverScene.visible = false;
        gameScene.visible = false;

    });
    returnHome.on("pointerover", (e) => (e.target.alpha = 0.7));
    returnHome.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    gameOverScene.addChild(returnHome);

}

// Starts the game by establishing visible scene 
function startGame(){
    // Establish visible scenes
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    level = 0;
    app.view.onclick = placeBuilding;
}

// The main game loop of the game.
// This method tackles gold generation, bullet spawning and movement, levels, and enemy warning signals., 
function gameLoop() {

    // If the level is 1, set health to 3
    if(level == 1){
        town.health == 3;
        healthLabel.text = "Health: " + town.health; 
    }

    if(gameScene.visible == true){
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;


    // Get mouse positions
    mousePosition = app.renderer.events.pointer.global;
    
    // Check collisions for everything
    checkCollisions();

    // End the game if health reaches 0
    if(town.health <=0){
        endGame();
    }
    elapsedTime += dt;
    let amt = 6 * dt;


    // If a building is being built, set it;s position to the mouse position
    if (newBuilding != null) {
        // Linear interpolate x and y values.
        let newX = lerp(newBuilding.x, mousePosition.x, amt);
        let newY = lerp(newBuilding.y, mousePosition.y, amt);

        newBuilding.x = newX - .5;
        newBuilding.y = newY - .5;
    }

    // If there are buildings
    if (buildings.length > 0) {
        // For each one
        for (let b of buildings) {
            // Elapse time
            b.elapsedTime += elapsedTime;

            //if it is a gold generator and 2 sec passed, generate gold
            if (b.type == 0 && b.elapsedTime > 2) {
                b.elapsedTime = 0;
                increaseGoldBy(1)
            }
            //Otherwise, create bullets with different spawning speed and damaage depending on type
            else {
                let myBullet;
                if (b.type == 1 && b.elapsedTime > 1) {
                    b.elapsedTime = 0;
                    myBullet = new Bullet(0xffffff, b.x + 10, b.y, 1, 400);
                    bullets.push(myBullet);
                    gameScene.addChild(myBullet)
                    shootSound.play();
                }
                else if (b.type == 2 && b.elapsedTime > .6) {
                    b.elapsedTime = 0;
                    myBullet = new Bullet(0xffffff, b.x + 10, b.y, .5, 900);
                    bullets.push(myBullet);
                    gameScene.addChild(myBullet)
                    shootSound.play();
                }
                else if (b.type == 3 && b.elapsedTime > 2.2) {
                    b.elapsedTime = 0;
                    myBullet = myBullet = new Bullet(0xffffff, b.x + 10, b.y, 2, 250);
                    bullets.push(myBullet);
                    gameScene.addChild(myBullet);
                    shootSound.play();
                }
            }
        }
        elapsedTime = 0;
    }

    // Move everything
    if(bullets.length > 0){
        for(let b of bullets){
            b.move();
        }
    }
    if(enemies.length > 0){
        for(let e of enemies){
            e.move();
        }
    }
    else{
        // If there are no enemies left, repeal warning and start a new level
        for(let w of warnings){
            gameScene.removeChild(w);
        }
        warnings = [];

        increaseLevel();    
        highestLevel.text = "Highest Level: " + level;
        spawnEnemies(level);
    }
}
}

// Places a new building at the current mouse positions
function placeBuilding() {
    if (gameScene.visible == true) {
        if (mousePosition.x > 300 && mousePosition.y < town.y)
            if (newBuilding != null) {
                buildings.push(newBuilding);
                newBuilding.active = true;
                newBuilding = null;
            }
    }
}

// Sets up building displays, labels, and buttons to buy
function setUpBuildingLabelsAndButtons() {

    let buildingStyle = {
        fill: 0x000000,
        fontSize: 14,
        fontFamily: "Verdana",
    }
    gold = 6;
    goldLabel = new PIXI.Text("Gold: " + gold, {
        fill: 0x000000,
        fontSize: 32,
        fontFamily: "League Gothic", 
    })
    goldLabel.x = 50;
    goldLabel.y = 550;
    gameScene.addChild(goldLabel);

    levelLabel = new PIXI.Text("Level: " + level, {
        fill: 0x000000,
        fontSize: 32,
        fontFamily: "League Gothic", 
    })
    levelLabel.x = 50;
    levelLabel.y = 590;
    gameScene.addChild(levelLabel);

    // Set up Shop Labels and functionality
    let storeLabel = new PIXI.Text("Building Store", {
        fill: 0x000000,
        fontSize: 54,
        fontFamily: "League Gothic",    
    })
    storeLabel.x = 50;
    storeLabel.y = 44;
    gameScene.addChild(storeLabel);

    // Set up Shop Labels and functionality
    let baseLabel = new PIXI.Text("Union", {
        fill: 0x000000,
        fontSize: 54,
        fontFamily: "League Gothic",    
    })
    baseLabel.x = 605;
    baseLabel.y = 530;
    gameScene.addChild(baseLabel);

    let buildingLabel1 = new PIXI.Text("Gold Generator: 1G", buildingStyle)
    buildingLabel1.x = 133;
    buildingLabel1.y = 140;
    gameScene.addChild(buildingLabel1);
    let buildBuilding1 = new PIXI.Text("-> Click Here to Build! <-", buildingStyle)
    buildBuilding1.interactive = true;
    buildBuilding1.buttonMode = true;
    buildBuilding1.on("pointerup", function () {
        if (newBuilding == null && gold >= 1) {
            newBuilding = new BuildingAttack(140, 140, 0);
            gameScene.addChild(newBuilding);
            increaseGoldBy(-1);
        }
    });
    buildBuilding1.on("pointerover", (e) => (e.target.alpha = 0.7));
    buildBuilding1.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    buildBuilding1.x = 110;
    buildBuilding1.y = 155;
    gameScene.addChild(buildBuilding1);

    let buildingLabel2 = new PIXI.Text("Standard Shooter: 2G", buildingStyle)
    buildingLabel2.x = 120;
    buildingLabel2.y = 240;
    gameScene.addChild(buildingLabel2);

    let buildBuilding2 = new PIXI.Text("-> Click Here to Build! <-", buildingStyle)
    buildBuilding2.interactive = true;
    buildBuilding2.buttonMode = true;
    buildBuilding2.on("pointerup", function () {
        if (newBuilding == null && gold >= 2) {
            newBuilding = new BuildingAttack(140, 140, 1);
            gameScene.addChild(newBuilding);
            increaseGoldBy(-2);
        }
    });
    buildBuilding2.on("pointerover", (e) => (e.target.alpha = 0.7));
    buildBuilding2.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    buildBuilding2.x = 110;
    buildBuilding2.y = 255;
    gameScene.addChild(buildBuilding2);

    let buildingLabel3 = new PIXI.Text("Weak Rapid Shooter: 3G", buildingStyle)
    buildingLabel3.x = 110;
    buildingLabel3.y = 340;
    gameScene.addChild(buildingLabel3);
    let buildBuilding3 = new PIXI.Text("-> Click Here to Build! <-", buildingStyle)
    buildBuilding3.interactive = true;
    buildBuilding3.buttonMode = true;
    buildBuilding3.on("pointerup", function () {
        if (newBuilding == null && gold >=3) {
            newBuilding = new BuildingAttack(140, 140, 2);
            gameScene.addChild(newBuilding);
            increaseGoldBy(-3)
        }
    });
    buildBuilding3.on("pointerover", (e) => (e.target.alpha = 0.7));
    buildBuilding3.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    buildBuilding3.x = 110;
    buildBuilding3.y = 355;
    gameScene.addChild(buildBuilding3);

    let buildingLabel4 = new PIXI.Text("Strong Slow Shooter: 3G", buildingStyle)
    buildingLabel4.x = 110;
    buildingLabel4.y = 440;
    gameScene.addChild(buildingLabel4);
    let buildBuilding4 = new PIXI.Text("-> Click Here to Build! <-", buildingStyle)
    buildBuilding4.interactive = true;
    buildBuilding4.buttonMode = true;
    buildBuilding4.on("pointerup", function () {
        if (newBuilding == null && gold >= 3) {
            newBuilding = new BuildingAttack(140, 140, 3);
            gameScene.addChild(newBuilding);
            increaseGoldBy(-3);
        }
    });
    buildBuilding4.on("pointerover", (e) => (e.target.alpha = 0.7));
    buildBuilding4.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    buildBuilding4.x = 110;
    buildBuilding4.y = 455;
    gameScene.addChild(buildBuilding4);
}


// Sets up store and town with corresponding labels and properties.
function setUpTownAndStore(){
    town = new Town(300,500, 3);
    gameScene.addChild(town);
    store = new Store();
    gameScene.addChild(store);
    building = false;
    for (let i = 0; i < 4; i++) {
        store.buildings[i] = new BuildingStore(i,i,40, 20 + i * 100 + 100)
        gameScene.addChild(store.buildings[i]);
    }

    healthLabel = new PIXI.Text("Health: " + town.health,{
        fill: 0x000000,
        fontSize: 32,
        fontFamily: "League Gothic", 
    });
    healthLabel.x = 610;
    healthLabel.y = 600;
    gameScene.addChild(healthLabel);
}

// Spawns in enemies depending on the level
function spawnEnemies(level){
    for (let i = 0; i < level*3; i++) {
        let myEnemy = new Enemy(Math.random() * (450-150) + 150, Math.random() * (-400 - (-100)) - 100,25,4);
        let myWarning = new Warning(myEnemy.x * 2 - 10, 0);
        gameScene.addChild(myWarning);
        warnings.push(myWarning);
        enemies.push(myEnemy);
        gameScene.addChild(myEnemy);
    }
}

//Checks collisions between the town, enemies, buildings, and bullets
function checkCollisions(){
    // For each enemy
    for(let e of enemies){
        // If it hits the town, destroy the enemy and decrease health
        if(rectsIntersect(e, town) && e.isAlive){
            decreaseHealth();
            e.isAlive = false;
            hitSound.play();
            gameScene.removeChild(e);
        }
        // Destroys the building and enemies on impact
        for(let b of buildings){
            if(rectsIntersect(e, b) && e.isAlive && b.active){
                e.isAlive = false;
                b.active = false;
                hitSound.play();
                gameScene.removeChild(e);
                gameScene.removeChild(b);
            }
        }
        // Destroys the bullet on impact. If the enemy has no health left, destroy the enemy
        for(let b of bullets){
            if(rectsIntersect(e,b) && e.isAlive && b.isAlive){
                e.health -= b.damage;
                b.isAlive = false;
                gameScene.removeChild(b);
                if(e.health <= 0){
                    enemyDownSound.play();
                    e.isAlive = false;
                    gameScene.removeChild(e)
                }
            }
        }
        // If the bullets leave the bounds, remove them.
        for(let bul of bullets){
            if(bul.y < 0 || bul.x > 1000 || bul.x < 300){
                bul.isAlive = false;
                gameScene.removeChild(bul);
            }
        }
    }

    // filter arrays for alive/active enemies, buildings, and bullets
    enemies = enemies.filter((e) => e.isAlive);
    buildings = buildings.filter((b) => b.active);
    bullets = bullets.filter((b) => b.isAlive);
   
}

// Ends the game by switching visibility to the game over and removes objects from game scene.
//
function endGame(){
    startScene.visible = false;
    gameOverScene.visible = true;
    gameScene.visible = false;

    increaseGoldBy(-gold);
    increaseGoldBy(6);
    for(let b of bullets){
        b.isAlive = false;
        gameScene.removeChild(b)
    }
    for(let e of enemies){
        e.isAlive = false;
        gameScene.removeChild(e)
    }
    for(let b of buildings){
        b.active = false;
        gameScene.removeChild(b)
    }
    for(let w of warnings){
        gameScene.removeChild(w)
    }
    level = 0;
    town.health = 3;
}

// Increase gold by an amount and updates label
function increaseGoldBy(value) {
    gold += value;
    goldLabel.text = "Gold: " + gold
}

// Increase level by 1 and updates amount
function increaseLevel(){
    level++;
    levelLabel.text = "Level: "+level;
}

// Decrease health 1 and update label
function decreaseHealth(){
    town.health--;
    healthLabel.text = "Health: "+town.health;
}