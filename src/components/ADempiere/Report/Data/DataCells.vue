<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/ElsioSanchez
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
  <span
    :style="cellStyle(attributes.code, rowData)"
  >
    <!-- Show cell label -->
    <el-dropdown
      v-if="!isEmptyValue(attributes.column_name)"
      :style="styleFont(attributes)"
      trigger="click"
      @visible-change="loadZoom"
      @command="zoomInWindow"
    >
      <el-dropdown v-if="attributes.column_name === 'Record_ID' && !rowData.is_parent">
        <span v-if="rowData.cells[attributes.code].value !== 0" @click="searchZoom(attributes.code, rowData)"><i class="el-icon-zoom-in" style="font-weight: bolder;" />
        </span>
        <span v-else />
      </el-dropdown>
      <span v-else class="el-dropdown-link">
        {{ displayLabel(attributes, rowData) }}
      </span>
      <el-dropdown-menu
        v-if="isLoaded"
        slot="dropdown"
      >
        <el-dropdown-item>
          <i class="el-icon-loading" />
        </el-dropdown-item>
      </el-dropdown-menu>
      <el-dropdown-menu v-else slot="dropdown">
        <el-dropdown-item
          v-for="(zoom, key) in rowData.zoom_windows"
          :key="key"
          :command="zoom"
        >
          <i class="el-icon-zoom-in" style="font-weight: bolder;" />
          <b>
            {{ $t('page.processActivity.zoomIn') }} {{ ' - ' + zoom.name + ' ( ' + displayLabel(attributes, rowData) + ' )' }}
          </b>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <span v-else>
      {{ displayLabel(attributes, rowData) }}
    </span>
    <!-- Show popover only if the row is selected and is parent -->
    <el-popover
      v-if="currentSelectedColumn === attributes.code && rowData.is_parent"
      v-model="show"
      placement="top"
      class="reportInfo"
      style="position: fixed; z-index: 1000; background-color: #fff;"
    >
      <!-- InfoReport component with modal data -->
      <InfoReport
        :data="dataModal"
      />
    </el-popover>
  </span>
</template>

<script>
import store from '@/store'
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

// Components and Mixins
import InfoReport from '@/views/ADempiere/ReportViewerEngine/infoReport.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { formatField } from '@/utils/ADempiere/valueFormat.js'

// API Request Methods
import { listZoomWindowsRequest } from '@/api/ADempiere/fields/zoom.js'

export default defineComponent({
  name: 'DataCells',

  components: {
    InfoReport
  },

  props: {
    attributes: {
      type: Object,
      required: true
    },
    rowData: {
      type: Object,
      required: true
    },
    keyColumn: {
      type: Number,
      required: true
    },
    currentSelectedRow: {
      typeof: Object,
      default: null
    },
    currentSelectedColumn: {
      typeof: String,
      default: undefined
    },
    dataModal: {
      type: Object,
      default: null
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    containerUuid: {
      type: String,
      required: true
    },
    tableName: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    // Ref
    const isLoaded = ref(false)
    // Computed

    const show = computed({
      get() {
        const showValidate = props.currentSelectedRow === props.rowData && props.currentSelectedColumn === props.attributes.code && props.rowData.is_parent
        return props.showDetails && showValidate
      },
      // setter
      set(value) {
        return value
      }
    })

    // Methods

    /**
     * Should Hide Name
     * (Function to determine if cell should be hidden)
     * @param {Object} row
     */
    function shouldHideName(row) {
      if (row.is_parent && row.isTopLevel) {
        return true
      }
      if (!row.is_parent) {
        return true
      }
      return false
    }
    function styleFont(font) {
      let fontStyle = ''
      if (!isEmptyValue(font.color)) {
        fontStyle += `color: ${font.color} !important;`
      }
      if (isEmptyValue(font.font_code)) {
        fontStyle += 'font-size: 11px !important'
      }
      if (!isEmptyValue(font.font_code)) {
        const lastIndex = font.font_code.lastIndexOf('-')
        const fontFamily = font.font_code.substr(0, lastIndex)
        const fontSize = font.font_code.substr(lastIndex + 1)
        fontStyle += `font-family: ${fontFamily} !important; font-size: ${fontSize}px !important;`
      }
      return fontStyle
    }

    /**
     * Cell Style
     * (Function to obtain the cell style)
     * @param {String} code
     * @param {Object} row
     */
    function cellStyle(code, row) {
      if (isEmptyValue(row.cells[code])) {
        return {}
      }
      const { value } = row.cells[code]
      if (!isEmptyValue(value) && value.type) {
        if (value.type === 'decimal' && value.value < 0) {
          return { color: 'red' }
        }
      }
    }

    /**
     * Display Label
     * (Function to display the cell label)
     * @param {Object} field
     * @param {Object} row
     */
    function displayLabel(field, row) {
      if (isEmptyValue(row.cells)) {
        return
      }
      const rowData = row.cells[field.code]
      if (!isEmptyValue(rowData)) {
        const { display_value, value: currentValue } = rowData
        return formatField({
          value: currentValue,
          displayedValue: display_value,
          displayType: field.display_type,
          columnName: field.column_name
        })
      }
    }

    function loadZoom(show) {
      if (
        !show ||
        isEmptyValue(props.tableName) ||
        isEmptyValue(props.attributes.column_name)
      ) {
        isLoaded.value = false
        return
      }
      // props.rowData.isLoadingZoom = true
      isLoaded.value = true
      listZoomWindowsRequest({
        column_name: props.attributes.column_name,
        table_name: props.tableName
      })
        .then(response => {
          const { zoom_windows } = response
          let listZoom = zoom_windows
          // TODO: Add support to row report
          const salesTransaction = isSalesTransaction({
            // parentUuid: uuid,
            containerUuid: props.containerUuid
          })

          // filter windows
          if (listZoom.length > 1 && !isEmptyValue(salesTransaction)) {
            listZoom = zoom_windows.filter(zoom => {
              const {
                // is_sales_transaction,
                is_purchase
              } = zoom
              if (!is_purchase === salesTransaction) {
                return true
              }
              return false
            })
          }

          const listZoomWindows = listZoom.map(listZoom => {
            return {
              ...listZoom,
              columnName: props.attributes.column_name,
              currentValue: props.rowData.cells[props.attributes.code]
            }
          })

          props.rowData.zoom_windows = listZoomWindows
          isLoaded.value = false
        })
        .finally(() => {
          isLoaded.value = false
        })
    }

    function zoomInWindow(report) {
      const { columnName, id, currentValue } = report
      zoomIn({
        attributeValue: `window_${id}`,
        attributeName: 'containerKey',
        query: {
          [columnName]: currentValue.value
        },
        params: {
          [columnName]: currentValue.value
        }
      })
    }
    function searchZoom(code, row) {
      if (
        !isEmptyValue(row) &&
        !isEmptyValue(row.cells) &&
        !isEmptyValue(row.cells[code])
      ) {
        const { table_name, value } = row.cells[code]
        store.dispatch('getZoomWindowsListFromServer', {
          tableName: table_name
        })
          .then(response => {
            if (!isEmptyValue(response)) {
              const { key_column_name, zoom_windows } = response
              if (!isEmptyValue(key_column_name) && !isEmptyValue(zoom_windows)) {
                const [{ id }] = zoom_windows
                newZoom(id, key_column_name, value)
              }
            }
          })
      }
    }

    function newZoom(id, columnName, value) {
      zoomIn({
        attributeValue: `window_${id}`,
        attributeName: 'containerKey',
        query: {
          [columnName]: value
        },
        params: {
          [columnName]: value
        }
      })
    }

    return {
      // Ref
      isLoaded,
      // Computed
      show,
      // Métodos
      loadZoom,
      cellStyle,
      displayLabel,
      zoomInWindow,
      shouldHideName,
      styleFont,
      newZoom,
      searchZoom
    }
  }
})
</script>
