<template>
  <div class="login-container">
    <el-form ref="enrollmentUserForm" :rules="passwordResetRules" :model="enrollmentUserForm" class="login-form" auto-complete="off" label-position="left">
      <el-row>
        <el-col :span="4">
          <img
            :src="logo"
            style="width: 100px;height: 80px;"
          >
        </el-col>
        <el-col :span="20" style="margin-top: 15px;">
          <div class="title-container">
            <h3 class="title">
              {{ $t('page.login.userEnrollment') }}
            </h3>
            <lang-select class="set-language" />
          </div>
        </el-col>
      </el-row>

      <el-form-item prop="name">
        <el-input
          ref="name"
          v-model="enrollmentUserForm.name"
          :placeholder="$t('page.login.name')"
          type="text"
          tabindex="1"
          auto-complete="off"
          @keyup.enter.native="handleSubmit"
        />
      </el-form-item>
      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="userName"
          v-model="enrollmentUserForm.userName"
          :placeholder="$t('page.login.userName')"
          type="text"
          tabindex="1"
          auto-complete="off"
          @keyup.enter.native="handleSubmit"
        />
      </el-form-item>
      <el-form-item prop="eMail">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="eMail"
          v-model="enrollmentUserForm.eMail"
          :placeholder="$t('page.login.eMail')"
          type="text"
          tabindex="1"
          auto-complete="off"
          @keyup.enter.native="handleSubmit"
        />
      </el-form-item>

      <el-tooltip v-show="isShowPassword" v-model="capsTooltip" :content="$t('page.login.capsLock')" placement="right" auto-complete="off" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="enrollmentUserForm.password"
            :type="passwordType"
            :placeholder="$t('page.login.passwordNew')"
            tabindex="1"
            auto-complete="off"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-tooltip v-show="isShowPassword" v-model="capsTooltipNew" :content="$t('page.login.capsLock')" placement="right" manual>
        <el-form-item prop="passwordConfirm">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordConfirmType + 'New'"
            ref="passwordConfirm"
            v-model="enrollmentUserForm.passwordConfirm"
            :type="passwordConfirmType"
            :placeholder="$t('page.login.passwordConfirmNew')"
            tabindex="2"
            auto-complete="off"
            @keyup.native="checkCapslockNew"
            @blur="capsTooltipNew = false"
            @keyup.enter.native="handleSubmit"
          />
          <span class="show-pwd" @click="showPasswordConfirm">
            <svg-icon :icon-class="passwordConfirmType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button
        :disabled="!isReadyFormSubmit"
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleSubmit"
      >
        {{ $t('page.login.submit') }}
      </el-button>

      <el-button type="text" style="float: left" @click.native.prevent="pathRedirect('login')">
        {{ $t('login.title') }}
      </el-button>
    </el-form>
  </div>
</template>

<script>
import loginMixin from './loginMixin.js'
import { requestEnrollUser } from '@/api/ADempiere/enrollment.js'

export default {
  name: 'UserEnrollment',
  mixins: [loginMixin],
  data() {
    const validateField = (rule, value, callback) => {
      if (this.isEmptyValue(value)) {
        callback(new Error(this.$t('notifications.fieldMandatory')))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (this.isEmptyValue(value) && this.isShowPassword) {
        callback(new Error(this.$t('notifications.fieldMandatory')))
      } else {
        callback()
      }
    }
    const validateNewPass = (rule, value, callback) => {
      if (this.isEmptyValue(value) && this.isShowPassword) {
        callback(new Error(this.$t('notifications.fieldMandatory')))
      } else if (value !== this.enrollmentUserForm.password) {
        callback(new Error(this.$t('login.passwordAndConfirmNotMatch')))
      } else {
        callback()
      }
    }

    /**
     * eMail pattern by:
     * https://github.com/EdwinBetanc0urt/validateInput/
     */
    const eMailPattern = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{1,})$/i
    const validateEmail = (rule, value, callback) => {
      if (!this.eMailPattern.test(value)) {
        callback(new Error(this.$t('notifications.invalidEmailFormat')))
      } else {
        callback()
      }
    }
    return {
      eMailPattern: eMailPattern,
      enrollmentUserForm: {
        name: '',
        userName: '',
        eMail: '',
        password: '',
        passwordConfirm: ''
      },
      isShowPassword: false,
      passwordResetRules: {
        name: [{ validator: validateField, trigger: 'blur' }],
        userName: [{ validator: validateField, trigger: 'blur' }],
        eMail: [
          { validator: validateField, trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        password: [{ validator: validatePass, trigger: 'blur' }],
        passwordConfirm: [{ validator: validateNewPass, trigger: 'blur' }]
      },
      loading: false,
      passwordType: 'password',
      passwordConfirmType: 'password',
      capsTooltip: false,
      capsTooltipNew: false
    }
  },
  computed: {
    logo() {
      const { logoUrl } = this.$store.getters['user/getSystem']
      if (logoUrl) {
        return logoUrl
      }
      return 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4'
    },
    isReadyFormSubmit() {
      const { name, userName, eMail, password, passwordConfirm } = this.enrollmentUserForm
      if (this.isEmptyValue(name)) {
        return false
      }
      if (this.isEmptyValue(userName)) {
        return false
      }
      if (this.isEmptyValue(eMail) || !this.eMailPattern.test(eMail)) {
        return false
      }
      if (this.isShowPassword) {
        if (this.isEmptyValue(password)) {
          return false
        }
        if (password !== passwordConfirm) {
          return false
        }
      }
      return true
    }
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}, isNew = false) {
      let capsLock = false
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          capsLock = true
        } else {
          capsLock = false
        }
      }
      if (key === 'CapsLock' && capsLock === true) {
        capsLock = false
      }
      if (isNew) {
        this.capsTooltipNew = capsLock
      } else {
        this.capsTooltip = capsLock
      }
    },
    checkCapslockNew({ shiftKey, key } = {}, isNew = true) {
      this.checkCapslock({ shiftKey, key }, true)
    },
    showPasswordConfirm() {
      if (this.passwordConfirmType === 'password') {
        this.passwordConfirmType = ''
      } else {
        this.passwordConfirmType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.passwordConfirm.focus()
      })
    },
    handleSubmit() {
      if (this.isReadyFormSubmit) {
        this.loading = true
        const dataToSubmit = {
          name: this.enrollmentUserForm.name,
          userName: this.enrollmentUserForm.userName,
          eMail: this.enrollmentUserForm.eMail
        }
        if (this.isShowPassword) {
          dataToSubmit.password = this.enrollmentUserForm.password
        }
        requestEnrollUser(dataToSubmit)
          .then(() => {
            this.$message({
              message: this.$t('page.login.userEnrollmentSuccessful'),
              showClose: true,
              type: 'success'
            })

            this.pathRedirect()
          })
          .catch(error => {
            this.$message({
              message: error.message,
              // message: this.$t('page.login.unexpectedError'),
              showClose: true,
              type: 'error'
            })
            console.warn(`Enrollment User - Error ${error.code}: ${error.message}`)
          })
          .finally(this.loading = false)
      } else {
        console.log('error submit!!')
        return false
      }
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>
<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 10px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
