// 修改函数签名，增加配置参数
export function createWebSocket(config) {
  const { 
    url, 
    onMessage, 
    onError,
    term 
  } = config || {};

  let ws = new WebSocket(url);
  
  // 初始化消息处理器
  const handleMessage = (data) => {
    if (typeof onMessage === 'function') {
      onMessage(data);
    } else if (term) {
      term.write(data); // 保持向后兼容
    }
  };

  ws.onopen = () => {
    console.log('WebSocket connected to:', url);
    term?.onData(data => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data); // 启用双向通信
      }
    });
  };

  ws.onmessage = event => {
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        handleMessage(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(event.data);
    } else {
      handleMessage(event.data);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError?.(error) || term?.write('\r\n\nWebSocket error occurred\r\n');
  };

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    term.write('\r\n\nConnection closed\r\n');
    ws = null;
  };

  return {
    disconnect: () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        ws = null;
      }
    }
  };
}