export enum EVENTS_NAME {
  addPh = "app-pd",
  gameEnd = "game-end",
  chestLoot = "chest-loot",
  attack = "attack",
}

export const LEVELS = [
  {
    name: "Level-1",
    score: 30,
  },
  {
    name: "Level-2",
    score: 100,
  },
];

export enum GameStatus {
  WIN,
  LOSE,
}
