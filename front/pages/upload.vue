<template>
  <div class="upload">
    <h2>文件上传</h2>
    <div ref="drag" id="drag">
      <input type="file" @change="handleChange" />
    </div>
    <div>计算hasn进度条</div>
    <div>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="hashProgress"></el-progress>
    </div>
    <div>上传进度条</div>
    <div>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="uploadProgress"></el-progress>
    </div>
    <el-button type="primary" @click="uploadFile">上传</el-button>
    <div>切片上传进度条</div>
    <!-- chunk.progress 
      progress<0 报错 显示红色
      == 100 成功
    别的数字 方块高度显示-->
    <!-- 尽可能让方块看起来是正方形
      比如10各方块 4*4
      9 3*3
    100 10*10-->
    <div v-if="chunks" class="cube-container" :style="{width:cubeWidth+'px'}">
      <div class="cube" v-for="chunk in chunks" :key="chunk.name">
        <div
          :class="{
            'uploading':chunk.progress>0&&chunk.progress<100,
            'success':chunk.progress==100,
            'error':chunk.progress<0
          }"
          :style="{height:chunk.progress+'%'}"
        >
          <i
            class="el-icon-loading"
            style="color:#f56c6c"
            v-if="chunk.progress<100&&chunk.progress>0"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sparkMD5 from "spark-md5";
const CHUNK_SIZE = 50 * 1024;
export default {
  data() {
    return {
      file: "",
      chunks: [],
      //uploadProgress: 0
      hashProgress: 0,
      hash: ""
    };
  },
  mounted() {
    this.bindEvents();
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16;
    },
    //上传进度
    uploadProgress() {
      if (!this.file) {
        return 0;
      }
      const loaded = this.chunks
        .map(item => item.chunk.size * item.progress)
        .reduce((acc, cur) => acc + cur, 0);
      return parseInt(((loaded * 100) / this.file.size).toFixed(2));
    }
  },
  methods: {
    handleChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      this.file = file;
    },
    bindEvents() {
      const drag = this.$refs.drag;
      drag.addEventListener("dragover", e => {
        drag.style.borderColor = "red";
        e.preventDefault();
      });
      drag.addEventListener("dragleave", e => {
        drag.style.borderColor = "#ccc";
        e.preventDefault();
      });
      drag.addEventListener("drop", e => {
        const fileList = e.dataTransfer.files;
        this.file = fileList[0];
        drag.style.borderColor = "#ccc";
        e.preventDefault();
      });
    },
    //文件内容转为16进制
    async blobToString(blob) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function() {
          const ret = reader.result
            .split("")
            .map(v => v.charCodeAt()) //返回指定位置的字符的 Unicode 编码
            .map(v => v.toString(16).toUpperCase())
            .map(v => v.padStart(2, "0")) //字符串补全
            .join(" ");
          resolve(ret);
        };
        reader.readAsBinaryString(blob);
      });
    },
    //判断是否为png图片
    async isPng(file) {
      const ret = await this.blobToString(file.slice(0, 8));
      const isPng = ret == "89 50 4E 47 0D 0A 1A 0A";
      return isPng;
    },
    //判断是否为jpg图片
    async isJpg(file) {
      const len = file.size;
      const start = await this.blobToString(file.slice(0, 2));
      const tail = await this.blobToString(file.slice(-2, len));
      const isJpg = start == "FF D8" && tail == "FF D9";
      return isJpg;
    },
    //通过文件流来判断文件格式是否符合
    async isImage(file) {
      return (await this.isPng(file)) || (await this.isJpg(file));
    },
    //切片处理
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = [];
      let cur = 0;
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) });
        cur += size;
      }
      return chunks;
    },
    //webWorker计算hash
    async calculateHashWorker() {
      return new Promise(resolve => {
        const worker = new Worker("/hash.js");
        worker.postMessage({ chunks: this.chunks });
        worker.onmessage = e => {
          const { progress, hash } = e.data;
          this.hashProgress = Number(progress.toFixed(2));
          if (hash) {
            resolve(hash);
          }
        };
      });
    },
    //借鉴react的fiber架构（利用浏览器帧与帧之间的空闲时间）计算hash
    async calculateHashIdle() {
      const chunks = this.chunks;
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        let count = 0;
        const appendToSpark = async file => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = e => {
              spark.append(e.target.result);
              resolve();
            };
          });
        };
        const workLoop = async deadline => {
          //timeRemaining获取当前帧的剩余时间
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            //空闲时间，且有任务
            await appendToSpark(chunks[count].file);
            count++;
            if (count < chunks.length) {
              this.hashProgress = Number(
                ((100 * count) / chunks.length).toFixed(2)
              );
            } else {
              this.hashProgress = 100;
              resolve(spark.end());
            }
          }
          window.requestIdleCallback(workLoop);
        };

        window.requestIdleCallback(workLoop);
      });
    },
    //抽样hash，首中尾分别取一块
    async calculateHashSample() {
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        const reader = new FileReader();
        const file = this.file;
        const size = file.size;
        const offset = 2 * 1024 * 1024;
        //第一个2M，最后一个区数据块全要
        const chunks = [file.slice(0, offset)];
        let cur = offset;
        while (cur < size) {
          if (cur + offset >= size) {
            //最后一个区块
            chunks.push(file.slice(cur, cur + offset));
          } else {
            //中间区块,取前中后各2个字节
            const mid = cur + offset / 2;
            const end = cur + offset;
            chunks.push(file.slice(cur, cur + 2));
            chunks.push(file.slice(mid, mid + 2));
            chunks.push(file.slice(end - 2, end));
          }
          cur += offset;
        }
        reader.readAsArrayBuffer(new Blob(chunks));
        reader.onload = e => {
          spark.append(e.target.result);
          this.hashProgress = 100;
          resolve(spark.end());
        };
      });
    },
    //上传文件
    async uploadFile() {
      if (!this.file) {
        this.$alert("文件内容不能为空");
        return;
      }
      // if(!await this.isImage(this.file)){
      //     this.$alert("文件格式不对")
      //     return
      // }else{
      //     console.log("文件格式正确")
      // }

      const chunks = this.createFileChunk(this.file);
      // const hash1 = await this.calculateHashWorker()
      // console.log(hash1)
      // const hash2 = await this.calculateHashIdle()
      // console.log(hash2)
      const hash = await this.calculateHashSample();
      this.hash = hash;

      //断点续传，判断切片是否已存在
      const ret = await this.$http.post("/checkFile", {
        hash: this.hash,
        ext: this.file.name.split(".").pop()
      });
      const { uploaded, uploadedList } = ret.data;
      //切片上传
      this.chunks = chunks.map((chunk, index) => {
        const name = hash + "-" + index;
        return {
          hash,
          name,
          index,
          chunk: chunk.file,
          progress: uploadedList.indexOf(name) > -1 ? 100 : 0
        };
      });

      if (uploaded) {
        return this.$alert("秒传成功");
      }
      await this.uploadChunks(uploadedList);

      //文件整体上传
      // const form = new FormData()
      // form.append('name','file')
      // form.append('file',this.file)
      // this.$http.post('/uploadFile',form,{
      //   onUploadProgress:progress=>{
      //     this.uploadProgress = Number(((progress.loaded/progress.total)*100).toFixed(2))
      //   }
      // })
    },
    //上传切片
    async uploadChunks(uploadedList = []) {
      const requests = this.chunks
        .filter(chunk => uploadedList.indexOf(chunk.name) == -1)
        .map((chunk, index) => {
          const form = new FormData();
          form.append("chunk", chunk.chunk);
          form.append("hash", chunk.hash);
          form.append("name", chunk.name);
          return { form, index: chunk.index, error: 0 };
        });
      // .map(({form,index})=>
      //   this.$http.post('/uploadFile',form,{
      //     onUploadProgress:progress=>{
      //       //每个区块有自己的进度条，整体的进度条需要计算
      //       this.chunks[index].progress = Number(((progress.loaded/progress.total)*100).toFixed(2))
      //     }
      //   }))
      //发起批量请求
      //await Promise.all(requests)
      //批量请求过多，可能会造成页面假死、阻塞，每次只同时发起固定次数请求，一个切片重试失败三次，整体全部终止
      await this.sendRequest(requests);
      await this.mergeRequest();
    },
    async sendRequest(chunks) {
      return new Promise((resolve, reject) => {
        const len = chunks.length;
        let limit = len > 4 ? 4 : len;
        let counter = 0;
        let isStop = false;
        const start = async () => {
          if (isStop) return;
          const task = chunks.shift();
          if (task) {
            const { form, index } = task;
            try {
              await this.$http.post("/uploadFile", form, {
                onUploadProgress: progress => {
                  this.chunks[index].progress = (
                    (progress.loaded / progress.total) *
                    100
                  ).toFixed(2);
                }
              });
              if (counter == len - 1) {
                resolve();
              } else {
                counter++;
                //启动下一个任务
                start();
              }
            } catch (e) {
              this.chunks[index].progress = -1;
              if (task.error < 3) {
                task.error++;
                chunks.unshift(task);
                start();
              } else {
                //错误三次
                isStop = true;
                reject();
              }
            }
          }
        };
        while (limit > 0) {
          //启动limit个任务
          //模拟下延迟任务
          setTimeout(() => {
            start();
          }, Math.random() * 2000);
          limit -= 1;
        }
      });
    },
    async mergeRequest() {
      const ret = await this.$http.post("/mergeFile", {
        ext: this.file.name.split(".").pop(),
        size: CHUNK_SIZE,
        hash: this.hash
      });
    }
  }
};
</script>

<style lang="stylus">
#drag
  height 100px
  line-height 100px
  border 2px dashed #eee
  text-align center
.cube-container 
  .cube 
    width 14px
    height 14px
    line-height 12px
    border 1px solid #000
    background #eee
    float left
    .success 
      background green
    .uploading 
      background blue
    .error
      background red
</style>