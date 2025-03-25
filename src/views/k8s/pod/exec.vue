<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="sub-header">
        <i class="el-icon-cpu"></i> Pod 执行命令
      </div>
      <div class="info-container">
        <el-form :model="form" label-width="120px">
          <el-form-item label="命名空间">
            <el-input v-model="form.namespace" disabled></el-input>
          </el-form-item>
          <el-form-item label="Pod 名称">
            <el-input v-model="form.podName" disabled></el-input>
          </el-form-item>
          <el-form-item label="执行命令">
            <el-input v-model="form.command" placeholder="输入要执行的命令"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="executeCommand">执行命令</el-button>
          </el-form-item>
        </el-form>
        <div v-if="output" class="output-container">
          <pre>{{ output }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { execPodCommand } from '@/api/k8s'; // 假设这里有一个新的 API 用于执行命令

export default {
  data() {
    return {
      form: {
        namespace: '',
        podName: '',
        command: ''
      },
      output: ''
    };
  },
  created() {
    this.form.namespace = this.$route.query.namespace;
    this.form.podName = this.$route.query.podName;
  },
  methods: {
    async executeCommand() {
      try {
        const { data } = await execPodCommand({
          namespace: this.form.namespace,
          podName: this.form.podName,
          command: this.form.command
        });
        this.output = data.output;
      } catch (error) {
        this.$message.error('执行命令失败：' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.box-card {
  margin: 20px;
}
.info-container {
  padding: 20px;
}
.output-container {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: auto;
}
</style>