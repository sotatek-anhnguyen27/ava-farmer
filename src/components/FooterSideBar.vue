<template>
  <div class="footer-slide-bar"></div>
</template>

<style scoped lang="scss">
.footer-slide-bar {
  display: flex;
  margin-bottom: 30px;
  justify-content: center;
  align-items: center;

  .twitter {
    margin: 0 5px;
  }

  .game-margin {
    margin-right: 5px;
    margin-left: 5px;
  }

  .language {
    margin-right: 10px;
  }
}

.footer-slide-bar.colapsed {
  flex-direction: column;

  .twitter {
    margin: 15px 0;
  }

  .game-margin {
    margin-top: 15px;
    margin-bottom: 5px;
  }
  .language {
    margin-right: 0;
  }
}

.icon-game {
  width: 30px !important;
  height: 30px !important;
}
.icon-discord {
  width: 23px !important;
  height: 23px !important;
}

.link-social.discord:hover {
  .icon-discord {
    filter: invert(55%) sepia(9%) saturate(5974%) hue-rotate(346deg)
      brightness(99%) contrast(94%);
  }
}

.link-social {
  a {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border-radius: 50%;
    border: 1px solid $text-white;
    color: var(--color-icon-social);
    box-shadow: 0 2px 10px var(--border-shadow-search);

    &:hover {
      background-color: $text-white;
      border: 1px solid $text-white;
      color: $color-primary;
    }

    .twitter {
      i {
        padding-top: 3px;
      }
    }
  }
}
</style>
