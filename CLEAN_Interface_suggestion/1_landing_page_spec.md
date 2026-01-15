# 🏠 Landing Page Spec

**Route:** `/`
**Access:** Public

---

## Overview

The landing page is the first touchpoint for potential customers. It combines marketing content with an AI-powered chat widget for lead capture.

---

## Components

### 1. Hero Section
- **Headline:** "Trust Infrastructure for Modern Childcare"
- **Subheadline:** Brief description of the daycare's values
- **CTA Button:** "Schedule a Visit" → Opens chat widget

### 2. Chat Widget (Floating)
- **Position:** Bottom-Right corner
- **Trigger:** Auto-opens after 5 seconds OR click on CTA
- **Agent:** Connects to Agent 02 (Claude - Enrollment)
- **Flow:**
  1. Visitor sends message
  2. N8N webhook receives
  3. Agent 01 (Gemini) classifies language
  4. Agent 02 (Claude) handles conversation
  5. Lead data saved to database

### 3. Features Grid
- 3 columns layout
- Features:
  - **Real-Time Updates** - Parents see daily activities
  - **Secure & Private** - Data protection built-in
  - **Expert Curriculum** - Educational activities

### 4. Testimonials Section
- Carousel of parent reviews
- Optional: Star ratings

### 5. Footer
- Contact information
- Address
- Phone
- Social media links

---

## Chat Widget Implementation

```tsx
// components/chat/ChatWidget.tsx
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage = { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Send to N8N webhook
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: content, session_id: sessionId })
    });

    const data = await response.json();

    // Add assistant message
    const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.reply, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between">
            <span>Chat with us</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type a message..."
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          💬
        </button>
      )}
    </div>
  );
}
```

---

## API Endpoint

```
POST /api/chat

Body: {
  "message": "string",
  "session_id": "string"
}

Response: {
  "reply": "string",
  "lead_id": "string | null"
}
```

---

## Design Notes

- Mobile-first responsive design
- Fast loading (optimize images)
- Trust-building elements (testimonials, certifications)
- Clear CTA visibility
- Accessible (WCAG 2.1 AA)
