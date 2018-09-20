<template>
  <uploader :options="options" :auto-start="autoStart" :file-status-text="statusText" class="uploader-example" ref="uploader"
            @file-merged="fileMerged" @file-added="fileAdded" @files-added="filesAdded" @file-complete="fileComplete" @file-remove="fileRemove"
            @file-success="fileSuccess" @file-error="fileError" @complete="complete" @exam-success="examSuccess">
    <!--<uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <uploader-btn style="float: right">资料上传</uploader-btn>
      <Button type="primary" :style="{verticalAlign: 'top',margin: '0 10px', float: 'right'}"
              @click.native="">
        下载模板
      </Button>
    </uploader-drop>
    <uploader-list class="uploader-list">
      <ul>
        <li v-for="file in fileList" :key="file.id">
          <div class="uploader-file">
              <div class="uploader-file-info">
                <div class="uploader-file-name"><i class="uploader-file-icon"></i>{{file.name}}</div>
                <div class="uploader-file-size">{{file.formatedSize}}</div>
                <div class="uploader-file-meta demo-upload-list-cover">
                  <Icon type="ios-trash-outline" size="20" />
                </div>
                <Upload class="uploader-file-meta"
                        :action="options.action"
                        style="display: block; width: 30px; margin-top: 10px; margin-left: -30px">
                  <div>
                    <Icon type="android-add" size="20"></Icon>
                  </div>
                </Upload>
                <div class="uploader-file-actions">
                  <span class="uploader-file-remove"></span>
                </div>
              </div>
            </slot>
          </div>
        </li>
      </ul>
    </uploader-list>-->
    <Button type="primary" :style="{verticalAlign: 'top',margin: '0 10px',float: 'right'}"
            @click.native="downloadTemplate" slot="template">
      下载模板
    </Button>

    <div slot="head" style="height:50px;font-size: 13px; padding-top: 15px; background-color: #D2E0E6; box-shadow: 0 0 10px rgba(0, 0, 0, .4); border:1px solid #fff5d4">
      <div class="uploader-file-name" style="padding-left: 30px"><span>文件名</span></div>
      <div class="uploader-file-size">文件大小</div>
      <div class="uploader-file-meta" style="width: 30px">
        <span style="font-size: 13px">随堂</span>
      </div>
      <div class="uploader-file-status">
        <span style="">上传状态</span>
      </div>
      <div style="width: 10%; float: left; position: relative; height: 100%;">
        <span>操作按钮</span>
      </div>
    </div>
    <ul slot="oldFileList">
      <li v-for="(file, index) in fileList" :key="index">
        <div class="uploader-file">
            <div class="uploader-file-progress"></div>
            <div class="uploader-file-info">
              <div class="uploader-file-name"><Icon :type="fileCategory(file)" size="30" style="position: absolute; margin-top:7px; margin-left: -20px; height: 40px;"></Icon><span style="margin-left: 30px">{{file.name}}</span></div>
              <div class="uploader-file-size">{{file.formatedSize}}</div>
              <div class="uploader-file-meta demo-upload-list-cover">
                <Icon type="ios-trash-outline" size="20" @click.native="removeOldExam(file)"/>
              </div>
              <Upload class="uploader-file-meta"
                      ref="oldUpload"
                      type="drag"
                      :action="options.action"
                      :headers="options.headers"
                      :data="{'uuid': file.uniqueIdentifier}"
                      :format="['xls','xlsx']"
                      :on-format-error="handleFormatErr"
                      :on-success="handleSuccess"
                      :on-error="handleError"
                      style="display: block; width: 30px; margin-top: 10px; margin-left: -30px">
                <div :class="classes(file)">
                  <Icon type="android-add" size="20"></Icon>
                </div>
              </Upload>
              <div class="uploader-file-status">
              </div>
              <div class="uploader-file-actions">
                <span class="uploader-file-remove" @click="delOldFile(index)"></span>
              </div>
            </div>
        </div>
      </li>
    </ul>
  </uploader>
</template>

<script>
  import Vue from 'vue'
  import axios from 'axios'
  import VueAxios from 'vue-axios'
  import qs from 'qs'

  const prefixCls = 'demo-upload-list'

  Vue.use(VueAxios, axios)
  export default {
    data () {
      return {
        options: {
          target: '/web/uploads/fileSegmentUpload',
          headers: {
            Authorization: sessionStorage.getItem('token')
          },
          action: '/web/trains/bulkImportQuestions',
          exData: {},
          supportType: ['pdf', 'jpg', 'jpeg', 'png', 'bmp', 'mp4', 'avi', 'rmvb', 'wmv', 'mkv', 'mpg', 'mov', 'swf'],
          categoryMap: {
            image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
            video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
            audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
            document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
          },
          oldFiles: []
        },
        attrs: {
          accept: 'image/*'
        },
        autoStart: true,
        statusText: {
          success: '上传完成,处理中',
          error: '出错了',
          uploading: '上传中',
          paused: '暂停中',
          waiting: '等待中',
          merged: '上传成功'
        },
        fileList: []
      }
    },
    methods: {
      removeOldExam (file) {
        file.extends = 'none'
      },
      handleSuccess (res, file, list) {
        let uuid = ''
        for (var key in res.resultData) {
          uuid = key
        }
        this.fileList.forEach( file => {
          if (file.uniqueIdentifier === uuid) {
            file.extends = 'ready'
          }
        })
      },
      handleError () {
        this.$Message.error('添加随堂练习失败,请重新操作!')
      },
      handleFormatErr () {
        this.$Message.error('仅支持Excel表格导入!')
      },
      delOldFile (index) {
        this.fileList.splice(index, 1)
        this.options.oldFiles = this.fileList
      },
      fileMerged (file, com) {
        this.axios.post('/web/uploads/mergeFile', qs.stringify({
         identifier: file.uniqueIdentifier,
         fileName: file.name,
         totalChunks: file.chunks.length
         })).then(res => {
           if (res.data.resultData === false) {
             com._fileError()
           } else {
             com.isMerged = true
           }
         }).catch(err => {
           //console.log('err',err);
         })
      },
      fileTransed(file) {
      },
      fileAdded (file) {
      },
      filesAdded (files, fileList) {

      },
      fileRemove (file) {
      },
      complete () {
      },
      fileComplete (rootFile) {
        /*rootFile.isMerged = true*/
      },
      fileSuccess (rootFile, file, message, chunk) {

      },
      examSuccess (res, com) {
        com.extends = 'ready'
      },
      fileError (rootFile, file, message, chunk) {
        //console.log(file.uploader)
        //console.log(file.status)
        //this.file.uploader.file.isTransed = true
        //file.isTransed = true
        //console.log(file)
        //file.isTransed = true
      },
      threadPoxi(){  // 实际调用的方法
        //参数
        const agentData = "mymessage";
        //若是ws开启状态
        if (this.websock.readyState === this.websock.OPEN) {
          this.websocketsend(agentData)
        }
        // 若是 正在开启状态，则等待300毫秒
        else if (this.websock.readyState === this.websock.CONNECTING) {
          let that = this;//保存当前对象this
          setTimeout(function () {
            that.websocketsend(agentData)
          }, 300)
        }
        // 若未开启 ，则等待500毫秒
        else {
          this.initWebSocket()
          let that = this;//保存当前对象this
          setTimeout(function () {
            that.websocketsend(agentData)
          }, 500)
        }
      },
      initWebSocket(){ //初始化weosocket
        //ws地址
        const wsuri = 'ws://magicpoloassassin:8847/websocket/threadsocket'
        this.websock = new WebSocket(wsuri)
        this.websock.onmessage = this.websocketonmessage
        this.websock.onclose = this.websocketclose
      },
      websocketonmessage(e){ //数据接收
        const redata = JSON.parse(e.data)
        console.log(redata.value)
      },
      websocketsend(agentData){//数据发送
        this.websock.send(agentData)
      },
      websocketclose(e){  //关闭
        console.log("connection closed (" + e.code + ")")
      },
      getUUID() {
        return '123'
      }
    },
    computed: {
      classes () {
        return function (file) {
          return [
            `${prefixCls}`,
            {
              [`${prefixCls}-error`]: file.extends === 'none',
              [`${prefixCls}-success`]: file.extends === 'ready'
            }
          ]
        }
      },
      fileCategory () {
        return function  (file) {
          let type = ''
          const extension = file.extension
          const categoryMap = this.options.categoryMap
          const typeMap = categoryMap || {
              image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
              video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
              audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
              document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
            }
          Object.keys(typeMap).forEach((_type) => {
            const extensions = typeMap[_type]
            if (extensions.indexOf(extension) > -1) {
              if (_type === 'image'){
                type = 'image'
              } else if (_type === 'video' || _type === 'audio') {
                type = 'social-youtube'
              } else {
                type = 'android-document'
              }
            }
          })
          return type
        }
      }
    },
    created () {
      let testFile = {
        aborted: false,
        allError: false,
        isFolder: false,
        isRoot: false,
        file: {},
        list: true,
        isMerged: 'true',
        name: '123.mp4',
        paused: false,
        relativePath: "Desert.jpg",
        error: false,
        averageSpeed: 0,
        formatedAverageSpeed: '',
        currentSpeed: 0,
        isComplete: true,
        isUploading: false,
        size: 1000,
        uniqueIdentifier: "ba45c8f60456a672e003a875e469d0eb",
        formatedSize: 100,
        uploadedSize: 1000,
        progress: 1,
        progressStyle: '',
        progressingClass: '',
        timeRemaining: 0,
        formatedTimeRemaining: 0,
        fileType: 'video/mp4',
        id: 1,
        extension: 'mp4',
        extends: 'none',
        fileCategory: this.options.categoryMap
      }
      var fileList = new Array(1)
      fileList[0] = testFile
      this.fileList = fileList
      this.options.oldFiles = this.fileList
    },
    mounted () {
      this.options.exData.uuid = this.getUUID()
      this.$nextTick(() => {
        window.uploader = this.$refs.uploader.uploader
        // window.uploader.oldFiles = this.fileList
      })
    }
  }
</script>

<style>
  .uploader-example {
    width: 880px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  }
  .uploader-example .uploader-btn {
    margin-right: 4px;
  }
  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .uploader-file {
    position: relative;
    height: 49px;
    line-height: 49px;
    overflow: hidden;
    border-bottom: 1px solid #cdcdcd;
  }
  .uploader-file-progress {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #e2eeff;
    transform: translateX(0%);
  }
  .uploader-file-info {
    position: relative;
    z-index: 1;
    height: 100%;
    overflow: hidden;
  }
  .uploader-file-info:hover {
    background-color: rgba(240, 240, 240, 0.2);
  }
  .uploader-file-info i,
  .uploader-file-info em {
    font-style: normal;
  }
  .uploader-file-name,
  .uploader-file-size,
  .uploader-file-meta,
  .uploader-file-status,
  .uploader-file-actions {
    float: left;
    position: relative;
    height: 100%;
  }
  .uploader-file-name {
    width: 45%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-indent: 14px;
  }
  .uploader-file-icon {
    width: 24px;
    height: 24px;
    display: inline-block;
    vertical-align: top;
    margin-top: 13px;
    margin-right: 8px;
  }
  .uploader-file-icon::before {
    content: "📃";
    display: block;
    height: 100%;
    font-size: 24px;
    line-height: 1;
    text-indent: 0;
  }
  .uploader-file-icon[icon="folder"]::before {
    content: "📂";
  }
  .uploader-file-icon[icon="image"]::before {
    content: "<Icon type="images"></Icon>";
  }
  .uploader-file-icon[icon="video"]::before {
    content: "<Icon type="images"></Icon>";
  }
  .uploader-file-icon[icon="audio"]::before {
    content: "🎵";
  }
  .uploader-file-icon[icon="document"]::before {
    content: "📋";
  }
  .uploader-file-size {
    width: 13%;
    text-indent: 10px;
  }
  .uploader-file-meta {
    width: 8%;
  }
  .uploader-file-status {
    width: 24%;
    text-indent: 20px;
  }
  .uploader-file-actions {
    width: 10%;
  }
  .uploader-file-actions > span {
    display: none;
    float: left;
    width: 16px;
    height: 16px;
    margin-top: 16px;
    margin-right: 10px;
    cursor: pointer;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABkCAYAAAD0ZHJ6AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAARkSURBVGje7ZnfS1NRHMAH4ptPkvQSuAdBkCxD8FUQJMEULUgzy1KyyPVQ4JMiiP4Bvg6EwUQQfMmwhwRDshwaKUjDVCgoSdDNHkzTJZ6+Z37Purve8+PeTb2TM/ggu+ew89l33x8H9BBCPG7GowXTJej3+wnDvEm0JuLC04+EYWftVAUv+fiCvDUdQR1BHUEdQR3BTIygvixoQS14XgTtthLVdpNWwXRLqvQ724LplFRtyrYF0yVpFLQrKRVMh6RZ0I6kkmCqklaCqpKZH0FX56Crq9jVfdDVk0RfFrSgFsxkQVmLcdKCVrKySCrryhPEyYShhzOcrFtG0EoilfHHk1CRU5rF6ZjNZhlVOW6RnMSVyyilKies4pO41diVy8wIujoHXV3FGdMHXTtJKLFYTLhZtq4vC1rwXApCZTIqgR6g1PBMCO9DL3bMMSqBHqDU8EyISDAHiGKvWwcCQG2KgjlAFCDAOhAAap0K5gKLphk8mqJgLrCIgoxRJ4J5wKpJ7gAoMkn5EBXBPGDVJHcAFJmkfIhQcAql1oBpTvTol9gG9pm4RHAKpdaAaU706JfYBvaZuJVgPQrt4sFlnOh5MC/p3lmJYD0K7eLBZZzoeTAv6d5ZnuAYHjpgEOnk5F0ufhG6v1ggOIaHDhhEOjl5l4tfhO4vthLcwAMrFNvLJO5vEwhu4IEViu1lEve3WQmyoihQFBzG/V0CQVYUBYqCw7i/SxTBcpsRbFeIYLnNCLZbCY5b5KAnxRwct8hBj9McZFVMW0ihRNBuFdMWUigRlFaxuQ9WWYjRMTiIe5z0wSoLMToGB3GPsA9aTZIJoB+nRgBnM1tzOkkmgH6cGgGczWzNpzqLx3n/aULJJgezeNw07oxQySbVywKjBOgFRnDs+VEsx8FlgVEC9AIjOPb8KJYjvSzoG7UW1IJaUAtqQS14toLNM5fN5APdwBJA8G83Pk/aK/rgzVvXzeQD3cASQPBvNz5P2ssTzAaGUIrHEO6zI5gNDKEUjyHcxxWkh4Ylcowwk1QQpIeGJXKMMJO0EgwqyjGCioJBJvDrxRMSuVOTJEXfbz1/bHwWtBL0yoQehK6RucgE+bGzanzulQh6E3IgQV+xpc8kcrfuSO7eTfJ3ZYmQw0Oy9azVKOk1C/bJ5D5F38YPeLfx0rjWJxHsS0SqsSYuxySjj5qO5Oj7xQWy2VBtFOwzCy6ryH3YfE3uh64Y1xckgstJPydEjkkeHv07Iy4Xaao15+KCWTBx6M/db+T9xivSErqaJDdzXI6yLRE8Vgg0coex/SPJvT0SbWu0KpZtbgSpCH3NRt7I5OxHkObc6heU+/M/J5vrpBFM5GBLqCQux14COXs5CNXK5OjPGm1tSMrJSOMNYQ4mVTGV/L6zTL7+DovkbFUxbSW0Wo05l8hJWsU+cRWfSh+Mt5Lb1ck/J1TvVsdDaR/MiEni+llsdZuZp62EViu+96bpNjNPWwmtVnzvFd5m9IVVC54x/wA7gNvqFG9vXQAAAABJRU5ErkJggg==") no-repeat 0 0;
  }
  .uploader-file-actions > span:hover {
    background-position-x: -21px;
  }
  .uploader-file-actions .uploader-file-pause {
    background-position-y: 0;
  }
  .uploader-file-actions .uploader-file-resume {
    background-position-y: -17px;
  }
  .uploader-file-actions .uploader-file-retry {
    background-position-y: -53px;
  }
  .uploader-file-actions .uploader-file-remove {
    display: block;
    background-position-y: -34px;
  }


  .demo-upload-list-cover {
    z-index: -1;
    width: 28px;
    height: 30px;
    line-height: 30px;
    background: #909090;
    margin-top: 11px;
    left: -1px;
    border-style: none;
  }
  .uploader-file-info:hover .demo-upload-list-cover {
    z-index: 5;
  }
  .demo-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
  .demo-upload-list {
    width: 30px;
    height: 35px;
    position: relative;
    margin-top: -5px;
  }
  .demo-upload-list-error {
    z-index: 10;
    background: #e2eeff;
  }
  .demo-upload-list-success {
    background: #2ebda1;
  }
  .uploader-list {
    position: relative;
  }
  .uploader-list > ul {
    list-style: none;
    margin: 0;
    padding: 0
  }
</style>
