import axios from "axios";
import type { AxiosInstance } from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import type { IStandaloneCodeEditor } from "monaco-editor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

// Create axios instance with connection pooling & keep-alive
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  httpAgent: { keepAlive: true, keepAliveMsecs: 30000 },
  httpsAgent: { keepAlive: true, keepAliveMsecs: 30000 },
  timeout: 10000,
});

// Determine debounce time based on environment
const SAVE_DEBOUNCE = API_URL === "http://localhost:3000" ? 1000 : 3000;

function Room() {
  const { id } = useParams<{ id: string }>();
  const [text, setText] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveState, setSaveState] = useState('synced');
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const textRef = useRef("");
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/text/${id}`)
      .then((response) => {
        const initialText = response.data.text ?? "";
        setText(initialText);
        textRef.current = initialText;
      })
      .catch((error) => console.error("Error loading room:", error));

    const socket = new WebSocket(
      `${WS_URL}?roomId=${encodeURIComponent(id)}`,
    );
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "text-update" && !message.fromSelf) {
        // Only update text from other users, preserve cursor position
        textRef.current = message.text;
        
        // Use Monaco API to preserve cursor position if editor is loaded
        if (editorRef.current) {
          const editor = editorRef.current;
          const currentPosition = editor.getPosition();
          editor.getModel()?.setValue(message.text);
          
          // Restore cursor position if valid
          if (currentPosition) {
            editor.setPosition(currentPosition);
          }
        } else {
          // Fallback if editor not loaded yet
          setText(message.text);
        }
      }
    };

    return () => {
      socket.close();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [id]);

  const handleEditorMount = (editor: IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleTextChange = (newText: string | undefined) => {
    const updatedText = newText ?? "";
    setText(updatedText);
    textRef.current = updatedText;
    isTypingRef.current = true;
    
    // Always send via WebSocket immediately (fast, local feedback)
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: "text-update", text: updatedText, fromSelf: true }),
      );
    }
    
    // Debounce HTTP save to backend (reduce network overhead)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      axiosInstance
        .put(`/text/${id}`, { text: updatedText })
        .then(() => setSaveState('synced'))
        .catch((error) => {
          setSaveState('error');
          console.error('Error saving room:', error);
        });
    }, SAVE_DEBOUNCE);
  };

  const copyRoomId = () => {
    if (id) navigator.clipboard.writeText(id);
  };

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <div className="brand-mark"><span>&lt;/&gt;</span> syncpad</div>
        <div className="room-location"><span>workspace</span><b>/</b> room-{id?.slice(0, 8)}</div>
        <div className="editor-actions">
          <span className={`save-state ${saveState}`}><span className="status-dot" /> {saveState}</span>
          <button className="copy-button" onClick={copyRoomId}>copy room id <span>⧉</span></button>
        </div>
      </header>
      <section className="editor-workspace">
        <aside className="file-rail">
          <div className="rail-label">FILES</div>
          <div className="file-item active"><span className="file-icon">JS</span> playground.js</div>
          <div className="rail-spacer" />
          <div className="online-users"><span className="avatar">Y</span><span className="avatar avatar-second">+</span></div>
        </aside>
        <div className="editor-column">
          <div className="editor-tab"><span className="js-dot" /> playground.js <span className="tab-close">×</span></div>
          <div className="editor-frame">
      <Editor
        height="calc(100vh - 185px)"
        defaultLanguage="javascript"
        value={text}
        onMount={handleEditorMount}
        onChange={(value) => handleTextChange(value ?? "")}
        theme="vs-dark"
        options={{ 
          minimap: { enabled: true }, 
          fontSize: 14, 
          padding: { top: 18 }, 
          automaticLayout: true, 
          tabSize: 2, 
          smoothScrolling: true,
          wordWrap: "on"
        }}
      />
          </div>
          <div className="editor-statusbar"><span>Ln 1, Col 1</span><span>JavaScript</span><span>UTF-8</span><span>Spaces: 2</span></div>
        </div>
      </section>
    </main>
  );
}

export default Room;
