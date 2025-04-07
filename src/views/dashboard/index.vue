<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- Pod 统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-header">
            <i class="el-icon-cpu"></i>
            <span class="metric-title">Pod</span>
          </div>
          <div class="metric-value">{{ metrics.pods || 0 }}</div>
          <div class="metric-footer">
            <span>运行中: {{ metrics.runningPods || 0 }}</span>
            <span>异常: {{ metrics.errorPods || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- Deployment 统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-header">
            <i class="el-icon-s-operation"></i>
            <span class="metric-title">Deployment</span>
          </div>
          <div class="metric-value">{{ metrics.deployments || 0 }}</div>
          <div class="metric-footer">
            <span>可用: {{ metrics.availableDeployments || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- Node 统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-header">
            <i class="el-icon-s-platform"></i>
            <span class="metric-title">Node</span>
          </div>
          <div class="metric-value">{{ metrics.nodes || 0 }}</div>
          <div class="metric-footer">
            <span>就绪: {{ metrics.readyNodes || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- Service 统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-header">
            <i class="el-icon-connection"></i>
            <span class="metric-title">Service</span>
          </div>
          <div class="metric-value">{{ metrics.services || 0 }}</div>
          <div class="metric-footer">
            <span>LoadBalancer: {{ metrics.lbServices || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资源使用趋势图 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header">
            <span>CPU 使用趋势</span>
          </div>
          <!-- TODO: 添加 CPU 趋势图 -->
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header">
            <span>内存使用趋势</span>
          </div>
          <!-- TODO: 添加内存趋势图 -->
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { dashboard } from '@/api/k8s'

export default {
  name: 'Dashboard',
  data() {
    return {
      metrics: {
        pods: 0,
        runningPods: 0,
        errorPods: 0,
        deployments: 0,
        availableDeployments: 0,
        nodes: 0,
        readyNodes: 0,
        services: 0,
        lbServices: 0
      },
      loading: false
    }
  },
  created() {
    this.fetchMetrics()
  },
  methods: {
    async fetchMetrics() {
      this.loading = true
      try {
        const response = await dashboard()
        console.log('API响应:', response)
        
        if (response) {
          this.metrics = {
            pods: response.pods || 0,
            runningPods: response.runningPods || 0,
            errorPods: response.errorPods || 0,
            deployments: response.deployments || 0,
            availableDeployments: response.availableDeployments || 0,
            nodes: response.nodes || 0,
            readyNodes: response.readyNodes || 0,
            services: response.services || 0,
            lbServices: response.lbServices || 0
          }
        } else {
          console.error('API响应为空')
          this.$message.warning('获取数据为空')
        }
      } catch (error) {
        console.error('API调用错误:', error)
        this.$message.error('获取集群指标失败：' + error.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .metric-card {
    height: 160px;
    
    .metric-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      i {
        font-size: 24px;
        margin-right: 10px;
        color: #409EFF;
      }
      
      .metric-title {
        font-size: 16px;
        font-weight: bold;
      }
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #303133;
      margin: 10px 0;
    }
    
    .metric-footer {
      display: flex;
      justify-content: space-between;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .chart-row {
    margin-top: 20px;
    
    .chart-card {
      height: 350px;
    }
  }
}
</style>