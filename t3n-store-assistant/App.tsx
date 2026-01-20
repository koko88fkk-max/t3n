
import React, { useState, useRef, useEffect } from 'react';
import { Message, BotStatus, Product } from './types';
import { Icons } from './constants';
import { sendMessage, initChat } from './services/gemini';
import ProductCard from './components/ProductCard';

const LOGO_URL = "https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/t3n-knight-logo.png";

const PRODUCTS: Product[] = [
  {
    name: "فك باند فورت (Spoofer)",
    price: "49.99 ريال",
    features: ["يفك باند البطولات", "نسبة نجاح 100%", "فك نهائي بدون رجوع"],
    support: "ويندوز 10/11 - جميع اللوحات",
    delivery: "فوري (كود) إيميل/SMS",
    image: "https://cdn-icons-png.flaticon.com/512/9440/9440333.png" // Shield/Security Icon
  },
  {
    name: "T3N PERM SPOOFER",
    price: "30 ريال (عرض)",
    features: ["إصلاح سيريالات نهائي", "بعد الفورمات أو البيع", "ألعاب: Valorant, FiveM, Rust"],
    support: "أحدث إصدارات ويندوز - كل المذربوردات",
    delivery: "فوري (كود) إيميل/SMS",
    image: "https://cdn-icons-png.flaticon.com/512/903/903417.png" // Chip/Hardware Icon
  }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'يا هلا ومرحبا بك في متجر T3N! أبشر بسعدك، معك المساعد الذكي وجاهز لأي استفسار بخصوص السبوفر وفك الباند. وش ودك تسأل عنه؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<BotStatus>(BotStatus.IDLE);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === BotStatus.THINKING) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus(BotStatus.THINKING);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const stream = await sendMessage(input);
      let fullText = '';
      
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => 
            prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m)
          );
        }
      }
      setStatus(BotStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(BotStatus.ERROR);
      setMessages(prev => 
        prev.map(m => m.id === assistantMsgId ? { ...m, content: 'عذراً يا غالي، صار عندي خلل بسيط. جرب مرة ثانية أو تواصل معنا عبر الديسكورد.' } : m)
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505] relative overflow-hidden">
      {/* Decorative Background Image Overlay (The Horse/Knight Image) */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `url("${LOGO_URL}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(20%) brightness(0.8)'
        }}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-[#0d1117] border-l border-[#1e3a5f]/10 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative z-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-2">
          <Icons.Robot />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">مساعد T3N</h1>
            <p className="text-[#1e3a5f] text-[10px] font-bold uppercase tracking-wider">متجر الحلول النهائية</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">المنتجات المميزة</h2>
          {PRODUCTS.map((p, i) => (
            <ProductCard key={i} product={p} />
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-6 border-t border-[#1e3a5f]/10">
          <a 
            href="https://discord.gg/T3N" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/10"
          >
            <Icons.Discord />
            ديسكورد المتجر
          </a>
          <a 
            href="https://salla.sa/t3nn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-all"
          >
            <Icons.Store />
            رابط المتجر
          </a>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-[calc(100vh-100px)] md:h-screen z-10">
        {/* Chat Header (Mobile only) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0d1117] border-b border-[#1e3a5f]/10 shadow-lg">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#1e3a5f]/20 bg-black">
               <img src={LOGO_URL} className="w-full h-full object-cover" alt="T3N Logo" />
             </div>
             <span className="font-bold text-white">مساعد متجر T3N</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-zinc-500 font-bold uppercase">Online</span>
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] flex gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`mt-1 shrink-0`}>
                    {msg.role === 'assistant' ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-[#1e3a5f]/20 bg-[#0d1117]">
                         <img 
                            src={LOGO_URL} 
                            className="w-full h-full object-cover" 
                            alt="T3N Assistant Avatar"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-[10px]">T3N</div>';
                                }
                            }}
                         />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className={`
                    p-5 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-xl
                    ${msg.role === 'user' 
                      ? 'bg-[#0d1117] border border-zinc-800 text-zinc-100 rounded-tr-none' 
                      : 'bg-[#1e3a5f]/10 border border-[#1e3a5f]/30 text-zinc-100 rounded-tl-none'
                    }
                  `}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === 'assistant' && msg.content === '' && (
                      <div className="flex gap-1.5 py-1">
                        <div className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-[#1e3a5f] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={chatEndRef} />
        </div>

        {/* Input Container */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative group"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل هنا"
              disabled={status === BotStatus.THINKING}
              className="w-full bg-[#0d1117] border border-[#1e3a5f]/10 text-white pl-16 pr-6 py-5 rounded-2xl focus:outline-none focus:border-[#1e3a5f]/50 focus:ring-1 focus:ring-[#1e3a5f]/20 transition-all placeholder:text-zinc-700 shadow-2xl disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || status === BotStatus.THINKING}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-[#1e3a5f] hover:bg-[#2a4f7d] text-white rounded-xl transition-all disabled:bg-zinc-900 disabled:text-zinc-700 shadow-lg shadow-[#1e3a5f]/20"
            >
              <Icons.Send />
            </button>
          </form>
          <div className="flex justify-center items-center gap-6 mt-6 opacity-30">
             <span className="text-[10px] font-bold tracking-widest text-zinc-500">T3N STORE</span>
             <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
             <span className="text-[10px] font-bold tracking-widest text-zinc-500">SECURE SOLUTIONS</span>
             <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
             <span className="text-[10px] font-bold tracking-widest text-zinc-500">FAST DELIVERY</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
