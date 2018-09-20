<template>
  <div class="uploader">
    <slot :files="files" :file-list="fileList" :started="started">
      <uploader-unsupport></uploader-unsupport>
      <uploader-drop>
        <uploader-btn style="float: right">资料上传</uploader-btn>
        <slot name="template"></slot>
      </uploader-drop>
      <div class="uploader-file-info">
        <slot name="head"></slot>
      </div>
      <div class="uploader-list">
        <slot name="oldFileList"></slot>
      </div>
      <uploader-list></uploader-list>
    </slot>
  </div>
</template>

<script>
  import Uploader from 'simple-uploader.js'
  import { kebabCase } from '../common/utils'
  import UploaderBtn from './btn.vue'
  import UploaderDrop from './drop.vue'
  import UploaderUnsupport from './unsupport.vue'
  import UploaderList from './list.vue'
  import UploaderFiles from './files.vue'
  import UploaderFile from './file.vue'

  const COMPONENT_NAME = 'uploader'
  const FILES_ADDED_EVENT = 'filesAdded'
  const FILE_ADDED_EVENT = 'fileAdded'
  const EXAM_BEFORE_UPLOAD_EVENT = 'examBeforeUpload'
  const EXAM_SUCCESS_EVENT = 'examSuccess'
  const EXAM_ERROR_EVENT = 'examError'
  const EXAM_REMOVE_EVENT = 'examRemove'
  const FILE_REMOVE_EVENT = 'fileRemove'
  const FILE_MERGED_EVENT = 'fileMerged'
  const UPLOAD_START_EVENT = 'uploadStart'

  export default {
    name: COMPONENT_NAME,
    provide () {
      return {
        uploader: this
      }
    },
    props: {
      options: {
        type: Object,
        default () {
          return {}
        }
      },
      autoStart: {
        type: Boolean,
        default: true
      },
      fileStatusText: {
        type: Object,
        default () {
          return {
            success: 'success',
            error: 'error',
            uploading: 'uploading',
            paused: 'paused',
            waiting: 'waiting'
          }
        }
      }
    },
    data () {
      return {
        started: false,
        files: [],
        fileList: []
      }
    },
    methods: {
      uploadStart () {
        this.started = true
      },
      fileAdded (file) {
        this.$emit(kebabCase(FILE_ADDED_EVENT), file)
        if (file.ignored) {
          // is ignored, filter it
          return false
        }
      },
      filesAdded (files, fileList) {
        this.$emit(kebabCase(FILES_ADDED_EVENT), files, fileList)
        if (files.ignored || fileList.ignored) {
          // is ignored, filter it
          return false
        }
      },
      fileRemoved (file) {
        this.files = this.uploader.files
        this.fileList = this.uploader.fileList
        this.$emit(kebabCase(FILE_REMOVE_EVENT), file)
      },
      filesSubmitted (files, fileList) {
        this.files = this.uploader.files
        this.fileList = this.uploader.fileList
        if (this.autoStart) {
          this.uploader.upload()
        }
      },
      fileMerged (file, com) {
        this.$emit(kebabCase(FILE_MERGED_EVENT), file, com)
      },
      examBeforeUpload () {
        this.$emit(kebabCase(EXAM_BEFORE_UPLOAD_EVENT))
      },
      examSuccess (res, com) {
        this.$emit(kebabCase(EXAM_SUCCESS_EVENT), res, com)
      },
      examError () {
        this.$emit(kebabCase(EXAM_ERROR_EVENT))
      },
      examRemove (com, e) {
        this.$emit(kebabCase(EXAM_REMOVE_EVENT), com, e)
      },
      allEvent (...args) {
        const name = args[0]
        const EVENTSMAP = {
          [FILE_ADDED_EVENT]: true,
          [FILES_ADDED_EVENT]: true,
          [FILE_MERGED_EVENT]: true,
          [FILE_REMOVE_EVENT]: true,
          [EXAM_BEFORE_UPLOAD_EVENT]: true,
          [EXAM_SUCCESS_EVENT]: true,
          [EXAM_ERROR_EVENT]: true,
          [EXAM_REMOVE_EVENT]: true,
          [UPLOAD_START_EVENT]: 'uploadStart'
        }
        const handler = EVENTSMAP[name]
        if (handler) {
          if (handler === true) {
            return
          }
          this[handler].apply(this, args.slice(1))
        }
        args[0] = kebabCase(name)
        this.$emit.apply(this, args)
      }
    },
    created () {
      this.options.initialPaused = !this.autoStart
      const uploader = new Uploader(this.options)
      this.uploader = uploader
      this.uploader.fileStatusText = this.fileStatusText
      uploader.on('catchAll', this.allEvent)
      uploader.on(FILE_ADDED_EVENT, this.fileAdded)
      uploader.on(FILES_ADDED_EVENT, this.filesAdded)
      uploader.on('fileRemoved', this.fileRemoved)
      uploader.on('filesSubmitted', this.filesSubmitted)
    },
    destroyed () {
      const uploader = this.uploader
      uploader.off('catchAll', this.allEvent)
      uploader.off(FILE_ADDED_EVENT, this.fileAdded)
      uploader.off(FILES_ADDED_EVENT, this.filesAdded)
      uploader.off('fileRemoved', this.fileRemoved)
      uploader.off('filesSubmitted', this.filesSubmitted)
      this.uploader = null
    },
    components: {
      UploaderBtn,
      UploaderDrop,
      UploaderUnsupport,
      UploaderList,
      UploaderFiles,
      UploaderFile
    }
  }
</script>

<style>
  .uploader {
    position: relative;
  }
</style>
