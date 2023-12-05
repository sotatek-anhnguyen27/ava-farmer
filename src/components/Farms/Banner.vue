<template>
  <div class="banner-wrapper hide">
    <div class="introduction">
      <div class="title" v-html="$t('stakeLpsEarnNfts')"></div>
      <a
        href="https://blog.buni.finance/bunicorn-nft-farms-join-to-earn-the-very-first-bunicorn-eggs-c4a71293366f"
        target="_blank"
        class="sub-title"
        v-html="$t('learnMore')"
      ></a>
    </div>
    <div class="game-levels">
      <div class="level">
        <div class="img-wrapper">
          <div class="level-image">
            <img src="https://static.nft.bunicorn.exchange/farms/logo-180x240.png" />
          </div>
          <div class="target">
            0-500
          </div>
        </div>
        <div class="level-name" v-text="$t('bunicornLogo')"></div>
      </div>
      <div class="arrow">
        <img src="~@/assets/game_level/arrow-banner.svg" />
      </div>
      <div class="level">
        <div class="img-wrapper" style="background-color: #1d4489">
          <div class="level-image">
            <img src="https://static.nft.bunicorn.exchange/farms/chest-180x240.png" />
          </div>
          <div class="target">
            500-1K
          </div>
        </div>
        <div class="level-name" v-text="$t('mysteryChest')">Mystery Chest</div>
      </div>
      <div class="arrow">
        <img src="~@/assets/game_level/arrow-banner.svg" />
      </div>
      <div class="level">
        <div class="img-wrapper" style="background-color: #1d478b">
          <div class="level-image">
            <img
              src="https://static.nft.bunicorn.exchange/farms/normal-egg-180x240.png"
            />
          </div>
          <div class="target">
            1K-5K
          </div>
        </div>
        <div class="level-name" v-text="$t('normalEgg')"></div>
      </div>
      <div class="arrow">
        <img src="~@/assets/game_level/arrow-banner.svg" />
      </div>
      <div class="level">
        <div class="img-wrapper" style="background-color: #1d4889">
          <div class="level-image">
            <img
              src="https://static.nft.bunicorn.exchange/farms/rare-egg-180x240.png"
            />
          </div>
          <div class="target">
            5K-10K
          </div>
        </div>
        <div class="level-name" v-text="$t('rareEgg')"></div>
      </div>
      <div class="arrow">
        <img src="~@/assets/game_level/arrow-banner.svg" />
      </div>
      <div class="level">
        <div class="img-wrapper" style="background-color: #163f75">
          <div class="level-image">
            <img
              src="https://static.nft.bunicorn.exchange/farms/epic-egg-180x240.png"
            />
          </div>
          <div class="target">
            >{{ _num($store.state.farm.thresholdEpic) }}
          </div>
        </div>
        <div class="level-name" v-text="$t('legendaryEgg')"></div>
      </div>
    </div>
  </div>
</template>

<script></script>

<style scoped lang="scss">
@media only screen and (max-width: 768px) {
  .hide {
    display: none !important;
  }
}
@media only screen and (max-width: 1440px) {
  .introduction {
    width: 100% !important;
    margin-bottom: 30px;
  }
}
@media only screen and (max-width: 1024px) {
  .hide {
    display: none !important;
  }
}
.banner-wrapper {
  display: flex;
  border-radius: 10px;
  background: linear-gradient(268.58deg, #0c2a54 0.69%, #1a3175 100%);
  border: 1px solid #000000;
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  padding: 45px 26px 28px 26px;
  margin: 24px 0 43px 0;
  font-family: Lato-Regular;
  flex-wrap: wrap;
  justify-content: space-between;
  .title {
    font-size: 25px;
    line-height: 35px;
    color: #f1f3f6;
  }
  .sub-title {
    margin-top: 8px;
    font-size: 14px;
    line-height: 22px;
    text-transform: capitalize;
    color: rgba($color: #f47820, $alpha: 0.6);
    cursor: pointer;
  }
  .game-levels {
    flex: 1;
    position: relative;
    justify-content: space-between;
    display: flex;
    align-items: center;
    margin-left: 26px;
    flex-wrap: wrap;

    .level {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .img-wrapper {
        position: relative;
        width: 135px;
        height: 135px;
        background-color: #183676;
        border-radius: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        .target {
          width: 70px;
          max-width: 70px;
          background: linear-gradient(270deg, #ff8c06 0%, #f47820 100%);
          border-radius: 5px;
          border: 2px solid #ff8c06;
          color: #fff;
          font-weight: 800;
          font-size: 15px;
          line-height: 18px;
          text-align: center;
          text-transform: capitalize;
          position: absolute;
          bottom: 2px;
          white-space: nowrap;
        }
        .level-image {
          width: 90px;
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
      .level-name {
        margin-top: 10px;
        font-weight: 600;
        font-size: 13px;
        line-height: 16px;
        text-align: center;
        text-transform: uppercase;
        color: #3990f8;
      }
    }
  }
}
</style>
