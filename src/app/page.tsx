'use client';

import { Send, Loader2, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Direct frontend usage as requested
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

type Message = { id: string; role: 'user' | 'bot'; content: string };

// Predefined answers to bypass API rate limits for specific questions
const PREDEFINED_ANSWERS: { keywords: string[], answer: string }[] = [
  {
    keywords: ['doomsday', 'before watching'],
    answer: `[DATABANK INITIALIZING: FILE // AVENGERS_DOOMSDAY_PREPARATION]\n[SECURITY CLEARANCE: LEVEL 8 REQUIRED]\n[STATUS: DATA RETRIEVED]\n\nGreetings, hero! Prepare your visual sensors and mental archives. *Avengers: Doomsday* marks the catastrophic climax of **The Multiverse Saga**, serving as the precursor to the realm-shattering events of *Avengers: Secret Wars*.\n\nTo ensure maximum tactical readiness, here is what you must know:\n* **The Fall of Kang**: The Council of Kangs has been neutralized, leaving a massive power vacuum across the multiverse.\n* **The Rise of Doom**: Victor Von Doom has stepped into this void. He is not merely a planetary threat; he is a multiversal conqueror wielding magic, unparalleled intellect, and advanced technology. \n* **The Incursions**: The fabric of reality is tearing. Parallel universes are colliding (Incursions), threatening to annihilate all existence.\n* **The Fantastic Four**: Earth-616's newly established First Family will play a critical role in combating this cosmic threat.\n* **A Fractured Avengers**: Earth's mightiest heroes are scattered. They must reunite and forge new alliances to stand a chance against the impending doom.`
  },
  {
    keywords: ['loki'],
    answer: `[DATABANK INITIALIZING: FILE // LOKI_TVA_ARCHIVES]\n[SECURITY CLEARANCE: OMNIVERSAL]\n[STATUS: DATA RETRIEVED]\n\nThe temporal anomalies surrounding the Variant known as Loki (L1130) have fundamentally altered the architecture of the multiverse. \n\n* **The TVA**: Loki was apprehended by the Time Variance Authority, an organization dedicated to preserving the "Sacred Timeline" under the direction of He Who Remains (a Kang variant).\n* **Sylvie's Vengeance**: Alongside his female variant, Sylvie, Loki discovered the truth of the TVA. Despite Loki's warnings, Sylvie assassinated He Who Remains, shattering the Sacred Timeline and unleashing the infinite Multiverse.\n* **The Temporal Loom**: The multiverse's expansion overloaded the TVA's Temporal Loom, threatening to erase all of time. \n* **God of Stories**: In a final act of ultimate sacrifice and glorious purpose, Loki stepped into the temporal radiation. He physically grabbed the dying timelines, infusing them with his magic, and reorganized them into the World Tree (Yggdrasil). \n\nLoki now sits at the end of time, a solitary guardian keeping the infinite multiverse alive.`
  },
  {
    keywords: ['victor von doom', 'doom'],
    answer: `[DATABANK INITIALIZING: FILE // VICTOR_VON_DOOM]\n[THREAT LEVEL: OMEGA]\n[STATUS: DATA RETRIEVED]\n\n**Dr. Victor Von Doom** is the absolute monarch of the sovereign nation of Latveria. He is a polymath possessing genius-level intellect, mastery over dark sorcery, and a suit of highly advanced powered armor of his own design. \n\nHe believes that the only way to save humanity—and by extension, the multiverse—is for him to rule it. His arrogance is matched only by his unimaginable capability. \n\n**Known Allies and Subordinates:**\n* **Doombots**: A vast army of robotic replicas that share his appearance and intellect, programmed with unwavering loyalty.\n* **Latverian Military**: The fiercely devoted armed forces of his home nation.\n* **Multiversal Variants**: In his quest for ultimate power, Doom is known to subjugate or form temporary, highly volatile alliances with variants of himself or other cosmic entities.\n* *(Redacted)*: Current surveillance indicates Doom is assembling a cabal of villains to counter the Avengers, though their identities remain heavily encrypted.`
  },
  {
    keywords: ['infinity war', 'endgame', 'spiderman', 'brand new day', 'thunderbolts', 'daredevil', 'wolverine'],
    answer: `[DATABANK INITIALIZING: FILE // MCU_HISTORICAL_SUMMARY]\n[STATUS: DECRYPTING VAST ARCHIVES]\n\nHere is the condensed timeline report of the requested events:\n\n* **Infinity War & Endgame**: The Mad Titan Thanos successfully collected the six Infinity Stones and erased half of all life in the universe. Five years later, the remaining Avengers utilized a "Time Heist" to retrieve the Stones from the past. They successfully resurrected the fallen, and Tony Stark (Iron Man) sacrificed himself to eradicate Thanos and his army.\n* **Spider-Man (Post-No Way Home)**: Following a catastrophic multiversal breach, Doctor Strange cast a spell erasing Peter Parker from the memory of everyone on Earth. Peter is now utterly alone, operating as a ground-level, anonymous Spider-Man in New York, starting his life completely over.\n* **Thunderbolts**: (Data File Incomplete - Recent Activity Detected) CIA Director Valentina Allegra de Fontaine has assembled a team of morally ambiguous operatives and former assassins—including Yelena Belova, Bucky Barnes, and U.S. Agent—to handle black-ops missions the Avengers cannot.\n* **Daredevil**: Matt Murdock has resumed his crusade in Hell's Kitchen. After briefly assisting Spider-Man and She-Hulk, he is currently locked in a brutal shadow war against Wilson Fisk (The Kingpin), who has recently consolidated power and run for Mayor of New York.\n* **Wolverine**: The mutant Logan was extracted from a decaying timeline by the TVA. After a violent and reluctant team-up with Deadpool across the Void, he found a new purpose and currently resides in Earth-10005, having saved his universe from total erasure.`
  }
];

function getPredefinedAnswer(input: string): string | null {
  const lowerInput = input.toLowerCase();
  for (const item of PREDEFINED_ANSWERS) {
    if (item.keywords.some(kw => lowerInput.includes(kw))) {
      return item.answer;
    }
  }
  return null;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setText('');
    setIsLoading(true);
    setError('');

    try {
      const predefined = getPredefinedAnswer(content);
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', content: '...' }]);

      let fullText = '';
      
      if (predefined) {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        fullText = predefined;
      } else {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-3.8-flash',
          systemInstruction: `You are the ultimate Marvel Cinematic Universe Support AI, also known as the Marvel Studios Official Databank.
  You possess complete and encyclopedic knowledge of all Marvel movies, shows, comics, and lore.
  Answer the user's questions with high detail, enthusiasm, and a slightly robotic but heroic tone.
  Format your responses nicely with markdown. Never mention that you are an AI model created by Google.`
        });

        const history = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(content);
        fullText = result.response.text();
      }
      
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, content: fullText } : m
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch from Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-container">
      <header className="header">
        <h1>MARVEL STUDIOS</h1>
        <p>Official Databank</p>
      </header>

      {/* Floating Lego Spiderman */}
      <div className="spidey-container">
        <img src="/spidey.jpg" alt="Lego Spiderman" className="spidey-img" />
      </div>

      <div className="chat-window">
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="text-center mt-20" style={{ color: 'var(--marvel-silver)' }}>
              <Shield size={80} className="mx-auto mb-6" style={{ color: 'var(--marvel-red)' }} />
              <p className="text-xl font-bold uppercase tracking-wider">
                Avenger Support AI Online.<br/>Ready to access the global networks.<br/><br/>
                <span style={{ color: 'var(--marvel-red)' }}>Try asking: "What should I know before watching Avengers: Doomsday?"</span>
              </p>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`message-wrapper ${m.role === 'user' ? 'user' : 'bot'}`}>
              <div className={`avatar ${m.role}`}>
                {m.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className="message-bubble">
                <div className="markdown-content">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div style={{ color: 'var(--marvel-red)', padding: '1rem', textAlign: 'center', background: 'rgba(236,29,36,0.1)', borderTop: '1px solid var(--marvel-red)' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="input-area">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(text);
            }}
            className="input-form"
          >
            <input
              type="text"
              className="input-field"
              value={text}
              placeholder="Query Marvel Database..."
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="submit-btn" disabled={!text.trim() || isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
