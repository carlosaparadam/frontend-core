<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez Elsiosanches@gmail.com https://github.com/Elsiosanchez
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
  <div>
    <options-wtrial-balance
      :header-list="headerList"
      :metadata="metadata"
    />
    <div>
      <el-table
        v-loading="isLoading"
        :cell-class-name="classChecker"
        :data="listSummary"
        border
        height="calc(100vh - 205px)"
        style="width: 100%; font-size: 12px"
        :summary-method="getSummaries"
        :cell-style="getColumnStyle"
        @selection-change="changeSelections"
      >
        <el-table-column
          type="selection"
          width="45"
        />
        <el-table-column
          v-for="(header, key) in viewList"
          :key="key"
          :align="header.align"
          :min-width="header.width"
          :label="header.label"
          :prop="header.columnName"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-dropdown
              v-if="header.columnName === 'name' || header.columnName === 'value'"
              style="font-size: 10px !important"
              :class="classChecker({ row: scope.row, column: header })"
              trigger="click"
              @command="command => handleCommand(command, scope.row)"
            >
              <span>{{ scope.row[header.columnName] }}</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <i class="el-icon-zoom-in" style="font-weight: bolder;" />
                  <b>
                    {{ $t('page.processActivity.zoomIn') }} {{ ' - ' }}
                    {{ scope.row.name }} {{ ' - ' }} {{ scope.row.value }}
                  </b>
                </el-dropdown-item>
                <el-dropdown-item command="report">
                  <i class="el-icon-printer" style="font-weight: bolder;" />
                  <b>
                    {{ $t('form.WTrialBalance.report') }} {{ ' - ' }}
                    {{ scope.row.name }} {{ ' - ' }} {{ scope.row.value }}
                  </b>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <span v-else>
              <span>{{ scope.row[header.columnName] }}</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  watch
  // computed
} from '@vue/composition-api'
import lang from '@/lang'
import store from '@/store'
import language from '@/lang'

// API Request Methods

// Utils and Helper Methods
import optionsWtrialBalance from './options'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import { isEmptyValue } from '@/utils/ADempiere'
import { showNotification } from '@/utils/ADempiere/notification.js'

export default defineComponent({
  name: 'WTrialBalance',
  components: {
    optionsWtrialBalance
  },
  data() {
    return {
      activeName: 'top'
    }
  },
  props: {
    metadata: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    classChecker({ row, column }) {
      const numberRegex = /[^\d.,-]+/g
      const numberColumns = ['period_actual_amount', 'period_budget_amount', 'ytd_actual_amount', 'ytd_budget_amount', 'variance_amount', 'period_variance_amount', 'variance_percentage']
      if (numberColumns.includes(column.property)) {
        const val = parseFloat(row[column.property].replace(numberRegex, ''))
        if (val < 0) {
          return 'redClass'
        }
      }
    },
    filterMethod(query) {
      this.showListAccoutingKeys(true, query)
    }
  },
  setup() {
    /**
     * Ref
     */
    const isVisible = ref(true)
    const showPeriod = computed(() => {
      return store.getters.getShowPeriod
    })
    // Const
    const COLUMNS_PERIOD = ['period_variance_amount', 'period_actual_amount', 'period_budget_amount']
    const COLUMNS_ACCUMULATED = ['variance_amount', 'variance_percentage', 'ytd_actual_amount', 'ytd_budget_amount']
    const COLUMNS_BUDGET = ['variance_amount', 'variance_percentage', 'period_variance_amount']

    const showAccumulated = computed(() => {
      return store.getters.getShowAccumulated
    })
    const budget = computed(() => {
      return store.getters.getBudget
    })
    const organization = computed(() => {
      return store.getters.getOrganization
    })
    const period = computed(() => {
      return store.getters.getPeriod
    })
    // Data Table
    const headerList = ref([
      {
        label: lang.t('form.WTrialBalance.accountNo'),
        columnName: 'value',
        width: '35',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.accounName'),
        columnName: 'name',
        width: '40px',
        align: 'left'
      },
      {
        label: lang.t('form.WTrialBalance.periodActual'),
        columnName: 'period_actual_amount',
        width: '40',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.periodBudget'),
        columnName: 'period_budget_amount',
        width: '40px',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.periodVariance'),
        columnName: 'period_variance_amount',
        width: '50px',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.yTDActual'),
        columnName: 'ytd_actual_amount',
        width: '50px',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.yTDBudget'),
        columnName: 'ytd_budget_amount',
        width: '60px',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.variance'),
        columnName: 'variance_amount',
        width: '30px',
        align: 'right'
      },
      {
        label: lang.t('form.WTrialBalance.variancePorcent'),
        columnName: 'variance_percentage',
        width: '30px',
        align: 'right'
      }
    ])
    const viewList = ref(headerList.value.filter((header) => !COLUMNS_BUDGET.includes(header.columnName)))
    const isLoading = computed(() => {
      return store.getters.getIsLoading
    })
    const selectedExport = ref([])

    /**
     * Methods
     */
    function getColumnStyle() {
      return 'padding: 0; height: 30px; border: none; font-size: 10px !important '
    }

    function changeSelections(selection) {
      store.commit('setSelectedExport', selection)
    }

    function getSummaries(param) {
      const {
        columns
        // data
      } = param
      const sums = []
      columns.forEach((column, index) => {
        sums[index] = ''
        // if (index === 0) {
        //   sums[index] = 'Total'
        //   return
        // }
        // const values = data.map(item => Number(item[column.property]))
        // if (!values.every(value => isNaN(value))) {
        //   sums[index] = '$ ' + values.reduce((prev, curr) => {
        //     const value = Number(curr)
        //     if (!isNaN(value)) {
        //       return prev + curr
        //     } else {
        //       return prev
        //     }
        //   }, 0)
        // } else {
        //   sums[index] = 'N/A'
        // }
      })

      return sums
    }
    watch(
      () => [budget.value, showPeriod.value, showAccumulated.value],
      (newValue) => {
        let columnsToExclude = []
        if (isEmptyValue(newValue[0])) {
          columnsToExclude = COLUMNS_BUDGET
        }
        if (!isEmptyValue(newValue[0])) {
          columnsToExclude = []
        }
        if (newValue[1]) {
          columnsToExclude = [...columnsToExclude, ...COLUMNS_PERIOD]
        }
        if (newValue[2]) {
          columnsToExclude = [...columnsToExclude, ...COLUMNS_ACCUMULATED]
        }
        viewList.value = headerList.value.filter((header) => !columnsToExclude.includes(header.columnName))
      }
    )
    function changeView(data) {
      isVisible.value = data
    }
    const listSummary = computed(() => {
      return store.getters.getListSummary
    })
    function zoomInWindow(scope) {
      const id = 118
      const columnName = 'C_ElementValue_ID'
      zoomIn({
        attributeValue: `window_${id}`,
        attributeName: 'containerKey',
        query: {
          [columnName]: scope.id
        },
        params: {
          [columnName]: scope.id
        }
      })
    }
    function handleCommand(command, scope) {
      if (command === 'report') {
        generateReport(scope)
        return
      }
      zoomInWindow(scope)
    }

    function generateReport(scope) {
      const reportUuid = 'a42b154a-fb40-11e8-a479-7a0060f0aa01'
      store.dispatch('getReportDefinitionFromServer', {
        id: reportUuid
      })
        .then(res => {
          if (!isEmptyValue(res)) {
            showNotification({
              title: language.t('notifications.processing'),
              message: res.name,
              summary: res.description,
              type: 'info'
            })
            const reportId = res.internal_id
            const filteredData = res.fieldsList.filter(item => item.columnName === 'C_AcctSchema_ID')
            const filters = [
              { 'name': 'C_AcctSchema_ID', 'operator': 'equal', 'values': filteredData[0].parsedDefaultValue },
              { 'name': 'AD_Org_ID', 'operator': 'equal', 'values': organization.value },
              { 'name': 'PostingType', 'operator': 'equal', 'values': 'A' },
              { 'name': 'isShowRetainedEarnings', 'operator': 'equal', 'values': false },
              { 'name': 'C_Period_ID', 'operator': 'equal', 'values': period.value },
              { 'name': 'Account_ID', 'operator': 'equal', 'values': scope.id }
            ]
            store.dispatch('generateReportViwer', {
              reportType: 'pdf',
              reportId,
              filters: JSON.stringify(filters),
              reportUuid,
              containerUuid: res.containerUuid,
              isSummary: true
            })
          }
        })
    }
    return {
      //  Computed
      isVisible,
      showPeriod,
      showAccumulated,
      budget,
      organization,
      period,
      // Data Table
      listSummary,
      headerList,
      viewList,
      selectedExport,
      isLoading,
      // Methods
      changeSelections,
      getSummaries,
      changeView,
      getColumnStyle,
      zoomInWindow,
      generateReport,
      handleCommand
    }
  }
})
</script>

<style lang="scss">
.field-from-trial-balance {
  .el-form-item {
    margin: 0px;
  }
  .el-form-item--medium .el-form-item__label {
    padding: 0px;
  }
  .front-item-w-trial-balance {
    width: 100%;
    .el-form--label-top .el-form-item__label {
      padding: 0px !important;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0px !important;
    }
    .el-form--inline .el-form-item {
      margin: 0px;
    }
  }
}

.el-dropdown {
  color: inherit !important
}

.redClass {
  color: red !important
}
.el-table {
  overflow: scroll
}
.el-table__body-wrapper {
  height: calc(100vh - 205px) !important
}
</style>
