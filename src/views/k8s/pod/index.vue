<template>

  <el-card class="box-card">
    <div class="filter-container">
      <el-select v-model="queryParams.nameSpace" placeholder="命名空间" class="filter-item" filterable  @change="handleNamespaceChange">
        <el-option
          v-for="ns in namespaces"
          :key="ns"
          :label="ns"
          :value="ns"
        />
      </el-select>
      <el-input
        v-model="queryParams.podName"
        placeholder="Pod名称"
        class="filter-item"
        style="width: 200px;"
        clearable
        @keyup.enter.native="fetchData"
      />
      <el-button class="filter-item" type="primary" @click="fetchData">
        查询
      </el-button>
    </div>
    <el-dialog
  :title="`编辑 Pod - ${currentPod.name}`"
  :visible.sync="yamlDialogVisible"
  width="80%"
  :fullscreen="true"
  top="5vh"
  custom-class="yaml-dialog">
  <monaco-editor
    ref="yamlEditor"
    v-model="podYaml"
    language="yaml"
    theme="vs-dark"
    :options="{
      minimap: { enabled: true },
      fontSize: 13,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 0,
      insertSpaces: true,
      autoClosingBrackets: 'always',
      formatOnType: true,
      glyphMargin: true,
      lightbulb: { enabled: true },
      renderIndentGuides: true,
      scrollbar: { vertical: 'auto' },
      wordWrap: 'on'
    }"
    style="height: 75vh; border-radius: 4px; border: 1px solid #434343;"
  />
  <div slot="footer" class="dialog-footer">
    <el-button @click="yamlDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleUpdateYaml">保存</el-button>
  </div>
</el-dialog>
        <!-- 节点列表 -->
        <el-dialog
      :title="`Pod终端 - ${currentPod.podName}`"
      :visible.sync="terminalVisible"
      :before-close="handleCloseTerminal"
      width="80%"
      :fullscreen="true"
      custom-class="terminal-dialog"
    >
      <terminal-exec
        v-if="terminalVisible"
        :namespace="currentPod.nameSpace"
        :pod-name="currentPod.podName"
        @close="terminalVisible = false"
      />
    </el-dialog>
    <el-dialog
  :title="`Pod日志 - ${currentLogPod.podName}`"
  :visible.sync="logDialogVisible"
  width="80%"
  :fullscreen="true"
  custom-class="log-dialog">
  <div class="log-container">
    <el-input
      type="textarea"
      :autosize="{ minRows: 20 }"
      v-model="logContent"
      readonly
      resize="none"
      class="log-content"
    />
  </div>
  <div slot="footer" class="dialog-footer">
    <el-button @click="logDialogVisible = false">关闭</el-button>
  </div>
</el-dialog>
    <el-card shadow="hover" class="mt-20 info-card">
      <div slot="header" class="sub-header">
        <i class="el-icon-cpu"></i> pod列表
        <span class="sub-title-count">({{ pods.length || 0 }})</span>
      </div>
      
      <el-table 
        :data="pods" 
        border 
        stripe
        style="width: 100%">
        <el-table-column prop="name" label="名称" width="180"  />  
        <el-table-column prop="namespace" label="命名空间" width="180"  />  
        <el-table-column prop="images" label="镜像" min-width="30" show-overflow-tooltip />   
          <!-- <el-table-column label="标签" min-width="50" show-overflow-tooltip>
            <template slot-scope="{ row, $index }">
              <div class="tag-container">
                <template v-if="Object.keys(row.labels || {}).length > 0">              
                  <div 
                    v-for="(value, key, index) in row.labels"
                    :key="key"
                    v-if="index < 3 || row.labelsExpanded"
                    class="tag-item-wrapper"
                  >
                    <el-tag
                      type="primary"
                      size="mini"
                      class="tag-item"
                    >
                      {{ key }}: {{ value }}
                    </el-tag>
                  </div>
                </template>
                <span v-else class="muted-text">无标签</span>
              </div>
              <div v-if="Object.keys(row.labels || {}).length > 3" class="fold-hint">
                <el-button type="text" size="mini" @click="toggleLabels($index)">
                  {{ row.labelsExpanded ? '收起' : `展开(${Object.keys(row.labels).length - 3}个)` }}
                  <i :class="row.labelsExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                </el-button>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column prop="restart" label="restart" width="120" /> 
          <el-table-column prop="containersState" label="ready" width="120" /> 

          <!-- 合并CPU相关列 -->
          <el-table-column label="CPU使用情况" width="220">
            <template slot-scope="{ row }">
              <div class="metric-container">
                <div class="metric-item">
                  <span class="metric-label">使用率：</span>
                  <el-progress 
                    :percentage="(row.metric && row.metric.cpuRequestRate) || 0" 
                    color="#409EFF"
                    :show-text="false"
                    stroke-width="12"
                  />
                  <span class="metric-value">{{ (row.metric && row.metric.cpuRequestRate) || 0 }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">限制率：</span>
                  <el-progress 
                    :percentage="(row.metric && row.metric.cpuLimitRate) || 0" 
                    status="warning"
                    :show-text="false"
                    stroke-width="12"
                  />
                  <span class="metric-value">{{ (row.metric && row.metric.cpuLimitRate) || 0 }}%</span>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="内存使用情况" width="220">
            <template slot-scope="{ row }">
              <div class="metric-container">
                <div class="metric-item">
                  <span class="metric-label">使用率：</span>
                  <el-progress 
                    :percentage="(row.metric && row.metric.memoryReuqestRate) || 0" 
                    color="#67C23A"
                    :show-text="false"
                    stroke-width="12"
                  />
                  <span class="metric-value">{{ (row.metric && row.metric.memoryReuqestRate) || 0 }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">限制率：</span>
                  <el-progress 
                    :percentage="(row.metric && row.metric.memoryLimitRate) || 0" 
                    status="warning"
                    :show-text="false"
                    stroke-width="12"
                  />
                  <span class="metric-value">{{ (row.metric && row.metric.memoryLimitRate) || 0 }}%</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template slot-scope="{ row }">
            <span class="mat-button-wrapper">
              <el-tooltip :content="row.status === 'Running' ? '查看日志' : 'Pod未运行'" placement="top">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-document"
                  :disabled="row.status !== 'Running'"
                  @click="handleViewLogs(row)"
                />
              </el-tooltip>
              <el-tooltip content='编辑' placement="top">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  @click="handleEdit(row)"
                />
              </el-tooltip>
              <el-tooltip :content="row.status === 'Running' ? '终端' : 'Pod未运行'" placement="top">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-monitor"
                  :disabled="row.status !== 'Running'"
                  @click="handleExec(row)"
                />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  @click="handleDelete(row)"
                />
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-card>
</template>
<script>
import { listPod, getPodMetrics, getNamespaces,deletePod } from '@/api/k8s'  // 添加 listNamespace 导入
import { createWebSocket} from '@/api/log' 
import TerminalExec from '@/views/terminal/exec.vue'
import yaml from 'js-yaml'
import MonacoEditor from 'vue-monaco'
export default {
  components: {
    TerminalExec,
    MonacoEditor
  },
data() {
  return {
    listLoading: false,
    pods: [],
    labels: {},
    labelsFolded: true,
    namespaces: [],
    queryParams: {
      nameSpace: localStorage.getItem('lastNamespace') || 'default',
      podName: ''
    },
    // 添加 currentPod 属性
    currentPod: {},
    terminalVisible: false,
    yamlDialogVisible: false,
    podYaml: '',
    // 添加日志相关属性
    logDialogVisible: false,
    logContent: '',
    currentLogPod: {
      namespace: '',
      podName: ''
    },
  }
},
async mounted() {
this.getNamespaces()
this.fetchData()
},
// 添加 watch 监听

  watch: {
  logDialogVisible(newVal) {
    // 只在弹窗关闭时断开连接
    if (!newVal && this.ws) {
      this.ws.disconnect()
      this.logContent = ''
    }
  }
},
methods: {
toggleLabels(index) {
  // 使用 Vue.set 确保响应式更新
  if (!this.pods[index].labelsExpanded) {
    this.$set(this.pods[index], 'labelsExpanded', true);
  } else {
    this.$set(this.pods[index], 'labelsExpanded', false);
  }
},
handleNamespaceChange() {
      this.fetchData()
    },
async getNamespaces() {
  try {
    const res = await getNamespaces()
    console.log('原始返回数据:', res) // 查看完整返回数据
    
    if (!res) {
      console.warn('接口返回为空')
      this.namespaces = ['kube-system']
      return
    }

    if (res.items && Array.isArray(res.items)) {
      this.namespaces = res.items.map(item => item.metadata.name)
    } else if (Array.isArray(res)) {
      this.namespaces = res
    } else if (res.namespaces && Array.isArray(res.namespaces)) {
      this.namespaces = res.namespaces
    } else {
      console.warn('无法解析的数据格式:', res)
      this.namespaces = ['default']
    }
    
    console.log('处理后的命名空间列表:', this.namespaces)
  } catch (error) {
    console.error('获取命名空间列表失败:', error)
    this.namespaces = ['default']
  }
},

async fetchData() {
  this.listLoading = true
  try {
    localStorage.setItem('lastNamespace', this.queryParams.nameSpace)
    const { data } = await listPod({
      nameSpace: this.queryParams.nameSpace,
      podName: this.queryParams.podName
    })
    if (data.errorCode) {
      this.$message.error(data.errorMessage || '获取数据失败')
      return
    }
    
    // 初始化基础数据
    this.pods = (data.pods || []).map(pod => ({
      ...pod,
      labelsExpanded: false,
      metric: undefined  // 初始化为 undefined，表示数据未加载
    }))
    
    // 逐个获取指标数据
    this.pods.forEach(async (pod, index) => {
      try {
        const metricRes = await getPodMetrics({
          nameSpace: pod.namespace,
          podName: pod.name
        })
        if (metricRes.data && !metricRes.data.errorCode) {
          this.$set(this.pods[index], 'metric', metricRes.data.metric || {})
        }
      } catch (error) {
        console.error(`获取 ${pod.name} 指标失败:`, error)
        this.$set(this.pods[index], 'metric', {})  // 失败时设置为空对象
      }
    })
    
  } catch (error) {
    this.$message.error('请求异常：' + error.message)
  } finally {
    this.listLoading = false
  }
},
    handleExec(row) {
      console.log('跳转到终端页面:', row.namespace, row.name);
      this.$router.push({
        path: '/terminal/exec',
        query: {
          namespace: row.namespace,
          podName: row.name
        }
      });
    },
    
    // 添加关闭终端的处理方法
    handleCloseTerminal(done) {
      this.$confirm('确认关闭终端？')
        .then(() => {
          this.currentPod = {}
          done()
        })
        .catch(() => {})
    },
    handleViewLogs(row) {
      console.log('查看日志:', row.namespace, row.name);
  this.currentLogPod = {
    namespace: row.namespace,
    podName: row.name
  }
  this.logContent = '' // 清空旧日志
  
  // 先显示弹窗，不等待WebSocket连接
  this.logDialogVisible = true
  this.logContent = `正在连接 ${row.name} 日志...\n\n`
  
  this.ws = createWebSocket({
    url: `/execute/podlogs?namespace=${row.namespace}&podName=${row.name}`,
    onOpen: () => {
      this.logContent = `=== 开始接收 ${row.name} 日志 ===\n\n`
    },
    onMessage: (data) => {
      this.logContent += data
      // 自动滚动到底部
      this.$nextTick(() => {
        const textarea = document.querySelector('.log-content textarea')
        if (textarea) {
          textarea.scrollTop = textarea.scrollHeight
        }
      })
    },
    onError: (err) => {
      this.$notify.error({ title: '连接异常', message: err.message })
      this.logContent += `\n\n连接异常: ${err.message}\n`
    },
    onClose: () => {
      this.logContent += '\n\n=== 日志连接已关闭 ==='
    }
  })
},
    handleEdit(row) {
      try {
    this.currentPod = row
    this.yamlDialogVisible = true
    // 将对象转换为 YAML 格式
    this.podYaml =yaml.dump(JSON.parse(row.yaml))
    console.log('YAML 格式:', this.podYaml)
  } catch (error) {
    this.$message.error('转换 YAML 失败：' + error.message)
  }
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该 Pod, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // TODO: 调用删除 API
          deletePod({
            namespace: row.namespace,
            podName: row.name
          }) 
          this.$message.success('删除成功')
          this.fetchData() // 刷新列表
        } catch (error) {
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async handleUpdateYaml() {
    try {
      // 验证 YAML 格式
      const yamlObj = yaml.load(this.podYaml)
      
      // TODO: 调用更新接口
      // await updatePodYaml(yamlObj)
      
      this.$message.success('配置更新成功')
      this.yamlDialogVisible = false
      this.fetchData() // 刷新列表
    } catch (error) {
      this.$message.error(`YAML 格式错误: ${error.message}`)
      const editor = this.$refs.yamlEditor.getEditor()
      const marker = {
        severity: monaco.MarkerSeverity.Error,
        message: error.message,
        startLineNumber: error.mark.line + 1,
        startColumn: error.mark.column + 1,
        endLineNumber: error.mark.line + 1,
        endColumn: error.mark.column + 2
      }
      monaco.editor.setModelMarkers(editor.getModel(), 'yaml', [marker])
    }
  }
}
}
</script>

<style scoped>
.box-card {
margin: 20px;
}
.fr {
float: right;
}
.mt-20 {
margin-top: 20px;
}
.info-card {
margin-bottom: 0;
}
.sub-header {
font-size: 16px;
font-weight: bold;
color: #303133;
display: flex;
align-items: center;
}
.sub-header i {
margin-right: 8px;
font-size: 18px;
}
.sub-title-count {
margin-left: 8px;
font-size: 14px;
color: #909399;
font-weight: normal;
}
.info-item {
display: flex;
margin-bottom: 15px;
align-items: center;
}
.info-item .label {
font-weight: bold;
width: 100px;
color: #606266;
}
.info-item .value {
flex: 1;
color: #303133;
}
.label-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.filter-container {
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}

.filter-item {
  margin-right: 10px;
}
.tag-container {
  display: flex;
  flex-direction: column; /* 改为垂直布局 */
  gap: 5px;
}

.tag-item-wrapper {
  width: 100%;
}

.tag-item {
  width: 100%; /* 标签占满容器宽度 */
  margin: 10; /* 移除默认边距 */
  justify-content: flex-start; /* 左对齐文本 */
}
/* 添加终端弹窗相关样式 */
:deep(.terminal-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  max-width: 100%;
  max-height: 100%;
}

:deep(.terminal-dialog .el-dialog__body) {
  flex: 1;
  padding: 0;
  height: calc(100vh - 120px);
  overflow: hidden;
}
.yaml-dialog .el-dialog__body {
  padding: 10px 20px;
  background: #1e1e1e;
}

.yaml-dialog .el-dialog__header {
  border-bottom: 1px solid #434343;
}

.yaml-dialog .el-dialog__footer {
  border-top: 1px solid #434343;
  padding: 10px 20px;
}

/* 添加日志弹窗相关样式 */
.log-container {
  padding: 10px;
  background: #000;
  border-radius: 4px;
  height: calc(100vh - 200px);
  overflow: auto;
}

.log-content {
  font-family: 'Monaco', monospace;
  font-size: 12px;
  height: 100%;
}

/* 使用 >>> 深度选择器 (Vue 2) */
.log-content >>> .el-textarea__inner {
  background-color: #000 !important;
  color: #00ff00 !important;
  cursor: text !important;
  border: none !important;
  height: 100% !important;
}

.log-dialog >>> .el-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  max-width: 100%;
  max-height: 100%;
}

.log-dialog >>> .el-dialog__body {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.log-dialog >>> .el-dialog__header {
  border-bottom: 1px solid #434343;
  padding: 15px 20px;
}

.log-dialog >>> .el-dialog__footer {
  border-top: 1px solid #434343;
  padding: 10px 20px;
}
</style>


