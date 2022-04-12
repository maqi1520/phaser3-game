import { GameObjects, Scene, Tilemaps } from "phaser";

import { Player } from "../../classes/player";
import { Enemy } from "../../classes/enemy";
import { Lizard } from "../../classes/Lizard";
import { createLizardAnims } from "../../anims/EnemyAnims";

import { EVENTS_NAME } from "../../consts";

export class GameScene extends Scene {
  private player!: Player;
  private map!: Tilemaps.Tilemap;
  private tileset!: Tilemaps.Tileset;
  private wallsLayer!: Tilemaps.TilemapLayer;
  private groundLayer!: Tilemaps.TilemapLayer;
  private chests!: GameObjects.Sprite[];
  private enemies!: Lizard[];
  private lizards!: Phaser.Physics.Arcade.Group;

  constructor() {
    super("game-scene");
  }

  create(props: any): void {
    console.log(props);

    createLizardAnims(this.anims);
    this.initMap();
    this.player = new Player(this, 100, 100);

    this.initChests();
    this.initEnemies();
    //this.initLizards();
    //this.initPH();
    this.initCamera();

    this.physics.add.collider(this.player, this.wallsLayer);
  }

  update(): void {
    this.player.update();
  }

  private initMap(): void {
    this.map = this.make.tilemap({
      key: "dungeon",
      tileWidth: 16,
      tileHeight: 16,
    });
    console.log(this.map);

    this.tileset = this.map.addTilesetImage("Grass", "Grass");
    this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
    this.wallsLayer = this.map.createLayer("Walls", this.tileset, 0, 0);
    console.log(this.tileset);

    this.wallsLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(
      0,
      0,
      this.wallsLayer.width,
      this.wallsLayer.height
    );
    //this.showDebugWalls();
  }

  private initChests(): void {
    const chestPoints = this.map.filterObjects(
      "Chests",
      (obj) => obj.name === "ChestPoint"
    );

    this.chests = chestPoints.map((chestPoint) =>
      this.physics.add
        .sprite(
          chestPoint.x as number,
          chestPoint.y as number,
          "food",
          Math.floor(Math.random() * 8)
        )
        .setScale(0.5)
    );

    this.chests.forEach((chest) => {
      this.physics.add.overlap(this.player, chest, (obj1, obj2) => {
        this.game.events.emit(EVENTS_NAME.chestLoot);
        obj2.destroy();
        // this.cameras.main.flash();
      });
    });
  }

  private initPH(): void {
    const chestPoints = this.map.filterObjects(
      "ph",
      (obj) => obj.name === "ph"
    );

    this.chests = chestPoints.map((chestPoint) =>
      this.physics.add
        .sprite(
          chestPoint.x as number,
          chestPoint.y as number,
          "tiles_spr",
          530
        )
        .setScale(1.5)
    );

    //相遇可以吃血
    this.chests.forEach((chest) => {
      this.physics.add.overlap(this.player, chest, (obj1, obj2) => {
        this.player.addHP();
        //this.game.events.emit(EVENTS_NAME.addPh);
        obj2.destroy();
        // this.cameras.main.flash();
      });
    });
  }

  private initLizards(): void {
    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const lizGo = go as Lizard;
        lizGo.body.onCollide = true;
      },
    });

    const lizardsLayer = this.map.getObjectLayer("Enemies");
    lizardsLayer.objects.forEach((lizObj) => {
      this.lizards.get(
        lizObj.x! + lizObj.width! * 0.5,
        lizObj.y! - lizObj.height! * 0.5,
        "lizard"
      );
    });

    this.physics.add.collider(this.lizards, this.wallsLayer);
    this.physics.add.collider(this.lizards, this.lizards);
    this.physics.add.collider(
      this.player,
      this.lizards,
      (obj1, obj2) => {
        (obj1 as Player).getDamage(1);
      },
      undefined,
      this
    );
  }

  private initEnemies(): void {
    const enemiesPoints = this.map.filterObjects(
      "Enemies",
      (obj) => obj.name === "EnemyPoint"
    );

    this.enemies = enemiesPoints.map(
      (enemyPoint) =>
        new Lizard(
          this,
          enemyPoint.x as number,
          enemyPoint.y as number,
          "lizard"
        )
      //.setScale(1.5)
    );

    this.physics.add.collider(this.enemies, this.wallsLayer);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(
      this.player,
      this.enemies,
      (obj1, obj2) => {
        (obj1 as Player).getDamage(1);
      },
      undefined,
      this
    );
  }

  private initCamera(): void {
    this.cameras.main.setSize(this.game.scale.width, this.game.scale.height);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    //this.cameras.main.setZoom(2);
  }

  private showDebugWalls(): void {
    const debugGraphics = this.add.graphics().setAlpha(0.7);
    this.wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    });
  }
}
