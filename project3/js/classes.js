class Bullet extends PIXI.Graphics{
    constructor(color = 0xffffff, x = 0, y = 0, damage, speed){
        super();
        this.rect(0,0, 20, 20);
        this.fill(color);
        this.x = x;
        this.y = y;
        this.fwd = { x: 0, y: -1 }
        this.damage = damage;
        this.speed = speed;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}


class Warning extends PIXI.Graphics{
    constructor(x,y){
        super();
        this.rect(x, y, 20, 20);
        this.fill(0xff0000);
    }
}

class Town extends PIXI.Graphics{
    constructor(x,y, health){
        super()
        this.x = x;
        this.y = y;
        this.health = health
        this.rect(0, 0, 675, 190);
        this.fill(0x897f7f);
    }
}

class BuildingStore extends PIXI.Graphics{
    constructor(type, cost, x, y){
        super()
        this.rect(0, 0, 70, 70);
        switch(type){
            case 0:
                this.fill(0xffffff);
                break;
            case 1:
                this.fill(0x8c03fc);
                break;
            case 2:
                this.fill(0x0000ff);
                break;
            case 3:
                this.fill(0xff0000);
                break;
            case 4:
                this.fill(0x000000);
                break;
            default:
                break; 
        }
        this.fill(0x17b404);
        this.type = type
        this.x = x;
        this.y = y;
        this.cost = cost
        Object.seal(this);
    }
}

class BuildingAttack extends PIXI.Graphics {
    constructor(x, y, type, cost) {
        super()
        this.rect(0, 0, 35, 35);
        this.active = false;
        switch (type) {
            case 0:
                this.fill(0xffffff);
                break;
            case 1:
                this.fill(0x8c03fc);
                break;
            case 2:
                this.fill(0x0000ff);
                break;
            case 3:
                this.fill(0xff0000);
                break;
            case 4:
                this.fill(0x000000);
                break;
            default:
                break; 
        }
        this.type = type
        this.x = x;
        this.y = y;
        this.cost = cost;
        this.elapsedTime = 0;
        Object.seal(this)
    }
}

class Store extends PIXI.Graphics{
    constructor(){
        super()
        this.rect(10, 10, 280, 680);
        this.fill(0x996633);
        this.buildings = [];
        Object.seal(this);
    }
}

class Enemy extends PIXI.Graphics{
    constructor(x,y,radius, health){
        super()
        this.circle(x,y,radius);
        this.fill(0xFFFF00);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = {x:0, y:1};
        this.speed = 20;
        this.isAlive = true;
        this.health = health;
    }

    move(dt = 1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}