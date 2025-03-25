<template>
  <div class="terminal">
    <div class="terminal-output" ref="output">
      <!-- 显示历史命令和输出 -->
      <div v-for="(entry, index) in history" :key="index">
        <!-- 新增显示 dir 字段 -->
        <span v-if="entry.dir" class="dir">{{ entry.dir }}</span> 
        <!-- 修改：添加实际的空格 -->
        <span>&nbsp;</span>
        <span class="prompt"> $</span> <span class="command">{{ entry.command }}</span>
        <pre v-if="entry.output">{{ entry.output }}</pre>
      </div>
    </div>
    <div class="terminal-input">
      <!-- 新增显示 dir 字段 -->
      <span v-if="currentDir" class="dir">{{ currentDir }} </span> 
      <span class="prompt">$</span>
      <input
        type="text"
        v-model="currentCommand"
        @keydown.enter="executeCommand"
        placeholder="Type a command..."
      />
    </div>
  </div>
</template>

<script>
// 导入 withTerminal 函数，用于与终端交互
import { withTerminal } from '@/api/terminal'

/**
 * TerminalIndex 组件
 * 用于在前端页面模拟终端输入和执行命令
 */
export default {
  // 组件名称
  name: 'TerminalIndex',
  data() {
    return {
      // 存储历史命令和输出
      history: [],
      // 当前输入的命令
      currentCommand: '',
      // 错误信息
      errorMessage: '',
      // 新增当前目录字段
      currentDir: '' 
    }
  },
  methods: {
    /**
     * 执行命令的异步方法
     * 执行用户输入的命令并处理响应
     */
    async executeCommand() {
      if (this.currentCommand.trim() === '') {
        // 输入仅为回车时，滚动到终端输出的底部
        this.$nextTick(() => {
          const output = this.$refs.output;
          output.scrollTop = output.scrollHeight;
        });
        return;
      }
      // 将当前命令添加到历史记录
      const newEntry = { command: this.currentCommand, output: '', dir: this.currentDir };
      this.history.push(newEntry);
      try {
        // 打印当前输入的命令
        console.log(this.currentCommand);
        // 调用 withTerminal 函数，发送命令请求
        const eventEmitter = await withTerminal({
          command: this.currentCommand
        });

        // 移除之前的 message 事件监听器
        eventEmitter.removeAllListeners('message');

        eventEmitter.on('message', (response) => {
          try {
              // 尝试将响应转换为 UTF-8 编码（通常不需要）
              const encoder = new TextEncoder();
              const decoder = new TextDecoder('utf-8');
              const encoded = encoder.encode(response);
              const decoded = decoder.decode(encoded);

              // 解析 JSON 字符串
              const parsedResponse = JSON.parse(decoded);
              // 打印解析后的 output 字段
              console.log(parsedResponse.output);
              // 更新历史记录中的输出
              newEntry.output += parsedResponse.output;
              // 更新当前目录
              if (parsedResponse.dir) {
                  this.currentDir = parsedResponse.dir;
                  newEntry.dir = parsedResponse.dir;
              }
              // 滚动到终端输出的底部
              this.$nextTick(() => {
                  const output = this.$refs.output;
                  output.scrollTop = output.scrollHeight;
              });
          } catch (error) {
              console.error('Error parsing response:', error);
          }
      });
      } catch (error) {
        console.error('Error executing command:', error);
        if (error.message === 'WebSocket 连接未打开') {
          newEntry.output = 'WebSocket connection is not open. Please try again later.';
        } else {
          newEntry.output = `Network error: ${error.message}`;
        }
        // 滚动到终端输出的底部
        this.$nextTick(() => {
          const output = this.$refs.output;
          output.scrollTop = output.scrollHeight;
        });
      }
      // 清空输入框
      this.currentCommand = '';
    }
  }
}
</script>

<style scoped>
/* 让 terminal 充满整个屏幕 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.terminal {
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  /* 充满整个屏幕 */
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.terminal-output {
  /* 可滚动 */
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.terminal-input {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.prompt {
  color: #0f0;
  margin-right: 5px;
}

.command {
  color: #fff;
}

input {
  background-color: transparent;
  border: none;
  color: #fff;
  outline: none;
  width: 100%;
}

/* 新增 dir 样式 */
.dir {
  color: #0ff; 
  white-space: nowrap; /* 防止换行 */
}
</style>