<template>
  <Page>
    <Container>
      <Title :title="$t('listing')" class="header" />
      <div class="learn-connect">
        <div class="text" :class="_isThemeGame && 'game'">
          {{ $t('fillForm') }}
        </div>
        <a target="_blank" href="#">
          <span
            style="text-transform: capitalize;"
            class="link"
            :class="_isThemeGame && 'game'"
            >{{ $t('listingRequest') }}
          </span>
          <Icon
            v-if="!_isThemeGame"
            name="external-link"
            size="16"
            class="ml-1 link"
          />
          <img
            v-else
            src="~/@/assets/icon/game/link.png"
            class="ml-1 icon-link-game"
          />
        </a>
      </div>
    </Container>
  </Page>
</template>

<style lang="scss" scoped>
.learn-connect {
  margin: 20px 0 30px 0;
  display: flex;
  a {
    color: $color-primary;
    font-size: 15px;
    display: flex;
    align-items: center;
  }

  i {
    margin-top: 4px;
  }
  @media only screen and (max-width: 768px) {
    display: inherit;
    line-height: 25px;
  }
}

.text {
  color: var(--text-btn);
  font-size: 16px;
  margin-right: 10px;
}

.game {
  font-size: 10px;
}
</style>
