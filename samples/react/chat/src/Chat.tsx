import { useChat } from '@semantic-kernel/react';
import { useState } from 'react';
import { TextContent } from 'semantic-kernel';

export const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chat = useChat({
    model: 'gpt-3.5-turbo',
    apiKey: '<YOUR_API_KEY>',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt) {
      return;
    }

    setLoading(true);
    try {
      await chat.prompt(prompt);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ flex: '1 0 auto' }}>
        {chat.chatHistory.length === 0 && (
          <article style={{ textAlign: 'center' }}>
            <b>Type a message to start the conversation ✨</b>
          </article>
        )}

        {chat.chatHistory.map((chatMessage, i) => {
          const isUser = chatMessage.role === 'user';

          return (
            <div className="grid">
              {isUser ? <div></div> : <></>}
              <article key={i} style={isUser ? { backgroundColor: 'var(--pico-primary)', color: '#fff' } : {}}>
                {(chatMessage.items as TextContent[])[0].text}
              </article>
              {!isUser ? <div></div> : <></>}
            </div>
          );
        })}
        {loading && <progress />}
      </div>

      <footer>
        <form role="search" onSubmit={handleSubmit}>
          <input
            name="prompt"
            autoComplete="off"
            type="text"
            placeholder="Type your message here"
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
          />
          <button type="submit" disabled={loading} aria-busy={loading}>
            {!loading ? '↑' : ''}
          </button>
        </form>
      </footer>
    </main>
  );
};
