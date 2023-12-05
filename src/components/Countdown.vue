<template lang="html">
  <div class="wrapper">
    <div class="column">
      <span
        :class="[days && 'vesting', _isThemeGame ? 'text-game' : 'text-time']"
        v-text="days"
      />
      <div
        class="label"
        :class="_isThemeGame ? 'label-game game' : ''"
        v-text="$t('days')"
      />
    </div>
    <div class="divided"></div>
    <div class="column">
      <span
        :class="[hours && 'vesting', _isThemeGame ? 'text-game' : 'text-time']"
        v-text="hours"
      />
      <div
        class="label"
        :class="_isThemeGame ? 'label-game game' : ''"
        v-text="$t('hours')"
      />
    </div>
    <div class="divided"></div>
    <div class="column">
      <span
        :class="[
          minutes && 'vesting',
          _isThemeGame ? 'text-game' : 'text-time'
        ]"
        v-text="minutes"
      />
      <div
        class="label"
        :class="_isThemeGame ? 'label-game game' : ''"
        v-text="$t('mins')"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    endDate: {
      type: Date // Date.parse(this.endDate)
    }
  },
  data() {
    return {
      days: null,
      hours: null,
      minutes: null,
      seconds: null,
      isEnded: null
    };
  },
  watch: {
    isEnded() {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    }
  },
  methods: {
    updateRemaining(distance) {
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    },

    tick() {
      const currentTime = new Date();
      const distance = Math.max(this.endDate - currentTime, 0);
      this.updateRemaining(distance);

      if (distance === 0) {
        clearInterval(this.timer);
        this.isEnded = true;
      }
    }
  },

  mounted() {
    this.tick();
    this.timer = setInterval(this.tick.bind(this), 1000);
  },

  destroy() {
    clearInterval(this.timer);
  }
};
</script>
<style lang="scss" scoped>
.wrapper {
  color: var(--text-btn);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
}
.divided {
  background: var(--input-hover-border);
  opacity: 0.1;
  border-radius: 0px;
  transform: matrix(-1, 0, 0, 1, 0, 0);
  width: 1px;
}
.column {
  width: 56px;
  max-width: 56px;
  text-align: center;
  flex: 1;
  color: var(--input-hover-border);
  min-width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.text-game {
  color: var(--loading-color);
  font-size: 16px;
  line-height: 22px;
  padding-top: 5px;
  @media only screen and (max-width: 768px) {
    font-size: 11px !important;
  }
}

.text-time {
  font-family: Lato-Regular;
  font-style: normal;
  font-weight: 900;
  font-size: 16px;
  line-height: 19px;
  text-align: center;
  text-transform: capitalize;

  color: #ffffff;
}
.label {
  font-family: Lato-Regular;
  font-weight: 600;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  text-transform: capitalize;
  color: rgba($color: #ffffff, $alpha: 0.7);
}
.text-time.vesting {
  color: #ffffff;
}

.label-game {
  font-size: 9px;
  color: var(--loading-color);
  font-weight: normal;
}
</style>
