<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div
    :style="styleMain"
  >
    <el-row
      :gutter="10"
      :class="classPanel"
    >
      <el-col
        v-for="(taks, key) in mainTaks"
        :key="key"
        :xs="12"
        :sm="12"
        :lg="spanSize"
        class="card-panel-col"
      >
        <div class="card-panel" @click="handleClick(taks)">
          <div
            :class="taks.classCard"
            style="text-align: center;width: 100%;"
          >
            <el-badge
              :value="taks.recordCount"
              type="primary"
              class="class-card-panel"
            >
              <i
                v-if="taks.svg.type === 'i'"
                :class="taks.svg.class"
                style="font-size: 55px"
              />
              <svg-icon
                v-else
                :icon-class="taks.svg.class"
                class-name="card-panel-icon"
                style="margin: 0px !important;"
              />
            </el-badge>
            <p
              style="margin: 0px;font-size: 14px"
            >
              {{ taks.name }}
            </p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import CountTo from 'vue-count-to'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import store from '@/store'
import { setIconsTableName } from '@/utils/ADempiere'

export default defineComponent({
  components: {
    CountTo
  },
  setup(props) {
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const classPanel = computed(() => {
      if (isMobile.value) return 'panel-group-taks-mobile'
      return 'panel-group-taks'
    })

    const spanSize = computed(() => {
      // const quantity = mainTaks.value.length
      // if (quantity === 1) return 24
      // if (quantity === 2) return 12
      // if (quantity === 3) return 8
      // if (quantity <= 4) return 6
      // if (quantity >= 5) return 4
      return 5
    })

    const styleMain = computed(() => {
      const quantity = mainTaks.value.length
      if (quantity > 4) return 'display: flex;padding: 0px 15px 10px 5px;'
      return 'padding: 0px 15px 20px 5px;'
    })

    const documentList = computed(() => {
      return store.getters.getListTaks.map(tasks => {
        const { tableName } = tasks
        return {
          ...tasks,
          svg: setIconsTableName({
            tableName
          })
        }
      })
    })

    const mainTaks = computed(() => {
      const list = documentList.value
      return list.map((currentValue, index, array) => {
        let classCard = 'card-panel-icon-wrapper icon-people'
        switch (index) {
          case 1:
            classCard = 'card-panel-icon-wrapper icon-message'
            break
          case 2:
            classCard = 'card-panel-icon-wrapper icon-money'
            break
          case 3:
            classCard = 'card-panel-icon-wrapper icon-shopping'
            break
        }
        return {
          ...currentValue,
          classCard
        }
      })
    })

    function loadPendingDocuments() {
      store.dispatch('listPendingDocuments')
    }

    function handleClick(taks) {
      zoomIn({
        attributeValue: `window_${taks.windowId}`,
        attributeName: 'containerKey',
        query: {
          tabParent: 0,
          referenceUuid: taks.recordReferenceUuid
        }
      })
    }

    loadPendingDocuments()

    return {
      // Computed
      mainTaks,
      isMobile,
      spanSize,
      styleMain,
      classPanel,
      documentList,
      // Methods
      handleClick,
      loadPendingDocuments
    }
  }
})
</script>

<style lang="scss">

.class-card-panel {
  .el-badge__content.is-fixed {
    position: absolute;
    top: 6px;
    right: 20px;
    transform: translateY(-50%) translateX(100%);
  }
}
.panel-group-taks {
  margin: 0px;
  margin-left: -5px;
  margin-right: -5px;
  height: 100%;
  display: flex;
  overflow: auto;
  padding-bottom: 7px;

  .card-panel-col {
    margin-bottom: 0px;
  }

  .card-panel {
    height: 110px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    position: relative;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 0px;
      // margin: 5px 0px 5px 14px;
      padding: 16px 0px 0px 0px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 50px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 15px;
      margin-left: 0px;
      width: 100%;
      margin-right: 10px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        text-align: end;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
.panel-group-taks-mobile {
  margin: 0px;
  margin-left: -5px;
  margin-right: -5px;
  height: 90px;
  margin-bottom: 10px;
  // display: flex;
  // overflow: auto;
  padding-bottom: 10px;

  .card-panel-col {
    margin-bottom: 5px;
    .card-panel{
      .card-panel-icon-wrapper{
        p {
          font-size: 12px !important;
        }
      }
    }
  }

  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    position: relative;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 0px;
      // margin: 5px 0px 5px 14px;
      padding: 16px 0px 0px 0px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 50px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 15px;
      margin-left: 0px;
      width: 100%;
      margin-right: 10px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        text-align: end;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
