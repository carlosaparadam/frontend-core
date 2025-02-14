<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  <div v-if="!isEmptyValue(storedReportOutput)" key="report-viewer-loaded" style="min-height: inherit;">
    <el-row type="flex" style="min-height: inherit;">
      <el-col :span="24">
        <div class="content">
          <title-and-help
            style="margin: 0 !important;"
            :name="name"
            :help="help"
          />
          <report-panel
            :instance-uuid="storedReportOutput.instanceUuid"
            :container-manager="containerManager"
            :report-output="storedReportOutput"
            :container-uuid="containerUuid"
          />
        </div>
      </el-col>
    </el-row>

    <modal-dialog
      :container-manager="containerManager"
      :container-uuid="containerUuid"
    />
    <el-drawer
      :visible.sync="isShowPanelConfig"
      :with-header="true"
      :before-close="handleClose"
      :size="isMobile ? '100%' : '75%'"
      :show-close="true"
      :title="$t('report.reportSettings')"
    >
      <options-report
        :container-uuid="storedReportOutput.containerUuid"
        :container-manager="containerManager"
        :report-output="storedReportOutput"
        :is-show-title="false"
      />
    </el-drawer>
    <el-button
      v-if="!isShowPanelConfig"
      type="primary"
      icon="el-icon-arrow-left"
      circle
      style="
        top: 50%;
        right: 0%;
        position: absolute;
      "
      @click="handleOpen()"
    />
  </div>

  <loading-view
    v-else
    key="report-viewer-loading"
  />
</template>

<script>
import { defineComponent, computed, onMounted, ref } from '@vue/composition-api'

import lang from '@/lang'
import router from '@/router'
import store from '@/store'

// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
import FileRender from '@/components/ADempiere/FileRender/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import mixinReport from '@/views/ADempiere/Report/mixinReport.js'
import ModalDialog from '@/components/ADempiere/ModalDialog/index.vue'
import OptionsReport from '@/components/ADempiere/ReportManager/Setup/optionsReportViewer.vue'
import TitleAndHelp from '@/components/ADempiere/TitleAndHelp/index.vue'
import reportPanel from '@/views/ADempiere/ReportViewerEngine/reportPanel.vue'

// Constants
import { DEFAULT_REPORT_TYPE } from '@/utils/ADempiere/dictionary/report'

// Utils and Helper Methods
import { convertObjectToKeyValue } from '@/utils/ADempiere/valueFormat.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showNotification } from '@/utils/ADempiere/notification.js'
import { getExtensionFromFile } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'ReportViewerEngine',

  components: {
    FileRender,
    LoadingView,
    ActionMenu,
    ModalDialog,
    TitleAndHelp,
    OptionsReport,
    reportPanel
  },

  setup(props, { root }) {
    const { reportId, reportUuid } = root.$route.params

    const {
      containerManager, actionsManager, storedReportDefinition
    } = mixinReport({
      reportId,
      reportUuid
    })
    const isLoading = ref(false)
    const reportType = ref(DEFAULT_REPORT_TYPE)
    const reportContent = ref('')
    const storedReportOutput = computed(() => {
      return store.getters.getReportOutput(reportId)
    })
    const name = computed(() => {
      if (!isEmptyValue(storedReportOutput.value) && !isEmptyValue(storedReportOutput.value.name)) return storedReportOutput.value.name
      if (!isEmptyValue(storedReportDefinition.value) && !isEmptyValue(storedReportDefinition.value.name)) return storedReportDefinition.value.name
      return ''
    })
    const containerUuid = computed(() => {
      return reportId.toString()
    })
    const help = computed(() => {
      if (isEmptyValue(storedReportDefinition.value) && !isEmptyValue(storedReportOutput.value)) return storedReportOutput.value.name
      return storedReportDefinition.value.help
    })

    const link = computed(() => {
      return storedReportOutput.value.link
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })
    const isShowPanelConfig = computed(() => {
      return store.getters.getShowPanelConfig({
        containerUuid: reportUuid
      })
    })
    function displayReport(reportOutput) {
      if (root.$route.params.isPos) {
        isLoading.value = true
        return
      }
      if (!reportOutput.isError) {
        const { output, report_type: format } = reportOutput

        reportType.value = isEmptyValue(format) ? 'pdf' : format
        reportContent.value = output

        isLoading.value = true
      }

      // update name in tag view
      store.dispatch('tagsView/updateVisitedView', {
        ...root.$route,
        title: `${lang.t('route.reportViewer')}: ${reportOutput.name}`
      })
    }

    // get report from vuex store or request from server
    function getReport() {
      if (root.$route.params.isPos) {
        isLoading.value = true
        return
      }
      if (!isEmptyValue(storedReportDefinition.value)) {
        // findActionsMenu()
        getCachedReport()
        return
      }
      // console.log({ reportId })
      if (isEmptyValue(reportId)) return
      store.dispatch('getReportDefinitionFromServer', {
        id: reportId
      }).then(() => {
        getCachedReport()
      })
    }

    function getCachedReport() {
      if (!isEmptyValue(storedReportOutput.value)) {
        displayReport(storedReportOutput.value)
        return
      }

      const pageSize = undefined
      const pageToken = undefined
      store.dispatch('getSessionProcessFromServer', {
        pageSize,
        pageToken
      })
        .then(runsList => {
          const fileName = root.$route.params.fileName
          const instanceUuid = root.$route.params.instanceUuid
          const currentReportLog = runsList.find(runReport => {
            return runReport.id === reportId
          })

          // empty report log
          if (isEmptyValue(currentReportLog)) {
            showNotification({
              type: 'error',
              title: 'error',
              message: 'requestError'
            })

            store.dispatch('tagsView/delView', root.$route)
              .then(() => {
                router.push('/', () => {})
              })
            return
          }

          const { output } = currentReportLog
          // empty output in report log
          if (isEmptyValue(output.outputStream)) {
            if (isEmptyValue(storedReportOutput.value)) {
              const { parameters } = currentReportLog
              const parametersList = convertObjectToKeyValue({
                object: parameters
              })

              const reportFormat = getExtensionFromFile(fileName)
              store.dispatch('buildReport', {
                uuid: reportUuid,
                reportType: reportFormat,
                reportName: fileName,
                tableName: root.$route.params.tableName,
                parametersList,
                instanceUuid
              }).then(reportOutput => {
                displayReport(reportOutput)
              })
            }
          }
        })
    }

    function handleClose() {
      showPanelConfigReport(false)
    }

    function handleOpen() {
      showPanelConfigReport(!isShowPanelConfig.value)
    }

    function showPanelConfigReport(value) {
      store.commit('setShowPanelConfig', {
        containerUuid: reportUuid,
        value
      })
    }

    const relationsManager = ref({
      menuParentUuid: root.$route.meta.parentUuid
    })

    const drawer = ref(false)

    store.dispatch('findListMailTemplates')

    onMounted(() => {
      getReport()
      root.$route.meta.reportType = reportType.value
    })

    return {
      reportUuid,
      isLoading,
      reportType,
      reportContent,
      actionsManager,
      relationsManager,
      drawer,
      isShowPanelConfig,
      // Computeds
      name,
      help,
      link,
      isMobile,
      reportId,
      storedReportOutput,
      containerManager,
      storedReportDefinition,
      containerUuid,
      // Methods
      handleOpen,
      handleClose,
      showPanelConfigReport
    }
  }
})
</script>

<style lang="scss" scoped>
	.content {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0%;
  }
  .el-table__body-wrapper {
    position: relative;
    height: 100%;
    overflow-y: 'auto';
  }
</style>
