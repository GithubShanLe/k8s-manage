let ws = null;

export function connectTerminal(term,url) {
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket connected');
    term.onData(data => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  };

  ws.onmessage = event => {
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result);
        term.write(data);
      };
      reader.readAsArrayBuffer(event.data);
    } else {
      term.write(event.data);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    term.write('\r\n\nWebSocket error occurred\r\n');
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