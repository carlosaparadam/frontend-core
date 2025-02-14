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
  <form
    enctype="multipart/form-data"
    class="custom-field-image"
    @submit.prevent="notSubmitForm"
  >
    <el-col v-if="isShowImage" :span="24" :offset="0" class="image-with-file">
      <el-card :body-style="{ padding: '0px', height: '-webkit-fill-available !important' }">
        <el-image
          v-if="!isLoadImageUpload"
          class="image-file"
          :alt="altImage"
          :src="pathImage"
          :preview-src-list="previewList"
          lazy
          fit="contain"
          style="text-align: center ; height: 100px"
        >
          <el-skeleton
            slot="placeholder"
            :loading="true"
            animated
            :throttle="500"
            class="image-loading"
          >
            <template slot="template">
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px;"
              />
            </template>
          </el-skeleton>
        </el-image>
        <el-skeleton
          v-else
          :loading="true"
          animated
        >
          <template slot="template">
            <el-skeleton-item
              variant="image"
              class="image-file"
              style="text-align: center ; height: 100px"
            />
          </template>
        </el-skeleton>

        <div class="image-footer">
          <file-info
            :image-id="value"
            :resource-name="displayedValue"
            :info-image="infoImage"
            class="popover-info"
          />

          <file-share
            :image-id="value"
            :resource-name="displayedValue"
            :file="fileResource"
            :file-name="displayedValue"
            :file-url="infoImage.name"
            class="popover-info"
          />

          <!-- <el-button
            class="button-manage-file-svg"
            plain
            :disabled="isDisabled"
            @click="clearValues()"
          >
            <svg-icon
              icon-class="layers-clear"
            />
          </el-button> -->

          <el-button
            icon="el-icon-delete"
            class="button-manage-file"
            plain
            :disabled="isEmptyValue(infoImage) || isDisabled"
            @click="handleRemove()"
          />

          <el-upload
            ref="replaceFileComponent"
            v-bind="commonsProperties"
            :action="endPointUploadResource"
            :data="additionalData"
            :headers="additionalHeaders"
            class="upload-button"
            name="file"
            :show-file-list="false"
            :accept="MIME_TYPE_IMAGE"
            :multiple="false"
            :before-upload="isValidUploadHandler"
            :on-success="loadedSucess"
            :on-change="handleChange"
          >
            <el-button
              class="button-manage-file-svg"
              plain
              :disabled="isDisabled"
            >
              <svg-icon
                icon-class="cloud_upload"
              />
            </el-button>
          </el-upload>
          <el-button
            class="button-manage-file-svg"
            plain
            :disabled="isEmptyValue(infoImage)"
            @click="handleDownload()"
          >
            <svg-icon
              icon-class="cloud_download"
            />
          </el-button>
        </div>
      </el-card>
    </el-col>

    <el-upload
      v-else
      ref="uploadComponent"
      class="image-without-file"
      v-bind="commonsProperties"
      :action="''"
      :data="additionalData"
      :headers="additionalHeaders"
      drag
      name="file"
      :accept="MIME_TYPE_IMAGE"
      :show-file-list="false"
      :multiple="false"
      :before-upload="isValidUploadHandler"
      :on-success="loadedSucess"
    >
      <svg-icon icon-class="cloud_upload" class="icon-image-upload" style="font-size: 45px;" />
    </el-upload>
  </form>
</template>

<script>
import lang from '@/lang'
import router from '@/router'

// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldWithDisplayColumn from '@/components/ADempiere/FieldDefinition/mixin/mixinWithDisplayColumn.js'
import FileInfo from '@/components/ADempiere/PanelInfo/Component/AttachmentManager/fileInfo'
import FileShare from '@/components/ADempiere/PanelInfo/Component/AttachmentManager/FileShare'

// Constants
import { config } from '@/utils/ADempiere/config'
import { BEARER_TYPE } from '@/utils/auth'
import { MIME_TYPE_IMAGE } from '@/utils/ADempiere/resource/image.ts'
import { UUID_PATTERN } from '@/utils/ADempiere/recordUtil'
import { RESOURCE_TYPE_IMAGE } from '@/utils/ADempiere/resource'
import { CLIENT } from '@/utils/ADempiere/constants/systemColumns'
import { UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'

// API Request Methods
import {
  requestPresignedUrl,
  requestListResources,
  requestShareResources,
  requestDeleteResources,
  requestSetResourceReference
} from '@/api/ADempiere/file-management/resource-reference.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getToken } from '@/utils/auth'
import { pathImageWindows } from '@/utils/ADempiere/resource'
import { showMessage } from '@/utils/ADempiere/notification'
import { refreshRecord } from '@/utils/ADempiere/dictionary/window'

export default {
  name: 'FieldImage',

  components: {
    FileInfo,
    FileShare
  },

  mixins: [
    fieldMixin,
    fieldWithDisplayColumn
  ],

  props: {
    // receives the property that is an object with all the attributes
    binary: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      config,
      additionalData: {},
      fileResource: {},
      imageSourceSmall: '',
      MIME_TYPE_IMAGE,
      isLoadImage: false,
      infoImage: {},
      isLoadImageUpload: false,
      isShowImage: false,
      valuesImage: [{
        identifier: 'undefined',
        value: '',
        isLoaded: true
      }]
    }
  },

  computed: {
    cssClassCustomField() {
      return ' custom-field-image '
    },
    altImage() {
      const displayedAlt = this.displayedValue
      if (isEmptyValue(displayedAlt)) {
        return this.value
      }
      return displayedAlt.replace(UUID_PATTERN, '')
        .replace(/^-{0,1}/, '')
    },
    isDownload() {
      return !isEmptyValue(this.displayedValue)
    },
    endPointUploadResource() {
      let resourceId = this.value
      if (isEmptyValue(resourceId)) {
        resourceId = -1
      }
      const getUrl = config.adempiere.api.url + '/resources/' + this.displayedValue
      return getUrl
    },
    additionalHeaders() {
      const token = getToken()
      let bearerToken = token
      // Json Web Token
      if (!isEmptyValue(bearerToken) && !bearerToken.startsWith(BEARER_TYPE)) {
        bearerToken = `${BEARER_TYPE} ${token}`
      }
      return {
        Authorization: bearerToken
      }
    },
    recordId() {
      const { table } = this.currentTab
      const { key_columns, table_name } = table
      if (!isEmptyValue(this.currentRecord[table_name + '_ID'])) return this.currentRecord[table_name + '_ID']
      if (!isEmptyValue(key_columns)) return this.currentRecord[key_columns[0]]
      return 1
    },
    clientUuid() {
      const { type } = router.app._route.meta
      if (type === 'window') {
        const { parentUuid, containerUuid } = this.currentTab
        const clientIdRecord = this.$store.getters.getValueOfFieldOnContainer({
          parentUuid,
          containerUuid,
          columnName: CLIENT + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
        })
        if (!this.isEmptyValue(clientIdRecord)) return clientIdRecord
      }
      const { client } = this.$store.getters['user/getRole']
      return client.uuid
    },
    tableNameImage() {
      return this.currentTab.table_name.toLowerCase()
    },
    previewList() {
      const imageSource = this.imageSourceSmall
      if (!isEmptyValue(imageSource)) {
        return [imageSource]
      }
      const newSoruce = this.pathImage
      if (!isEmptyValue(newSoruce)) {
        return [newSoruce]
      }
      return []
    },
    columnNameImage() {
      return this.metadata.columnName.toLowerCase()
    },
    nameImage() {
      return this.columnNameImage + '.png'
    },
    pathImage() {
      return pathImageWindows({
        clientId: this.clientUuid,
        tableName: this.tableNameImage,
        recordId: this.recordId,
        columnName: this.columnNameImage,
        resourceName: this.nameImage
      })
    }
  },

  watch: {
    displayedValue(newValue) {
      if (isEmptyValue(newValue)) {
        this.imageSourceSmall = undefined
      } else {
        this.valideImage(this.displayedValue)
      }
    }
  },

  mounted() {
    this.getListResources()
    this.valideImage()
  },
  updated() {
    if (!isEmptyValue(this.displayedValue) && isEmptyValue(this.imageSourceSmall) && !this.isLoadImage) {
      this.valideImage(this.displayedValue)
    }
    this.valideImage()
  },

  methods: {
    valideImage() {
      fetch(this.pathImage)
        .then(response => {
          this.isShowImage = response.status === 200
        })
    },
    isValidUploadHandler(file) {
      return new Promise((resolve, reject) => {
        const isLt2M = file.size / 1024 / 1024 < 2
        if (file.type !== 'image/png') {
          showMessage({
            message: lang.t('component.attachment.fieldImage.errorFormat'),
            type: 'error'
          })
          reject(false)
          return
        } else if (!isLt2M) {
          showMessage({
            message: lang.t('component.attachment.fieldImage.errorSize'),
            type: 'error'
          })
          reject(false)
          return
        }
        if (this.isDisabled) {
          reject(false)
          return
        }
        this.presignedUrl({ file })
        // TODO: Replace and separate requests in different functions
        // if (!this.isEmptyValue(this.value)) this.presignedUrl({ file })
        // this.handleReference(file)
      })
    },
    handleChange(file, fileList) {
    },
    handleError(error, file, fileList) {
      return showMessage({
        type: 'error',
        message: error.message || error.result || lang.t('component.attachment.error')
      })
    },
    loadedSucess(response, file, fileList) {
      // this.isValidUploadHandler(file)
      if (response.code >= 400) {
        setTimeout(() => {
          fileList.pop()
        }, 500)
        return this.handleError(
          new Error(response.result),
          file,
          fileList
        )
      }
    },

    clearValues() {
      if (this.isDisabled) {
        return
      }
      this.value = undefined
      this.preHandleChange(this.value)
      // this.displayedValue = undefined
    },

    /**
     * Create and Update Reference
     */
    handleReference(file) {
      return new Promise((resolve, reject) => {
        requestSetResourceReference({
          resourceType: RESOURCE_TYPE_IMAGE,
          id: this.value || -1,
          fileName: file.name,
          fileSize: file.size
        })
          .then(responseReferences => {
            if (responseReferences.code >= 400) {
              reject(responseReferences)
              return
            }
            this.fileResource = responseReferences
            this.additionalData = {
              id: responseReferences.id
            }

            this.presignedUrl({ file, reference: responseReferences })
            resolve(responseReferences)
          })
          .catch(error => {
            showMessage({
              message: error.message || error.result || lang.t('component.attachment.error'),
              type: 'error'
            })
            this.presignedUrl({ file })
            reject(error)
          })
      })
    },

    /**
     * Get URL
     */
    presignedUrl({ file, reference }) {
      return new Promise((resolve, reject) => {
        this.isLoadImageUpload = true
        requestPresignedUrl({
          clientId: this.clientUuid,
          containerType: 'attachment',
          columnName: this.columnNameImage,
          fileName: this.nameImage,
          recordId: this.recordId,
          tableName: this.tableNameImage
        })
          .then(responseUrl => {
            const { url, file_name } = responseUrl
            fetch(url, {
              method: 'PUT',
              body: file
            }).then(() => {
              this.getListResources()
              setTimeout(() => {
                this.imageSourceSmall = this.pathImage
                this.valideImage(file)
                this.displayedValue = file_name
              }, 1500)
              resolve(true)
            }).catch((error) => {
              showMessage({
                message: error.message || error.result || lang.t('component.attachment.error'),
                type: 'error'
              })
              this.handleRemove()
              reject(error)
            }).finally(() => {
              this.isLoadImageUpload = false
            })
          })
      })
    },

    /**
     * Handle Download image
     */
    async handleDownload() {
      const {
        name
      } = this.infoImage
      const file = document.createElement('a')
      file.href = `${config.adempiere.api.url}resources/${name}`
      file.download = `${name}`
      file.target = '_blank'
      file.click()
      return
    },

    async urlDownload({
      fileName
    }) {
      return new Promise((resolve, reject) => {
        requestShareResources({
          fileName,
          seconds: 3600
        })
          .then(response => {
            resolve(response)
          })
          .catch(() => {
            reject('')
          })
      })
    },

    /**
     * Handle Removeya esta actualizado solop
     */
    handleRemove() {
      const { name } = this.infoImage
      if (isEmptyValue(name)) {
        this.getListResources()
        return
      }

      const {
        id,
        parentUuid,
        containerUuid
      } = this.currentTab

      requestDeleteResources({
        fileName: name
      })
        .then(() => {
          refreshRecord.refreshRecord({
            parentUuid,
            containerUuid,
            tabId: id,
            recordId: this.recordId
          })
        })
    },

    getListResources() {
      return new Promise((resolve, reject) => {
        const { table_name } = this.currentTab
        requestListResources({
          clientId: this.clientUuid,
          // containerId: action_id,
          containerType: 'attachment',
          columnName: this.metadata.columnName,
          recordId: this.recordId,
          tableName: table_name
        })
          .then(response => {
            let image = ''
            const resources = response.resources.find(resource => resource.name.includes(this.columnNameImage))
            if (!this.isEmptyValue(resources)) {
              image = resources.name
              this.infoImage = resources
            }
            resolve(image)
          })
          .catch((error) => {
            showMessage({
              message: error.message || error.result || lang.t('component.attachment.error'),
              type: 'error'
            })
            reject('')
          })
      })
    },
    sortResource(resources) {
      return resources.sort((a, b) => {
        const fechaA = new Date(a.last_modified)
        const fechaB = new Date(b.last_modified)

        if (fechaA < fechaB) {
          return -1
        } else if (fechaA > fechaB) {
          return 1
        } else {
          return 0
        }
      })
    }
  }
}
</script>

<style lang="scss">
.load-references {
  display: inline-block;
  margin: 7px;
  // .el-upload-list {
  //   display: none;
  // }
  .el-upload-dragger {
    background-color: #fff !important;
    border: 0px dashed #d9d9d9 !important;
    border-radius: 0px !important;
    -webkit-box-sizing: border-box !important;
    box-sizing: border-box !important;
    width: auto !important;
    height: auto !important;
    text-align: center !important;
    cursor: pointer !important;
    display: contents !important;
    overflow: hidden !important;
    margin-top: 9px !important;
  }
}
.custom-field-image {
  .image-with-file {
    // width: 178px;
    max-height: 178px;
    .image-file {
      // align center alt text
      // display: flex;
      // display: block;
      align-items: center;
      justify-content: center;

      // width: 178px;
      // height: 178px;

      display: block;
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 5px;
      border: 1px solid rgba(184, 186, 188, 0.64);
      width: 100%;
      height: 100%;

      .image-loading {
        width: 100%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .image-footer {
      text-align: center;
      // margin-top: 0px;
      // margin-bottom: 0px;
      padding-top: 7px;
      padding-bottom: 5px;
      padding-left: 10px;
      padding-right: 10px;

      .popover-info {
        margin-right: 10px;
        .el-button {
          font-size: 20px;
          padding-top: 5px;
          padding-bottom: 5px;
          padding-left: 10px;
          padding-right: 10px;
        }
      }

      .button-manage-file {
        font-size: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
      }

      .button-manage-file-svg {
        font-size: 24px;
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 8px;
        padding-right: 8px;
      }

      .upload-button {
        display: initial;
        margin-left: 10px;
        margin-right: 10px;
      }
    }
  }

  .image-without-file {
    .icon-image-upload {
        height: 178px;
        text-align: center;
        color: #8c939d;
      }
      svg.icon-image-upload {
        font-size: 45px;
      }
      i.icon-image-upload {
        font-size: 28px;
        width: 178px;
      }
  }
}
</style>
