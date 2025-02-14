<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" style="display: flex;width: 100% !important;" @scroll="handleScroll">
      <draggable
        v-if="!isMobile"
        :list="visitedViews"
        v-bind="$attrs"
        :set-data="setData"
        style="display: flex;"
      >
        <router-link
          v-for="tag in visitedViews"
          v-slot="{ navigate }"
          ref="tag"
          :key="tag.path"
          custom
          :class="isActive(tag)?'active':''"
          :to="{
            name: tag.name,
            path: tag.path,
            query: tag.query,
            fullPath: tag.fullPath,
            params: tag.params
          }"
          tag="span"
          class="tags-view-item"
          @click.middle.native="!isAffix(tag) ? closeValidateTag(tag) : ''"
          @contextmenu.prevent.native="openMenu(tag,$event)"
        >
          <span role="link" @click="navigate" @keypress.enter="navigate">
            <div class="tag-title">
              {{ generateTitle(tag.title) }}
            </div>
            <div v-if="!tag.meta.affix" class="el-icon-close" @click.prevent.stop="closeValidateTag(tag)" />
          </span>
        </router-link>
      </draggable>
      <template v-else>
        <div style="display: flex;">
          <router-link
            v-for="tag in visitedViews"
            v-slot="{ navigate }"
            ref="tag"
            :key="tag.path"
            custom
            :class="isActive(tag)?'active':''"
            :to="{ name: tag.name, path: tag.path, query: tag.query, fullPath: tag.fullPath, params: tag.params }"
            tag="span"
            class="tags-view-item"
            @click.middle.native="!isAffix(tag)?closeValidateTag(tag):''"
            @contextmenu.prevent.native="openMenu(tag,$event)"
          >
            <span role="link" @click="navigate" @keypress.enter="navigate">
              {{ generateTitle(tag.title) }}
              <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeValidateTag(tag)" />
            </span>
          </router-link>
        </div>
      </template>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">{{ $t('tagsView.refresh') }}</li>
      <li v-if="!isAffix(selectedTag)" @click="closeValidateTag(selectedTag)">{{ $t('tagsView.close') }}</li>
      <li @click="closeOthersTags">{{ $t('tagsView.closeOthers') }}</li>
      <li @click="closeAllTags(selectedTag)">{{ $t('tagsView.closeAll') }}</li>
    </ul>

    <el-dialog
      :title="$t('window.recordValidation.closeWindow')"
      :visible.sync="dialogVisible"
    >
      <span>
        <el-table
          :data="recordsModifiedWindow"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('window.recordValidation.tab')"
          />
          <el-table-column
            prop="fieldName"
            :label="$t('window.recordValidation.field')"
          />
          <el-table-column
            prop="value"
            :label="$t('window.recordValidation.value')"
          />
        </el-table>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="discardChanges">
          {{ $t('window.recordValidation.discardChanges') }}
        </el-button>
        <el-button type="primary" @click="dialogVisible = false">
          {{ $t('window.recordValidation.returnToWindow') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import { generateTitle } from '@/utils/i18n'
import path from 'path'
import draggable from 'vuedraggable'

// Constants
import {
  REPORT_VIEWER_NAME
} from '@/utils/ADempiere/dictionary/report'

// Utils and Helper Methods
import { capitalize } from '@/utils/ADempiere/formatValue/stringFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  components: {
    ScrollPane, draggable
  },

  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: [],
      dialogVisible: false,
      recordsModifiedWindow: []
    }
  },

  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.routes
    }
  },

  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },

  mounted() {
    this.initTags()
    this.addTags()
  },

  methods: {
    generateTitle, // generateTitle by vue-i18n
    isActive(route) {
      if (route.name === REPORT_VIEWER_NAME) {
        const isSameReport = route.params.reportUuid === this.$route.params.reportUuid
        if (isSameReport && route.params.tableName === this.$route.params.tableName) {
          return isSameReport
        }
        return route.path === this.$route.path
      }
      return route.name === this.$route.name
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (this.$route.name === REPORT_VIEWER_NAME) {
            if (this.$route.params && tag.to.params &&
              tag.to.params.reportUuid === this.$route.params.reportUuid &&
              tag.to.params.tableName === this.$route.params.tableName) {
              this.$refs.scrollPane.moveToTarget(tag)
            }
          }
          if (tag.to.name === this.$route.name) {
            if (tag.to.query && tag.to.query.action && tag.to.query.action === this.$route.query.action) {
              tag.to.params.isReadParameters = false
            }
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    discardChanges() {
      const tabs = new Map()
      this.recordsModifiedWindow.forEach(change => {
        tabs.set(change.containerUuid, {
          parentUuid: change.parentUuid,
          contailerUuid: change.containerUuid
        })
      })

      tabs.forEach((value, key, hasMap) => {
        this.$store.dispatch('setOldPersistenceValues', {
          parentUuid: value.parentUuid,
          containerUuid: value.contailerUuid,
          recordUuid: this.$store.getters.getUuidOfContainer(value.contailerUuid)
        })
      })

      this.dialogVisible = false
      this.closeSelectedTag(this.recordsModifiedWindow.at().view)
    },
    closeValidateTag(view) {
      if (!view.meta || !view.meta.uuid || !view.meta.type || view.meta.type !== 'window') {
        this.closeSelectedTag(view)
        return
      }

      const storedWindow = this.$store.getters.getStoredWindow(view.meta.uuid)
      const columnsChanges = []
      this.recordsModifiedWindow = []
      if (!isEmptyValue(storedWindow)) {
        storedWindow.tabsList.forEach(tabs => {
          const { parentUuid, name, containerUuid, fieldsList } = tabs
          const currentChangesOnTab = this.$store.getters.getPersistenceAttributesChanges({
            parentUuid,
            containerUuid,
            recordUuid: this.$store.getters.getUuidOfContainer(containerUuid)
          })
          if (isEmptyValue(currentChangesOnTab)) {
            return
          }
          currentChangesOnTab.forEach(attribute => {
            const { columnName, value } = attribute
            let fieldName = columnName

            if (!isEmptyValue(fieldsList)) {
              const labelField = fieldsList.find(list => list.columnName === columnName)
              if (!isEmptyValue(labelField)) {
                fieldName = labelField.name
              }
            }

            if (!columnName.includes('DisplayColumn_')) {
              columnsChanges.push({
                fieldName,
                containerUuid,
                parentUuid,
                columnName,
                value,
                name,
                view
              })
            }
          })
        })

        this.recordsModifiedWindow = columnsChanges
        if (!isEmptyValue(this.recordsModifiedWindow)) {
          this.dialogVisible = true
          return
        }
      }
      this.closeSelectedTag(view)
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      }).finally(() => {
        // report view
        if (view.params && view.params.reportUuid) {
          view.meta.uuid = view.params.reportUuid
        }
        if (view.meta && view.meta.uuid && view.meta.type) {
          const panelType = view.meta.type
          let parentUuid
          let containerUuid = view.meta.uuid
          if (panelType === 'window') {
            parentUuid = view.meta.uuid
            containerUuid = view.meta.tabUuid
          }

          const defaultValuesDispatch = `set${capitalize(panelType)}DefaultValues`
          const isExists = this.$store._actions[defaultValuesDispatch]
          if (isExists) {
            this.$store.dispatch(defaultValuesDispatch, {
              parentUuid,
              containerUuid,
              panelType,
              isNewRecord: false
            })
          } else {
            this.$store.dispatch('setDefaultValues', {
              parentUuid,
              containerUuid,
              panelType,
              isNewRecord: false
            })
          }

          if (panelType === 'window') {
            this.$store.dispatch('clearTabData', {
              parentUuid
            })
          } else if (panelType === 'browser') {
            this.$store.dispatch('clearBrowserData', {
              containerUuid
            })
          }
        }
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag, () => {})
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath, () => {})
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({
            path: '/redirect' + view.fullPath
          }, () => {})
        } else {
          this.$router.push('/', () => {})
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    setData(dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    },
    handleScroll() {
      this.closeMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  .tags-view-wrapper {
    width: 100%;
    .tags-view-item {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex:none;
      max-width: 90%;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 7px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      div.tag-title{
        width: -webkit-fill-available;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &:first-of-type {
        margin-left: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          align-self: center;
          background: #fff;
          display: inline-block;
          min-width: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      align-self: center;
      min-width: 16px;
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
