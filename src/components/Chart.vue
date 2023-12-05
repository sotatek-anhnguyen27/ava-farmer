<template>
  <div>
    <div class="tabs">
      <ul class="d-flex list-style-none">
        <li
          v-for="(item, i) in items"
          :key="i"
          @click="handleChangeTab(item.id)"
          class="tab"
          v-bind:class="[
            { active: activeTab === item.id },
            _isThemeGame && 'game-font-size'
          ]"
        >
          <span v-text="$t(item.name)" />
        </li>
      </ul>
    </div>
    <div
      ref="chartContainer"
      class="mb-4 rounded-md-1 chart-background table"
      :class="_isThemeGame ? 'game-border-table-chart' : ''"
    >
      <UiLoading v-if="loading" class="big d-flex height-full" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { swapPrice, getLbpData } from '@/helpers/lbpData';
import * as TV from 'lightweight-charts';

const options = {
  timeScale: {
    barSpacing: 40,
    drawTicks: false,
    borderVisible: false,
    fixRightEdge: true
  },
  grid: {
    horzLines: {
      visible: false
    },
    vertLines: {
      visible: false
    }
  },
  rightPriceScale: {
    borderColor: 'transparent',
    textColor: '#ffffff'
  },
  layout: {
    backgroundColor: 'transparent',
    textColor: '#ff8b0a'
  },
  handleScroll: {
    mouseWheel: false
  },
  handleScale: {
    mouseWheel: false,
    pinch: false,
    axisPressedMouseMove: {
      time: false,
      price: false
    }
  }
};

function normalizeMetrics(rawMetrics) {
  const keys = Object.keys(rawMetrics);
  const metrics = {};
  for (let i = 0; i < keys.length; i++) {
    if (rawMetrics[keys[i]].length) {
      metrics[keys[i]] = rawMetrics[keys[i]][0];
    } else {
      metrics[keys[i]] = metrics[keys[i - 1]];
    }
  }
  return metrics;
}

export default {
  props: {
    pool: {
      required: true
    },
    forKurve: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      activeTab: 'LIQUIDITY',
      metrics: {},
      swaps: [],
      chart: null,
      series: null
    };
  },
  watch: {
    '$store.state.theme.mode': async function() {
      await this.loadChart();
    }
  },
  computed: {
    lbpData() {
      return getLbpData(this.pool, this.config.chainId);
    },
    displayPriceHistory() {
      return this.pool.crp && this.lbpData.isLbpPool;
    },
    items() {
      if (this.forKurve) {
        return [
          {
            name: 'liquidity',
            id: 'LIQUIDITY'
          },
          {
            name: 'volume',
            id: 'VOLUME'
          }
          // {
          //   name: 'feeReturns',
          //   id: 'FEE_RETURNS'
          // }
        ];
      }

      const tabList = [
        {
          name: 'liquidity',
          id: 'LIQUIDITY'
        },
        {
          name: 'volume',
          id: 'VOLUME'
        },
        {
          name: 'feeReturns',
          id: 'FEE_RETURNS'
        }
      ];

      if (this.displayPriceHistory) {
        tabList.push({
          name: this.$t('priceHistory', { token: this.lbpData.projectToken }),
          id: 'PRICE'
        });
      }

      return tabList;
    },
    chartData() {
      if (this.forKurve) {
        if (this.activeTab === 'LIQUIDITY') {
          return this.pool.map(data => {
            return {
              time: new Date(data.date * 1000).toISOString(),
              value: data.reserveUSD
            };
          });
        }
        if (this.activeTab === 'VOLUME') {
          return this.pool.map(data => {
            return {
              time: new Date(data.date * 1000).toISOString(),
              value: data.dailyVolumeUSD
            };
          });
        }
        return [];
      }
      const data = [];
      if (this.activeTab == 'PRICE') {
        for (let i = 0; i < this.swaps.length; i++) {
          const swap = this.swaps[i];

          if (i > 0 && swap.timestamp != this.swaps[i - 1].timestamp) {
            data.push({
              time: swap.timestamp,
              value: swapPrice(this.pool, this.config.chainId, swap)
            });
          }
        }
      } else {
        const rowKeys = Object.keys(this.metrics);
        for (let i = 1; i < rowKeys.length; i++) {
          const timestamp = parseFloat(rowKeys[i].split('_')[1]);
          const date = new Date(timestamp);
          const values = this.metrics[rowKeys[i]];
          const previousValues = this.metrics[rowKeys[i - 1]];
          if (!values || !previousValues) {
            data.push({
              time: date.toISOString()
            });
            continue;
          }
          let value;
          if (this.activeTab === 'LIQUIDITY') {
            value = parseFloat(values.poolLiquidity);
          } else if (this.activeTab === 'VOLUME') {
            const totalVolume = parseFloat(values.poolTotalSwapVolume);
            const previousTotalVolume = parseFloat(
              previousValues.poolTotalSwapVolume
            );
            value = totalVolume - previousTotalVolume;
          } else if (this.activeTab === 'FEE_RETURNS') {
            const totalFee = parseFloat(values.poolTotalSwapFee);
            const previousTotalFee = parseFloat(
              previousValues.poolTotalSwapFee
            );
            const dailyFee = totalFee - previousTotalFee;
            const liquidity = parseFloat(values.poolLiquidity);
            value = (dailyFee / liquidity) * 365;
          }

          data.push({
            time: date.toISOString(),
            value
          });
        }
      }
      return data;
    }
  },
  methods: {
    ...mapActions(['getPoolMetrics', 'getLbpSwaps']),
    handleChangeTab(tabId) {
      this.activeTab = tabId;
      this.loadChart();
    },
    async loadChart() {
      const chartContainer = this.$refs.chartContainer;
      const fontFamily =
        this.$store.state.theme.mode === 'game'
          ? 'DelaGothicOne-Regular'
          : 'Lato-Bold';
      const fontSize = this.$store.state.theme.mode === 'game' ? 8 : 11;
      if (!this.chart) {
        options.width = chartContainer.offsetWidth;
        options.height = chartContainer.offsetHeight;
        this.chart = TV.createChart(chartContainer, {
          ...options,
          layout: {
            ...options.layout,
            fontFamily: fontFamily,
            fontSize: fontSize
          }
        });
        window.onresize = () => {
          const width = Math.min(
            document.body.offsetWidth,
            chartContainer.offsetWidth
          );
          this.chart.resize(width, chartContainer.offsetHeight);
        };
      } else {
        this.chart.applyOptions({
          layout: {
            fontFamily: fontFamily,
            fontSize: fontSize
          }
        });
        this.chart.removeSeries(this.series);
      }
      const color = '#F47820';
      if (this.activeTab === 'LIQUIDITY') {
        this.series = this.chart.addAreaSeries({
          lineColor: color,
          topColor: `${color}ff`,
          bottomColor: `${color}00`,
          priceLineVisible: false,
          priceFormat: {
            type: 'custom',
            formatter: value => `${this._num(value, 'usd')}`
          }
        });
      } else if (this.activeTab === 'VOLUME') {
        this.series = this.chart.addHistogramSeries({
          color,
          priceFormat: {
            type: 'custom',
            formatter: value => `${this._checkValueBalance(value)}`
          }
        });
      } else if (this.activeTab === 'FEE_RETURNS') {
        this.series = this.chart.addAreaSeries({
          lineColor: color,
          topColor: `${color}ff`,
          bottomColor: `${color}00`,
          priceLineVisible: false,
          priceFormat: {
            type: 'custom',
            formatter: value => this._checkMyPoolSharePercent(value)
          }
        });
      } else if (this.activeTab === 'PRICE') {
        this.series = this.chart.addAreaSeries({
          color: color,
          lineColor: color,
          topColor: `${color}ff`,
          bottomColor: `${color}00`,
          priceLineVisible: false,
          priceFormat: {
            type: 'custom',
            formatter: value => `${this._num(value, 'usd')}`
          }
        });
      }
      this.series.setData(this.chartData);
    }
  },
  async mounted() {
    if (this.forKurve) {
      await this.loadChart();
      return;
    }
    this.loading = true;
    const metrics = await this.getPoolMetrics(this.pool.id);
    this.metrics = normalizeMetrics(metrics);

    if (this.displayPriceHistory) {
      let page = 1;
      let moreSwaps = true;
      while (moreSwaps) {
        let query = {
          where: {
            poolAddress: this.pool.id.toLowerCase()
          }
        };
        query = { ...query, page };
        const swaps = await this.getLbpSwaps(query);
        this.swaps = this.swaps.concat(swaps);
        moreSwaps = swaps.length == 100;
        if (moreSwaps) {
          page += 1;
        }
      }
    }

    this.loading = false;
    await this.loadChart();
  }
};
</script>

<style lang="scss">
.tab {
  line-height: 40px;
  height: 44px;
  overflow: hidden;
  padding: 0 16px;
  border-radius: $border-radius $border-radius 0 0;
  font-size: 16px;
  color: var(--tab-label-color);
  display: block;
  cursor: pointer;
  &:hover {
    color: var(--theme-mode-icon-hover);
  }
}

.tab.active {
  background: none !important;
  color: $color-primary;
  position: relative;
  &:before {
    content: '';
    height: 4px;
    width: 100%;
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: $color-primary;
  }
}
.chart-background {
  background: var(--panel-background);
  .tv-lightweight-charts {
    table {
      tr {
        td {
          border: 0 !important;
        }
      }
    }
  }
}

.table {
  height: 300px;
  box-shadow: 0 0 5px var(--box-shadow-table);
  border-radius: 0 15px 15px 15px !important;
}

.game-font-size {
  font-size: 12px;
}

.game-border-table-chart {
  border-radius: 0 !important;
  margin-left: 2px;
}

@media only screen and (max-width: 768px) {
  .chart {
    .tabs {
      .tab {
        padding: 0 15px !important;
        font-size: 13px !important;
        height: 40px;
      }
      .game-font-size {
        font-size: 9px !important;
      }
    }
  }
  .chart-background {
    border-radius: 0 !important;
  }

  .game-border-table-chart {
    width: calc(100% - 4px);
  }
}
</style>
