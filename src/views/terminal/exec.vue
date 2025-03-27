<template>
    <div class="terminal-wrapper">
      <div id="xterm" ref="xterm" class="xterm" />
      <el-button 
        class="exit-btn"
        type="danger" 
        icon="el-icon-switch-button"
        @click="handleExit"
      >退出终端</el-button>
    </div>
  </template>
  
  <script>
  import 'xterm/css/xterm.css'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'
  import { connectTerminal } from '@/api/terminal'
  
  export default {
    name: 'Xterm',
    data() {
      return {
        term: null,
        connection: null,
        fitAddon: null,
       namespace: this.$route.query.namespace || "",
       podName: this.$route.query.podName || ""
      }
    },
    mounted() {
      this.initTerm()
    },
    beforeDestroy() {
      if (this.connection) {
        this.connection.disconnect()
      }
      if (this.term) {
        this.term.dispose()
      }
    },
    methods: {
      initTerm() {
        this.term = new Terminal({
          fontSize: 13,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          cursorBlink: true,
          theme: {
            background: '#1c1c1c',
            foreground: '#c5c8c6',
            cursor: '#c5c8c6',
            cursorAccent: '#1c1c1c',
            selection: 'rgba(255, 255, 255, 0.3)',
            black: '#1d1f21',
            red: '#cc6666',
            green: '#b5bd68',
            yellow: '#f0c674',
            blue: '#81a2be',
            magenta: '#b294bb',
            cyan: '#8abeb7',
            white: '#c5c8c6'
          },
          scrollback: 10000,
          cursorStyle: 'block',
          convertEol: true,
          rightClickSelectsWord: true,
          macOptionIsMeta: true
        })
  
        this.fitAddon = new FitAddon()
        this.term.loadAddon(this.fitAddon)
        this.term.open(this.$refs.xterm)
        this.fitAddon.fit()
        this.term.focus()
        this.connection = connectTerminal(this.term, `/execute/podshell?namespace=${this.namespace}&podName=${this.podName}`)
        window.addEventListener('resize', this.handleResize)
      },
      handleResize() {
        this.fitAddon?.fit()
      },
      handleExit() {
        // 关闭终端连接
        if (this.connection) {
          this.connection.disconnect()
        }
        if (this.term) {
          this.term.dispose()
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .terminal-wrapper {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background: #1c1c1c;
  }
  
  .xterm {
    width: 100%;
    height: calc(100vh - 40px);
    background: #1c1c1c;
  }
  
  :deep(.xterm-viewport) {
    overflow-y: auto !important;
    scrollbar-width: thin;
    scrollbar-color: #666 #1c1c1c;
  }
  
  :deep(.xterm-helper-textarea) {
    opacity: 0;
    position: absolute;
    left: -9999px;
  }
  </style>

// 添加按钮样式
<style scoped>
.exit-btn {
  position: fixed;
  right: 30px;
  top: 20px;
  z-index: 1000;
  opacity: 0.8;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
}
</style>
  