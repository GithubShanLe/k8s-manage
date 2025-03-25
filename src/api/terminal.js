const { EventEmitter } = require('events');

const WS_ENDPOINTS = {
  SHELL: '/execute/shell',
  POD_SHELL: '/execute/podshell'
};

class TerminalSocket {
  constructor(endpoint) {
    this.socket = null;
    this.isOpen = false;
    this.eventEmitter = new EventEmitter();
    this.endpoint = endpoint;
    this.initWebSocket();
  }

  initWebSocket() {
  
    // 将参数转换为查询字符串格式，用于 WebSocket 连接
    this.socket = new WebSocket(this.endpoint);
    this.socket.onopen = () => {
      console.log(`WebSocket ${this.endpoint} 连接已打开`);
      this.isOpen = true;
    };

    this.socket.onmessage = (event) => {
      console.log(`收到消息 from ${this.endpoint}:`, event.data);
      this.eventEmitter.emit('message', event.data);
    };

    this.socket.onclose = () => {
      console.log(`WebSocket ${this.endpoint} 连接已关闭`);
      this.isOpen = false;
    };

    this.socket.onerror = (error) => {
      console.error(`WebSocket ${this.endpoint} 连接发生错误:`, error);
      this.isOpen = false;
    };
  }

  send(data) {
    if (this.isOpen) {
      this.socket.send(JSON.stringify(data));
      return this.eventEmitter;
    } else {
      console.error(`WebSocket ${this.endpoint} 连接未打开`);
      return Promise.reject(new Error('WebSocket 连接未打开'));
    }
  }
}

const shellSocket = new TerminalSocket(WS_ENDPOINTS.SHELL);
const podShellSocket =new TerminalSocket(WS_ENDPOINTS.POD_SHELL);


export function withTerminal(data) {
  return shellSocket.send(data);
}

export function withPodTerminal(data) {
  return podShellSocket.send(data);
}