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
  <div key="report-viewer-loaded" v-loading="isLoading" style="min-height: inherit;">
    <el-row type="flex" style="min-height: inherit;">
      <el-col :span="24">
        <div class="content">
          <title-and-help
            style="margin: 0 !important;"
            :name="name"
            :help="help"
          />
          <file-render
            v-if="!isEmptyValue(storedReportOutput)"
            :key="storedReportOutput.output_stream"
            :format="reportType"
            :content="reportContent"
            :src="link.href"
            :mime-type="storedReportOutput.mime_type"
            :name="storedReportOutput.name"
            :stream="storedReportOutput.output_stream"
          />
        </div>
      </el-col>
    </el-row>

    <modal-dialog
      :container-manager="containerManager"
      :container-uuid="reportUuid"
    />
    <el-drawer
      :visible.sync="isShowPanelConfig"
      :with-header="true"
      :before-close="handleClose"
      :size="isMobile ? '100%' : '50%'"
      :show-close="true"
      :title="$t('report.reportSettings')"
    >
      <options-report
        :container-uuid="reportUuid"
        :container-manager="containerManager"
        :is-show-title="false"
      />
    </el-drawer>
    <dialogShareReport
      :report-output="storedReportDefinition"
      :is-panel="false"
      :is-legacy="true"
    />
    <el-button
      v-if="!isEmptyValue(storedReportDefinition)"
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

  <!-- <loading-view
    v-else
    key="report-viewer-loading"
  /> -->
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
import OptionsReport from '@/components/ADempiere/ReportManager/Setup/optionsReport.vue'
import TitleAndHelp from '@/components/ADempiere/TitleAndHelp/index.vue'
import dialogShareReport from '@/views/ADempiere/ReportViewerEngine/dialog'

// Constants
import { DEFAULT_REPORT_TYPE } from '@/utils/ADempiere/dictionary/report'

// Utils and Helper Methods
import { convertObjectToKeyValue } from '@/utils/ADempiere/valueFormat.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showNotification } from '@/utils/ADempiere/notification.js'
import { getExtensionFromFile } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'ReportViewer',

  components: {
    FileRender,
    LoadingView,
    ActionMenu,
    ModalDialog,
    TitleAndHelp,
    OptionsReport,
    dialogShareReport
  },

  setup(props, { root }) {
    const storedReportOutput = computed(() => {
      return store.getters.getReportOutput(root.$route.params.reportId)
    })
    let { reportId, reportUuid } = root.$route.params
    if (!isEmptyValue(storedReportOutput.value)) {
      if (isEmptyValue(reportId) || reportId <= 0) {
        reportId = storedReportOutput.value.reportId
      }
      if (isEmptyValue(reportUuid)) {
        reportUuid = storedReportOutput.value.reportUuid
      }
    }

    const {
      containerManager, actionsManager, storedReportDefinition
    } = mixinReport({
      reportId,
      reportUuid
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingReportLegacy
    })
    const reportType = ref(DEFAULT_REPORT_TYPE)
    const reportContent = ref('')

    const name = computed(() => {
      if (isEmptyValue(storedReportDefinition.value) && !isEmptyValue(storedReportOutput.value)) return storedReportOutput.value.name
      return storedReportDefinition.value.name
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
        return
      }
      if (!reportOutput.isError) {
        const { output, report_type: format } = reportOutput

        reportType.value = isEmptyValue(format) ? 'pdf' : format
        reportContent.value = output
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
        return
      }
      if (!isEmptyValue(storedReportDefinition.value)) {
        // findActionsMenu()
        getCachedReport()
        return
      }
      if (!isEmptyValue(store.getters.getStoredReport(storedReportOutput.value.reportUuidStore))) {
        getCachedReport()
        return
      }

      store.dispatch('getReportDefinitionFromServer', {
        // id: reportId
        id: reportUuid
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
            return runReport.uuid === reportUuid
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
            } else {
              // add output to render
              // displayReport(storedReportOutput.value)
            }
          }
        })
    }

    // function findActionsMenu() {
    //   store.dispatch('setReportActionsMenu', {
    //     containerUuid: reportUuid
    //   })
    // }

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
      containerManager,
      storedReportOutput,
      storedReportDefinition,
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
