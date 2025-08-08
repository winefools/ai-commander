const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const http = require('http');

app.disableHardwareAcceleration();

let mainWindow;
let currentView = null;
let views = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Commander</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      display: flex; 
      height: 100vh; 
      overflow: hidden; 
    }
    
    .sidebar { 
      width: 250px; 
      background: #2c3e50; 
      color: white; 
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .services {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
    
    .services h3 {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #34495e;
      font-size: 14px;
      color: #ecf0f1;
    }
    
    .service-btn { 
      display: block; 
      width: 100%; 
      padding: 12px; 
      margin: 5px 0; 
      background: #34495e;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      transition: all 0.3s;
    }
    
    .service-btn:hover { 
      background: #3498db;
      transform: translateX(5px);
    }
    
    .service-btn.active {
      background: #3498db;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .bottom-section {
      border-top: 1px solid #34495e;
      padding: 15px;
      background: #1a252f;
    }
    
    .bottom-section button {
      width: 100%;
      padding: 10px;
      margin: 5px 0;
      background: #2c3e50;
      color: white;
      border: 1px solid #34495e;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.3s;
    }
    
    .bottom-section button:hover {
      background: #34495e;
    }
    
    .main { 
      flex: 1; 
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #f5f5f5;
    }
    
    .header {
      background: white;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .address-bar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .nav-buttons {
      display: flex;
      gap: 5px;
    }
    
    .nav-btn {
      padding: 6px 12px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }
    
    .nav-btn:hover:not(:disabled) {
      background: #e0e0e0;
    }
    
    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .url-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    
    .url-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
    }
    
    .go-btn {
      padding: 8px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }
    
    .go-btn:hover {
      background: #2980b9;
    }
    
    .content {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: white;
    }
    
    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #666;
      display: none;
    }
    
    .loading-indicator.active {
      display: block;
    }
    
    .chat-interface {
      display: none;
      height: 100%;
      flex-direction: column;
      background: white;
      padding: 0;
      width: 100%;
    }
    
    .chat-interface.active {
      display: flex;
    }
    
    .model-info {
      padding: 15px 20px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    
    .status {
      font-size: 11px;
      margin-top: 5px;
      opacity: 0.9;
    }
    
    .status.connected { color: #22c55e; }
    .status.error { color: #ef4444; }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: white;
      max-width: 768px;
      margin: 0 auto;
      width: 100%;
    }
    
    .message {
      margin: 16px 0;
      padding: 12px 0;
      animation: slideIn 0.3s ease;
      line-height: 1.6;
      max-width: 100%;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .user-message {
      background: transparent;
      color: #1f2937;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 16px;
    }
    
    .ai-message {
      background: transparent;
      color: #1f2937;
      white-space: pre-wrap;
      word-wrap: break-word;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 16px;
    }
    
    .chat-input-area {
      display: flex;
      gap: 10px;
      padding: 20px;
      background: white;
      border-top: 1px solid #e5e7eb;
      max-width: 768px;
      margin: 0 auto;
      width: 100%;
    }
    
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 15px;
      transition: border-color 0.3s;
      background: #f9fafb;
    }
    
    .chat-input:focus {
      outline: none;
      border-color: #9ca3af;
      background: white;
    }
    
    .send-btn {
      padding: 12px 20px;
      background: #1f2937;
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
      min-width: 80px;
    }
    
    .send-btn:hover:not(:disabled) {
      background: #374151;
    }
    
    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: #9ca3af;
    }
    
    .center-message {
      text-align: center;
      color: #999;
      padding: 40px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="services">
      <h3>🌐 Web Services</h3>
      <button class="service-btn" onclick="loadWebService('chatgpt', 'https://chat.openai.com')">ChatGPT</button>
      <button class="service-btn" onclick="loadWebService('claude', 'https://claude.ai')">Claude</button>
      <button class="service-btn" onclick="loadWebService('gemini', 'https://gemini.google.com/app')">Gemini</button>
      <button class="service-btn" onclick="loadWebService('perplexity', 'https://perplexity.ai')">Perplexity</button>
      
      <h3 style="margin-top: 20px;">🖥️ Local LLM (Ollama)</h3>
      <button class="service-btn" onclick="showLocalChat('llama3.1:70b')">Llama 3.1 70B</button>
      <button class="service-btn" onclick="showLocalChat('gpt-oss:120b')">ChatGPT OSS 120B</button>
      <button class="service-btn" onclick="showLocalChat('qwen2.5:72b')">Qwen 2.5 72B</button>
      
      <h3 style="margin-top: 20px;">🔌 API Services</h3>
      <button class="service-btn" onclick="showAPIChat('groq')">Groq API</button>
    </div>
    
    <div class="bottom-section">
      <button onclick="testOllama()">🔍 Test Ollama</button>
      <button onclick="clearChat()">🗑️ Clear Chat</button>
    </div>
  </div>
  
  <div class="main">
    <div class="header">
      <div class="address-bar" id="address-bar" style="display: none;">
        <div class="nav-buttons">
          <button class="nav-btn" onclick="goBack()" id="back-btn">◀</button>
          <button class="nav-btn" onclick="goForward()" id="forward-btn">▶</button>
          <button class="nav-btn" onclick="reload()">🔄</button>
        </div>
        <input type="text" class="url-input" id="url-input" 
               placeholder="Enter URL or search..." 
               onkeypress="if(event.key==='Enter') navigate()">
        <button class="go-btn" onclick="navigate()">Go</button>
      </div>
    </div>
    
    <div class="content" id="content">
      <div class="loading-indicator" id="loading">
        <h2>Loading...</h2>
        <p>Please wait while the page loads</p>
      </div>
      
      <div class="chat-interface" id="chat-interface">
        <div class="model-info">
          <strong>Model:</strong> <span id="current-model">-</span>
          <div id="ollama-status" class="status">Checking connection...</div>
        </div>
        
        <div class="chat-messages" id="chat-messages">
          <div class="center-message">
            💬 Start a conversation with your local AI model<br>
            <small>Powered by Ollama</small>
          </div>
        </div>
        
        <div class="chat-input-area">
          <input type="text" 
                 class="chat-input" 
                 id="chat-input" 
                 placeholder="Type your message..." 
                 onkeypress="if(event.key==='Enter' && !event.shiftKey) sendMessage()">
          <button class="send-btn" id="send-btn" onclick="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const { ipcRenderer } = require('electron');
    const http = require('http');
    
    let currentMode = 'web';
    let currentModel = '';
    let isLoading = false;
    
    // Load web service
    function loadWebService(name, url) {
      currentMode = 'web';
      
      // Update active button
      document.querySelectorAll('.service-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      // Hide chat interface, show address bar
      document.getElementById('chat-interface').classList.remove('active');
      document.getElementById('address-bar').style.display = 'flex';
      document.getElementById('url-input').value = url;
      document.getElementById('loading').classList.add('active');
      
      // Send to main process
      ipcRenderer.send('load-service', { name, url });
      
      // Hide loading after delay
      setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
      }, 1000);
    }
    
    // Navigate to URL
    function navigate() {
      const input = document.getElementById('url-input');
      let url = input.value.trim();
      
      if (!url) return;
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.')) {
          url = 'https://' + url;
        } else {
          // Search on Google
          url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
      }
      
      input.value = url;
      document.getElementById('loading').classList.add('active');
      ipcRenderer.send('navigate', url);
      
      setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
      }, 1000);
    }
    
    function goBack() {
      ipcRenderer.send('go-back');
    }
    
    function goForward() {
      ipcRenderer.send('go-forward');
    }
    
    function reload() {
      document.getElementById('loading').classList.add('active');
      ipcRenderer.send('reload');
      setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
      }, 1000);
    }
    
    // Show local chat
    function showLocalChat(model) {
      currentMode = 'local';
      currentModel = model;
      
      // Update active button
      document.querySelectorAll('.service-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      // Update UI
      document.getElementById('current-model').textContent = model;
      document.getElementById('address-bar').style.display = 'none';
      document.getElementById('chat-interface').classList.add('active');
      document.getElementById('loading').classList.remove('active');
      
      // Hide web view
      ipcRenderer.send('hide-view');
      
      // Test connection
      testOllamaConnection();
    }
    
    // Test Ollama connection using Node.js http
    function testOllamaConnection() {
      const status = document.getElementById('ollama-status');
      status.textContent = 'Connecting to Ollama...';
      
      const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/tags',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.models && json.models.length > 0) {
              status.textContent = '✅ Connected to Ollama (' + json.models.length + ' models available)';
              status.className = 'status connected';
              console.log('Available models:', json.models.map(m => m.name));
            } else {
              status.textContent = '⚠️ Ollama running but no models found';
              status.className = 'status error';
            }
          } catch (e) {
            status.textContent = '❌ Error parsing Ollama response';
            status.className = 'status error';
          }
        });
      });
      
      req.on('error', (error) => {
        status.textContent = '❌ Ollama not running. Start with: ollama serve';
        status.className = 'status error';
        console.error('Connection error:', error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        status.textContent = '❌ Connection timeout';
        status.className = 'status error';
      });
      
      req.end();
    }
    
    // Send message to Ollama
    function sendMessage() {
      if (isLoading || currentMode !== 'local') return;
      
      const input = document.getElementById('chat-input');
      const messages = document.getElementById('chat-messages');
      const sendBtn = document.getElementById('send-btn');
      const status = document.getElementById('ollama-status');
      
      const userMessage = input.value.trim();
      if (!userMessage) return;
      
      // Clear center message if exists
      const centerMsg = messages.querySelector('.center-message');
      if (centerMsg) centerMsg.remove();
      
      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'message user-message';
      userDiv.innerHTML = '<div style="font-weight: 600; margin-bottom: 8px;">You</div>' + escapeHtml(userMessage);
      messages.appendChild(userDiv);
      
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
      
      // Update UI state
      isLoading = true;
      sendBtn.disabled = true;
      sendBtn.textContent = 'Thinking...';
      status.textContent = '🤔 AI is thinking...';
      
      // Create AI message container
      const aiDiv = document.createElement('div');
      aiDiv.className = 'message ai-message';
      const modelName = currentModel.split(':')[0].toUpperCase();
      aiDiv.innerHTML = '<div style="font-weight: 600; margin-bottom: 8px;">Assistant (' + modelName + ')</div>';
      const responseSpan = document.createElement('span');
      aiDiv.appendChild(responseSpan);
      messages.appendChild(aiDiv);
      
      // Prepare request
      const postData = JSON.stringify({
        model: currentModel,
        prompt: userMessage,
        stream: true
      });
      
      const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 300000  // 5 minutes for large models
      };
      
      const req = http.request(options, (res) => {
        let fullResponse = '';
        let lastUpdate = Date.now();
        
        res.on('data', (chunk) => {
          const lines = chunk.toString().split('\\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                fullResponse += json.response;
                
                // Update UI every 100ms to avoid flickering
                if (Date.now() - lastUpdate > 100) {
                  responseSpan.textContent = fullResponse;
                  messages.scrollTop = messages.scrollHeight;
                  lastUpdate = Date.now();
                }
              }
              
              if (json.done) {
                responseSpan.textContent = fullResponse;
                messages.scrollTop = messages.scrollHeight;
                status.textContent = '✅ Connected to Ollama';
                status.className = 'status connected';
              }
            } catch (e) {
              // Ignore JSON parse errors for streaming
            }
          }
        });
        
        res.on('end', () => {
          isLoading = false;
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send';
          
          if (!fullResponse) {
            responseSpan.textContent = 'No response received. The model might be loading...';
            responseSpan.style.color = '#ef4444';
          }
        });
      });
      
      req.on('error', (error) => {
        responseSpan.textContent = 'Error: ' + error.message;
        responseSpan.style.color = '#ef4444';
        status.textContent = '❌ Connection error';
        status.className = 'status error';
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      });
      
      req.on('timeout', () => {
        req.destroy();
        responseSpan.textContent = 'Request timeout. The model might be too large or slow.';
        responseSpan.style.color = '#ef4444';
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      });
      
      req.write(postData);
      req.end();
    }
    
    // Test Ollama version
    function testOllama() {
      const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/version',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            alert('✅ Ollama Status\\n\\nVersion: ' + json.version + '\\nStatus: Running');
          } catch (e) {
            alert('❌ Error parsing response');
          }
        });
      });
      
      req.on('error', () => {
        alert('❌ Ollama Connection Failed\\n\\nOllama is not running.\\nStart it with: ollama serve');
      });
      
      req.on('timeout', () => {
        req.destroy();
        alert('❌ Connection timeout');
      });
      
      req.end();
    }
    
    // Clear chat
    function clearChat() {
      if (currentMode === 'local') {
        document.getElementById('chat-messages').innerHTML = 
          '<div class="center-message">💬 Chat cleared. Start a new conversation!<br><small>Powered by Ollama</small></div>';
      }
    }
    
    // Show API chat
    function showAPIChat(service) {
      alert('🚧 Coming Soon\\n\\nAPI integration for ' + service + ' is under development.\\nYou will be able to add your API keys in settings.');
    }
    
    // Utility function
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // IPC listeners
    ipcRenderer.on('url-changed', (event, url) => {
      document.getElementById('url-input').value = url;
    });
    
    ipcRenderer.on('can-navigate', (event, { canGoBack, canGoForward }) => {
      document.getElementById('back-btn').disabled = !canGoBack;
      document.getElementById('forward-btn').disabled = !canGoForward;
    });
    
    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
      // Start with ChatGPT
      setTimeout(() => {
        const chatgptBtn = document.querySelector('.service-btn');
        if (chatgptBtn) {
          chatgptBtn.click();
        }
      }, 100);
    });
  </script>
</body>
</html>
  `;

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // Handle service loading
  ipcMain.on('load-service', (event, { name, url }) => {
    // Remove existing view
    if (currentView) {
      mainWindow.removeBrowserView(currentView);
      currentView = null;
    }

    // Create new BrowserView
    currentView = new BrowserView({
      webPreferences: {
        partition: `persist:${name}`,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true
      }
    });

    mainWindow.addBrowserView(currentView);
    
    // Set bounds
    const bounds = mainWindow.getContentBounds();
    currentView.setBounds({
      x: 250,
      y: 50,
      width: bounds.width - 250,
      height: bounds.height - 50
    });

    currentView.setAutoResize({
      width: true,
      height: true
    });

    // Load URL
    currentView.webContents.loadURL(url);
    
    // Handle navigation events
    currentView.webContents.on('did-navigate', (e, navUrl) => {
      mainWindow.webContents.send('url-changed', navUrl);
      updateNavButtons();
    });
    
    currentView.webContents.on('did-navigate-in-page', (e, navUrl) => {
      mainWindow.webContents.send('url-changed', navUrl);
      updateNavButtons();
    });

    currentView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorDescription);
    });

    views[name] = currentView;
  });

  // Handle navigation
  ipcMain.on('navigate', (event, url) => {
    if (currentView) {
      currentView.webContents.loadURL(url);
    }
  });

  ipcMain.on('go-back', () => {
    if (currentView && currentView.webContents.canGoBack()) {
      currentView.webContents.goBack();
    }
  });

  ipcMain.on('go-forward', () => {
    if (currentView && currentView.webContents.canGoForward()) {
      currentView.webContents.goForward();
    }
  });

  ipcMain.on('reload', () => {
    if (currentView) {
      currentView.webContents.reload();
    }
  });

  ipcMain.on('hide-view', () => {
    if (currentView) {
      mainWindow.removeBrowserView(currentView);
      currentView = null;
    }
  });

  function updateNavButtons() {
    if (currentView) {
      mainWindow.webContents.send('can-navigate', {
        canGoBack: currentView.webContents.canGoBack(),
        canGoForward: currentView.webContents.canGoForward()
      });
    }
  }

  // Handle window resize
  mainWindow.on('resize', () => {
    updateViewBounds();
  });
  
  mainWindow.on('maximize', () => {
    updateViewBounds();
  });
  
  mainWindow.on('unmaximize', () => {
    updateViewBounds();
  });
  
  function updateViewBounds() {
    if (currentView) {
      const bounds = mainWindow.getContentBounds();
      currentView.setBounds({
        x: 250,
        y: 50,
        width: Math.max(400, bounds.width - 250),
        height: Math.max(300, bounds.height - 50)
      });
    }
  }

  // Clean up on close
  mainWindow.on('closed', () => {
    mainWindow = null;
    currentView = null;
    views = {};
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

console.log('AI Commander starting...');