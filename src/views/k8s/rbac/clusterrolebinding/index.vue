<template>

    <el-card class="box-card">
    <div class="filter-container">
        <el-input
          v-model="queryParams.clusterRoleBindingName"
          placeholder="clusterRoleBinding名称"
          class="filter-item"
          style="width: 200px;"
          clearable
          @keyup.enter.native="fetchData"
        />
        <el-button class="filter-item" type="primary" @click="fetchData">
          查询
        </el-button>
      </div>
          <!-- 节点列表 -->
      <el-card shadow="hover" class="mt-20 info-card">
        <div slot="header" class="sub-header">
          <i class="el-icon-cpu"></i> clusterrolebinding列表
          <span class="sub-title-count">({{ clusterrolebindings.length || 0 }})</span>
        </div>
        <el-table 
          :data="clusterrolebindings" 
          border 
          stripe
          style="width: 100%">
          <el-table-column prop="name" label="名称"  min-width="30" show-overflow-tooltip/>
            <el-table-column label="标签" min-width="50" show-overflow-tooltip>
              <template slot-scope="{ row, $index }">
                <div class="tag-container">
                  <template v-if="Object.keys(row.labels || {}).length > 0">
                    <!-- 始终显示前三个标签 -->
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
            </el-table-column>
          <el-table-column label="关联账号" min-width="180" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <div v-if="row.subjects && row.subjects.length">
                <div v-for="(subject, index) in row.subjects" :key="index" class="subject-item">
                  <el-tag size="mini" type="info" class="mr-5">
                    {{ subject.kind }}
                  </el-tag>
                  <span>{{ subject.name }}</span>
                  <template v-if="subject.namespace">
                    <span class="mx-5">/</span>
                    <span>{{ subject.namespace }}</span>
                  </template>
                  <template v-if="subject.apiGroup">
                    <span class="mx-5">-</span>
                    <span>{{ subject.apiGroup }}</span>
                  </template>
                </div>
              </div>
              <span v-else class="muted-text">无关联账号</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          
        </el-table>
      </el-card>
    </el-card>
  </template>
  
  <script>
  
  import { listClusterRoleBinding } from '@/api/k8s'
  export default {
  data() {
  return {
    listLoading: false,
    clusterrolebindings: [],
    labels: {},  // 初始化 labels 为空对象
    labelsFolded: true,  // 添加折叠状态控制
    queryParams: {
      clusterRoleBindingName: ''
    }
  }
  },
  mounted() {
  this.fetchData()
  },
  methods: {
  toggleLabels(index) {
    // 使用 Vue.set 确保响应式更新
    if (!this.clusterrolebindings[index].labelsExpanded) {
      this.$set(this.clusterrolebindings[index], 'labelsExpanded', true);
    } else {
      this.$set(this.clusterrolebindings[index], 'labelsExpanded', false);
    }
  },  
  async fetchData() {
    this.listLoading = true
    try {
      const { data } = await listClusterRoleBinding({
        clusterRoleBindingName: this.queryParams.clusterRoleBindingName
      })
      if (data.errorCode) {
        this.$message.error(data.errorMessage || '获取数据失败')
        return
      }
      // 初始化每个服务的标签展开状态
      this.clusterrolebindings = (data.clusterRolebindings || []).map(clusterRolebinding => ({
        ...clusterRolebinding,
        labelsExpanded: false
      }))
    } catch (error) {
      this.$message.error('请求异常：' + error.message)
    } finally {
      this.listLoading = false
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
  /* 添加 rules 相关样式 */
  .rules-container {
    display: flex;
    align-items: center;
  }
  
  .rules-detail {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .rule-item {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
  }
  
  .rule-header {
    background-color: #f2f6fc;
    padding: 8px 12px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  
  .rule-content {
    padding: 10px;
  }
  
  .rule-field {
    margin-bottom: 8px;
  }
  
  .rule-label {
    font-weight: bold;
    display: block;
    margin-bottom: 4px;
  }
  
  .rule-values {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .rule-tag {
    margin-right: 5px;
    margin-bottom: 5px;
  }
  
  .muted-text {
    color: #909399;
    font-style: italic;
  }
  </style>
  
  
  