// TTG Guide - Smart Pilgrim Assistant
// Version 1.0

const TTG_GUIDE_CONFIG = {
    replies: {
        'visa': "British citizens get a Visa Waiver (EVW) for ~£30. It's instant online. For other passports, we can process a full Umrah Visa for £150.",
        'hotel': "Our 5-star packages feature hotels like Swissotel and Hilton, located 0-5 mins from the Haram. 3-star options are ~10-15 mins walk.",
        'mahram': "Good news! As of 2024, women over 45 (and often younger groups) can travel for Umrah without a Mahram under the new Saudi tourist visa rules.",
        'baggage': "Most airlines (Saudi, BA) allow 2x 23kg bags + 7kg hand luggage. We also include Zamzam water allowance.",
        'transport': "We use private GMC Yukons or H1 Buses. The Haramain High-Speed Train is also available between Makkah and Madinah (2 hours).",
        'contact': "You can call us at 020 8840 6420 or visit our office in West Ealing.",
        'default': "I can help with Visas, Hotels, Transport, or Packages. Ask me anything!"
    },
    greetings: [
        "As-salamu alaykum! Planning a trip?",
        "Need help with Umrah Visas?",
        "Ask me about our 5-star hotels!"
    ]
};

class TTGGuide {
    constructor() {
        this.init();
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.attachEvents();
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ttg-guide-widget {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 9999;
                font-family: 'Inter', sans-serif;
            }
            .ttg-bubble {
                background: white;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border-radius: 12px;
                padding: 16px;
                width: 300px;
                display: none;
                flex-col;
                margin-bottom: 12px;
                border: 1px solid #e2e8f0;
                animation: slideUp 0.3s ease-out;
            }
            .ttg-header {
                display: flex;
                align-items: center;
                gap: 10px;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 10px;
                margin-bottom: 10px;
            }
            .ttg-avatar {
                width: 32px;
                height: 32px;
                background: #059669;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            }
            .ttg-title {
                font-weight: 700;
                color: #0f172a;
                font-size: 14px;
            }
            .ttg-messages {
                max-height: 200px;
                overflow-y: auto;
                margin-bottom: 10px;
                font-size: 13px;
                color: #475569;
                line-height: 1.5;
            }
            .ttg-input-area {
                display: flex;
                gap: 8px;
            }
            .ttg-input {
                flex: 1;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 8px;
                font-size: 12px;
                outline: none;
            }
            .ttg-input:focus { border-color: #059669; }
            .ttg-send {
                background: #059669;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 0 12px;
                cursor: pointer;
            }
            .ttg-toggle {
                background: #0f172a;
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                transition: transform 0.2s;
            }
            .ttg-toggle:hover { transform: scale(1.1); }
            .ttg-msg-bot { background: #f0fdf4; padding: 8px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #059669; }
            .ttg-msg-user { background: #f1f5f9; padding: 8px; border-radius: 8px; margin-bottom: 8px; text-align: right; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const div = document.createElement('div');
        div.className = 'ttg-guide-widget';
        div.innerHTML = `
            <div class="ttg-bubble" id="ttgBubble">
                <div class="ttg-header">
                    <div class="ttg-avatar">👳🏽</div>
                    <div>
                        <div class="ttg-title">Travel Time Guide</div>
                        <div style="font-size: 10px; color: #10b981;">● Online</div>
                    </div>
                    <div style="margin-left:auto; cursor:pointer;" onclick="ttgGuide.toggle()">✕</div>
                </div>
                <div class="ttg-messages" id="ttgMessages">
                    <div class="ttg-msg-bot">As-salamu alaykum! How can I help you with your Umrah journey today?</div>
                </div>
                <div class="ttg-input-area">
                    <input type="text" class="ttg-input" id="ttgInput" placeholder="Ask about Visas, Hotels..." onkeypress="ttgGuide.handleKey(event)">
                    <button class="ttg-send" onclick="ttgGuide.send()">→</button>
                </div>
            </div>
            <div class="ttg-toggle" onclick="ttgGuide.toggle()">
                <span style="font-size: 24px;">💬</span>
            </div>
        `;
        document.body.appendChild(div);
    }

    toggle() {
        const bubble = document.getElementById('ttgBubble');
        bubble.style.display = bubble.style.display === 'block' ? 'none' : 'block';
        if (bubble.style.display === 'block') document.getElementById('ttgInput').focus();
    }

    handleKey(e) {
        if (e.key === 'Enter') this.send();
    }

    send() {
        const input = document.getElementById('ttgInput');
        const text = input.value.trim().toLowerCase();
        if (!text) return;

        // User Msg
        this.addMsg(input.value, 'user');
        input.value = '';

        // Bot Logic
        setTimeout(() => {
            let reply = TTG_GUIDE_CONFIG.replies.default;
            for (const key in TTG_GUIDE_CONFIG.replies) {
                if (text.includes(key)) {
                    reply = TTG_GUIDE_CONFIG.replies[key];
                    break;
                }
            }
            this.addMsg(reply, 'bot');
        }, 500);
    }

    addMsg(text, sender) {
        const area = document.getElementById('ttgMessages');
        const div = document.createElement('div');
        div.className = sender === 'bot' ? 'ttg-msg-bot' : 'ttg-msg-user';
        div.textContent = text;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }
}

// Initialize
window.ttgGuide = new TTGGuide();
