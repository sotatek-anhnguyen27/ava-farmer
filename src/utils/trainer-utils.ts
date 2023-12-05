import * as trainerImages from '../metadata/trainer-images.json';
import * as trainerNames from '../metadata/trainer-names.json';
import * as trainerXp from '../metadata/trainer-xp.json';

enum BunicornElement {
  Fire = 0,
  Earth = 1,
  Air = 2,
  Water = 3,
  Neutral = 4
}

const names: Record<string, string[]> =
  (trainerNames as any).default || trainerNames;
const xpBylevel: Record<string, string[]> =
  (trainerXp as any).default || trainerXp;
const notBackgroundImages = [
  'https://static.nft.bunicorn.exchange/trainers/Black_robot_light_750x1000.png',
  'https://static.nft.bunicorn.exchange/trainers/Female_trainer_02_light_750x1000.png',
  'https://static.nft.bunicorn.exchange/trainers/Female_trainer_04_light_750x1000.png',
  'https://static.nft.bunicorn.exchange/trainers/Male_trainer_01_light_750x1000.png',
  'https://static.nft.bunicorn.exchange/trainers/Male_trainer_03_light_750x1000.png',
  'https://static.nft.bunicorn.exchange/trainers/Pink_robot_light_750x1000.png'
];

const defaultTrainerCard =
  'https://static.nft.bunicorn.exchange/static-game/battle/empty-trainer.png';

export function getTrainerImageFromFactory(trainer: any) {
  if (!trainer) {
    return defaultTrainerCard;
  }
  if (trainer.elementName === 'Earth') {
    return trainerImages.Earth[trainer.id % trainerImages.Earth.length];
  }

  if (trainer.elementName === 'Fire') {
    return trainerImages.Fire[trainer.id % trainerImages.Fire.length];
  }

  if (trainer.elementName === 'Water') {
    return trainerImages.Water[trainer.id % trainerImages.Water.length];
  }

  if (trainer.elementName === 'Air') {
    return trainerImages.Air[trainer.id % trainerImages.Air.length];
  }
  return defaultTrainerCard;
}

export function getTrainerIconImageFromFactory(trainer: any) {
  if (!trainer) {
    return null;
  }

  return notBackgroundImages[trainer.id % notBackgroundImages.length];
}

export const getTrainerNameFromFactory = (
  trainerId: number,
  elementName: string
) => {
  if (!trainerId || !elementName) {
    return null;
  }
  return names[elementName][trainerId % names[elementName].length];
};

export function elementNumberToName(elementNum: number): string {
  switch (elementNum) {
    case BunicornElement.Fire:
      return 'Fire';
    case BunicornElement.Earth:
      return 'Earth';
    case BunicornElement.Water:
      return 'Water';
    case BunicornElement.Air:
      return 'Air';
    case BunicornElement.Neutral:
      return 'NEUTRAL';
    default:
      return '???';
  }
}

export function trainerFromContract(id: string | number, data: string[]): any {
  const xp = data[0];
  const level = parseInt(data[1], 10);
  const element = data[2];
  const elementName = elementNumberToName(+data[2]);
  const staminaTimestamp = data[3];
  const power = data[4];
  const tag = data[5];
  return {
    id: +id,
    xp,
    level,
    element,
    elementName,
    staminaTimestamp,
    power,
    tag
  };
}

export function getEnemyImage(element: number, id: any) {
  if (element === null) {
    return null;
  }
  switch (element) {
    case BunicornElement.Fire:
      return trainerImages.Fire[id % trainerImages.Fire.length];
    case BunicornElement.Earth:
      return trainerImages.Earth[id % trainerImages.Earth.length];
    case BunicornElement.Air:
      return trainerImages.Air[id % trainerImages.Air.length];
    case BunicornElement.Water:
      return trainerImages.Water[id % trainerImages.Water.length];
    default:
      return '';
  }
}

export function getXpBylevel(level: number, sum: any) {
  if (level === null) {
    return null;
  }
  let sumXp = 0;
  if (sum) {
    for (let i = 0; i <= level; i++) {
      sumXp += parseInt(xpBylevel[i + 1].toString(), 10);
    }
    return sumXp;
  }
  return xpBylevel[level + 1];
}

export function getNextMilestoneLevel(level: number) {
  if (level < 10) {
    return 11;
  }
  if (level < 20) {
    return 21;
  }
  if (level < 30) {
    return 31;
  }
  if (level < 40) {
    return 41;
  }
  if (level < 50) {
    return 51;
  }
  if (level < 100) {
    return 101;
  }
  if (level < 150) {
    return 151;
  }
  if (level < 200) {
    return 201;
  }
  if (level < 250) {
    return 251;
  }
  return 0;
}

export function getPrevMilestoneLevel(level: number) {
  level = level + 1;
  if (10 < level && level <= 20) {
    return 11;
  }
  if (20 < level && level <= 30) {
    return 21;
  }
  if (30 < level && level <= 40) {
    return 31;
  }
  if (40 < level && level <= 50) {
    return 41;
  }
  if (50 < level && level <= 100) {
    return 51;
  }
  if (100 < level && level <= 150) {
    return 101;
  }
  if (150 < level && level <= 200) {
    return 151;
  }
  if (200 < level && level <= 250) {
    return 201;
  }
  return 0;
}
