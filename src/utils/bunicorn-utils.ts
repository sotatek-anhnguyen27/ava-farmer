import * as bunicornImages from '../metadata/bunicorn-images.json';
import * as bunicornImagesV2 from '../metadata/bunicorn-images-v2.json';
import * as bunicornImagesV3 from '../metadata/bunicorn-images-v3.json';
import * as dungeonEnemyImages from '../metadata/dungeon-enemy-images.json';
import * as dungeonDefeatedEnemyImages from '../metadata/dungeon-enemy-defeated-images.json';
import * as eventBunicornImages from '../metadata/bunicorn-event-images.json';
import * as bunicornNames from '../metadata/bunicorn-names.json';
import * as bunicornNamesV2 from '../metadata/bunicorn-names-v2.json';
import * as bunicornNamesV3 from '../metadata/bunicorn-names-v3.json';
import BigNumber from 'bignumber.js';
import config from '@/config';
import { elementNumberToName } from '@/utils/trainer-utils';

const buniNames: Record<string, string[]> =
  (bunicornNames as any).default || bunicornNames;
const buniNamesV2: Record<string, string[]> =
  (bunicornNamesV2 as any).default || bunicornNamesV2;
const buniNamesV3: Record<string, string[]> =
  (bunicornNamesV3 as any).default || bunicornNamesV3;
const buniImages: Record<string, string[]> =
  (bunicornImages as any).default || bunicornImages;
const buniImagesV2: Record<string, string[]> =
  (bunicornImagesV2 as any).default || bunicornImagesV2;
const buniImagesV3: Record<string, string[]> =
  (bunicornImagesV3 as any).default || bunicornImagesV3;
const dungeonImages: Record<string, string[]> =
  (dungeonEnemyImages as any).default || dungeonEnemyImages;
const dungeonDefeatedImages: Record<string, string[]> =
  (dungeonDefeatedEnemyImages as any).default || dungeonDefeatedEnemyImages;
const eventBuniImages: Record<string, string[]> =
  (eventBunicornImages as any).default || eventBunicornImages;

const bunicornLogo = 'https://static.nft.bunicorn.exchange/bunicorn_logo2.png';
export function mappingEnemyDungeonImage(enemyElement: any, star: any) {
  switch (enemyElement) {
    case 0:
      return dungeonImages['Fire'][star][0] || bunicornLogo;
    case 1:
      return dungeonImages['Earth'][star][0] || bunicornLogo;
    case 2:
      return dungeonImages['Air'][star][0] || bunicornLogo;
    case 3:
      return dungeonImages['Water'][star][0] || bunicornLogo;
    default:
      return bunicornLogo;
  }
}

export function mappingDefeatedEnemyDungeonImage(enemyElement: any, star: any) {
  switch (enemyElement) {
    case 0:
      return dungeonDefeatedImages['Fire'][star][0] || bunicornLogo;
    case 1:
      return dungeonDefeatedImages['Earth'][star][0] || bunicornLogo;
    case 2:
      return dungeonDefeatedImages['Air'][star][0] || bunicornLogo;
    case 3:
      return dungeonDefeatedImages['Water'][star][0] || bunicornLogo;
    default:
      return bunicornLogo;
  }
}

export function getEnemyDungeonImage(stageResult: any, currentStep: any) {
  console.log('getEnemyDungeonImage', stageResult, 'currentStep', currentStep);
  if (!stageResult) {
    return bunicornLogo;
  }
  const enemyElement = stageResult.enemyElement;
  if (
    ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].includes(
      currentStep
    ) &&
    stageResult
  ) {
    return mappingDefeatedEnemyDungeonImage(enemyElement, stageResult.stars);
  }
  return mappingEnemyDungeonImage(enemyElement, stageResult.stars);
}

export function getEnemyDungeonElm(stageResult: any) {
  if (!stageResult) {
    return;
  }
  const enemyElement = stageResult.enemyElement;
  switch (enemyElement) {
    case 0:
      return 'fire';
    case 1:
      return 'earth';
    case 2:
      return 'air';
    case 3:
      return 'water';
    default:
      return;
  }
}
function getBunicornImageFromOldFactory(bunicorn: any) {
  if (!bunicorn) {
    return null;
  }
  switch (bunicorn.element) {
    case 'Air':
      return buniImages.Air[bunicorn.stars][
        bunicorn.id % buniImages.Water[bunicorn.stars].length
      ];
    case 'Water':
      return buniImages.Water[bunicorn.stars][
        bunicorn.id % buniImages.Water[bunicorn.stars].length
      ];
    case 'Earth':
      return buniImages.Earth[bunicorn.stars][
        bunicorn.id % buniImages.Water[bunicorn.stars].length
      ];
    case 'Fire':
      return buniImages.Fire[bunicorn.stars][
        bunicorn.id % buniImages.Water[bunicorn.stars].length
      ];
    default:
      return bunicornLogo;
  }
}

function isEventBunicorn(bunicorn: any) {
  return bunicorn.eventId && bunicorn.eventBoost;
}

function getImageSource(bunicorn: any) {
  if (bunicorn.id > config.applyUpdateBunicornV4FromID) {
    return buniImagesV3;
  }
  if (bunicorn.id < config.applyUpdateBunicornV2FromID) {
    return buniImages;
  }
  if (bunicorn.id < config.applyUpdateBunicornV3FromID) {
    return buniImagesV2;
  }
  return buniImagesV3;
}

function getNameSource(bunicornId: number) {
  if (bunicornId < config.applyUpdateBunicornV2FromID) {
    return buniNames;
  }
  if (bunicornId < config.applyUpdateBunicornV3FromID) {
    return buniNamesV2;
  }
  return buniNamesV3;
}

export function getBunicornImageFromFactory(bunicorn: any) {
  if (!bunicorn) {
    return bunicornLogo;
  }
  if (bunicorn.id < config.applyCorrectBunicornImageFromID) {
    return getBunicornImageFromOldFactory(bunicorn);
  }
  let imageSource = getImageSource(bunicorn);
  if (isEventBunicorn(bunicorn)) {
    // @ts-ignore
    imageSource = eventBuniImages[`${bunicorn.eventId}`];
  }
  switch (bunicorn.element) {
    case 'Air':
      return imageSource.Air[bunicorn.stars][
        bunicorn.id % imageSource.Air[bunicorn.stars].length
      ];
    case 'Water':
      return imageSource.Water[bunicorn.stars][
        bunicorn.id % imageSource.Water[bunicorn.stars].length
      ];
    case 'Earth':
      return imageSource.Earth[bunicorn.stars][
        bunicorn.id % imageSource.Earth[bunicorn.stars].length
      ];
    case 'Fire':
      return imageSource.Fire[bunicorn.stars][
        bunicorn.id % imageSource.Fire[bunicorn.stars].length
      ];
    default:
      return bunicornLogo;
  }
  return bunicornLogo;
}

export const getBunicornName = (
  element: string,
  stars: number,
  id: number,
  bunicorn: any
) => {
  if (
    bunicorn &&
    bunicorn.eventId &&
    bunicorn.eventBoost &&
    element === 'Air'
  ) {
    return 'Morphony';
  }
  const nameSource = getNameSource(id);
  switch (element) {
    case 'Water':
      return nameSource.Water[stars][id % nameSource.Water[stars].length];
    case 'Fire':
      return nameSource.Fire[stars][id % nameSource.Fire[stars].length];
    case 'Earth':
      return nameSource.Earth[stars][id % nameSource.Earth[stars].length];
    case 'Air':
      return nameSource.Air[stars][id % nameSource.Air[stars].length];
  }
};

export const getBurntStarsOfBunicorn = (
  bronzeEnhanced: number,
  sliverEnhanced: number,
  goldEnhanced: number
) => {
  const burntStars = bronzeEnhanced + sliverEnhanced + goldEnhanced;
  if (new BigNumber(burntStars).comparedTo(100) > 0) {
    return 100;
  }
  return burntStars;
};

export const getStaminaTooltip = (bunicorn: any) => {
  if (!bunicorn) return '';

  const wrapInSpan = (spanClass: string, text: string) => {
    return `<span class="${spanClass.toLowerCase()}">${text}</span><span class="${spanClass.toLowerCase() +
      '-icon'}"></span>`;
  };

  let ttHtml = `
        ID: ${bunicorn.id}
        <br>
        <span style="color: rgb(237, 217, 77)">${Array(bunicorn.stars + 1)
          .fill('★')
          .join('')}</span>
      `;
  if (bunicorn.level > 0) {
    ttHtml += `<br>Level ${bunicorn.level + 1}`;
  }

  if (bunicorn.element) {
    ttHtml += `<br>Element: ${wrapInSpan(bunicorn.element, bunicorn.element)}`;
  }

  if (bunicorn.attr1Value) {
    ttHtml += `<br>${wrapInSpan(bunicorn.attr1, bunicorn.attr1)}: +${
      bunicorn.attr1Value
    }`;
  }

  if (bunicorn.attr2Value) {
    ttHtml += `<br>${wrapInSpan(bunicorn.attr2, bunicorn.attr2)}: +${
      bunicorn.attr2Value
    }`;
  }

  if (bunicorn.attr3Value) {
    ttHtml += `<br>${wrapInSpan(bunicorn.attr3, bunicorn.attr3)}: +${
      bunicorn.attr3Value
    }`;
  }

  if (bunicorn.burntStars > 0) {
    ttHtml += `<br>BS: ${bunicorn.burntStars}/100`;
  }

  return ttHtml;
};

export function bunicornFromContract(
  id: string | number,
  data: string[],
  eventId: string,
  eventBoost: any
): any {
  const properties = data[0];
  const attr1 = data[1];
  const attr2 = data[2];
  const attr3 = data[3];
  const level = +data[4];

  const enhancementCounters = +data[5];
  const bonusAttribute = +data[6];
  const tag = data[7];
  const costume = data[8];

  const attr1Value = +attr1;
  const attr2Value = +attr2;
  const attr3Value = +attr3;

  const elementPattern = (+properties >> 5) & 0x7f;
  const attr1Type = elementPattern % 5;
  const attr2Type = Math.floor(elementPattern / 5) % 5;
  const attr3Type = Math.floor(Math.floor(elementPattern / 5) / 5) % 5;

  const elementNum = (+properties >> 3) & 0x3;

  const bronzeEnhanced = enhancementCounters & 0xff;
  const sliverEnhanced = (enhancementCounters >> 8) & 0xff;
  const goldEnhanced = (enhancementCounters >> 16) & 0xff;
  const burntStars = getBurntStarsOfBunicorn(
    bronzeEnhanced,
    sliverEnhanced,
    goldEnhanced
  );

  const stars = +properties & 0x7;
  console.log('========================stars', stars, id);
  return {
    id: +id,
    properties,
    element: elementNumberToName(elementNum),
    attr1: elementNumberToName(attr1Type).toUpperCase(),
    attr1Value,
    attr1Type,
    attr2: elementNumberToName(attr2Type).toUpperCase(),
    attr2Value,
    attr2Type,
    attr3: elementNumberToName(attr3Type).toUpperCase(),
    attr3Value,
    attr3Type,
    level,
    stars,
    burntStars,
    bonusAttribute,
    tag,
    costume: new BigNumber(costume).toNumber(),
    eventId,
    eventBoost: new BigNumber(eventBoost).comparedTo(1) > 0 ? eventBoost : null
  };
}
