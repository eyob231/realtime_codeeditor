import './App.css';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const createRoom = () => {
    navigate(`/room/${crypto.randomUUID()}`);
  };

  const joinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedRoomId = roomId.trim();

    if (trimmedRoomId) {
      navigate(`/room/${encodeURIComponent(trimmedRoomId)}`);
    }
  };

  return (
    <main className="landing-shell">
      <header className="app-bar">
        <div className="brand-mark"><span>&lt;/&gt;</span> syncpad</div>
        <div className="connection-pill"><span className="status-dot" /> service online</div>
      </header>

      <section className="landing-content">
        <div className="intro-block">
          <p className="eyebrow">REALTIME WORKSPACE</p>
          <h1>Write together,<br /><em>in the same room.</em></h1>
          <p className="intro-copy">A shared code canvas for quick ideas, pair sessions, and everything worth keeping in sync.</p>
        </div>

        <div className="room-panel">
          <div className="panel-heading">
            <span className="panel-index">01</span>
            <div>
              <h2>Open a workspace</h2>
              <p>Join an existing room or start a fresh one.</p>
            </div>
          </div>
          <form onSubmit={joinRoom} className="join-form">
            <label htmlFor="room-id">ROOM ID</label>
            <div className="input-row">
              <input
                id="room-id"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                placeholder="paste room id"
                autoComplete="off"
              />
              <button type="submit">Join <span>↗</span></button>
            </div>
          </form>
          <div className="divider"><span>or</span></div>
          <button className="create-button" onClick={createRoom}><span className="plus-icon">+</span> Create a new room <span className="button-arrow">→</span></button>
        </div>
      </section>

      <footer className="landing-footer">
        <span><b>⌘</b> one link, everyone in</span>
        <span><b>◌</b> changes sync instantly</span>
        <span><b>⌁</b> saved automatically</span>
      </footer>
    </main>
  );
}

export default App;
