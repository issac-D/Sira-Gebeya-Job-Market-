document.addEventListener('DOMContentLoaded', function() {
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');

    // ======================
    // 1. KNOWLEDGE BASE (Hardcoded)
    // ======================
    const knowledgeBase = {
        "application": {
            "steps": {
                response: {
                    en: `<div class="knowledge-card">
                        <div class="knowledge-title">How to Apply for Jobs</div>
                        <div class="knowledge-desc">
                            1. Search jobs → 2. Click "Apply" → 3. Submit required documents → 4. Track status.
                        </div>
                        <a href="/jobs" class="knowledge-link">Browse Jobs →</a>
                    </div>`,
                    am: `<div class="knowledge-card">
                        <div class="knowledge-title">ስራ ለመመልከት</div>
                        <div class="knowledge-desc">
                            1. ስራዎችን ይፈልጉ → 2. "አመልክት" የሚለውን ይጫኑ → 3. ሰነዶችን ያስገቡ → 4. ሁኔታውን ይከታተሉ.
                        </div>
                    </div>`
                },
                followUp: {
                    en: ["Required documents", "Interview preparation", "Application deadline"],
                    am: ["የሚያስፈልጉ ሰነዶች", "የቃለ መጠይቅ እድገት", "የመጨረሻ ቀን"]
                }
            }
        },
        "resume": {
            "tips": {
                response: {
                    en: "Use action verbs like 'managed', 'developed', 'achieved'. Keep it 1-2 pages.",
                    am: "'ያስተዳደረ'፣ 'አዘጋጀ'፣ 'ተሳካ' የመሳሰሉ ቃላት ይጠቀሙ።"
                }
            }
        }
    };

    // ======================
    // 2. DYNAMIC FAQ LOADER (API)
    // ======================
    async function loadFAQs() {
        try {
            const response = await fetch('https://your-api.com/faqs');
            const faqs = await response.json();
            
            faqs.forEach(faq => {
                if (!knowledgeBase.faq) knowledgeBase.faq = {};
                knowledgeBase.faq[faq.id] = { 
                    response: {
                        en: `<div class="knowledge-card">${faq.answer_en}</div>`,
                        am: `<div class="knowledge-card">${faq.answer_am}</div>`
                    }
                };
            });
        } catch (error) {
            console.error("Failed to load FAQs:", error);
        }
    }

    // ======================
    // 3. AI FALLBACK (OpenAI)
    // ======================
    async function getAIResponse(userInput, lang = 'en') {
        const prompt = lang === 'am' ? 
            "You are a helpful Ethiopian job assistant. Reply in Amharic." :
            "You are a helpful job assistant for Ethiopia. Keep responses concise.";
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": "Bearer YOUR_OPENAI_KEY",
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: userInput }
                ],
                max_tokens: 150
            })
        });
        return (await response.json()).choices[0].message.content;
    }

    // ======================
    // 4. LANGUAGE DETECTION
    // ======================
    function detectLanguage(text) {
        const amharicRegex = /[ሀ-ፕ]/;
        return amharicRegex.test(text) ? 'am' : 'en';
    }

    // ======================
    // 5. CHATBOT LOGIC
    // ======================
    async function sendMessage(userInput = chatbotInput.value.trim()) {
        if (!userInput) return;

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = userInput;
        chatbotMessages.appendChild(userMessage);

        // Detect language
        const lang = detectLanguage(userInput);

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        // Clear input
        chatbotInput.value = '';

        // Generate bot response
        setTimeout(async () => {
            typingIndicator.remove();

            // Step 1: Check hardcoded knowledge base
            const kbAnswer = understandInput(userInput, lang);
            if (kbAnswer.confidence > 70) {
                addBotMessage(kbAnswer.response, lang, kbAnswer.followUp);
                return;
            }

            // Step 2: Check FAQs
            if (knowledgeBase.faq) {
                const faqAnswer = understandInput(userInput, lang);
                if (faqAnswer.confidence > 60) {
                    addBotMessage(faqAnswer.response, lang);
                    return;
                }
            }

            // Step 3: Fallback to AI
            const aiResponse = await getAIResponse(userInput, lang);
            addBotMessage(aiResponse, lang);
        }, 1500);
    }

    // Helper: Add bot message
    function addBotMessage(response, lang, followUp = null) {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerHTML = typeof response === 'string' ? response : response[lang];

        // Add quick replies
        if (followUp) {
            const quickReplies = document.createElement('div');
            quickReplies.className = 'quick-replies';
            
            followUp[lang].forEach(text => {
                const reply = document.createElement('div');
                reply.className = 'quick-reply';
                reply.textContent = text;
                reply.onclick = () => sendMessage(text);
                quickReplies.appendChild(reply);
            });

            botMessage.appendChild(quickReplies);
        }

        chatbotMessages.appendChild(botMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Helper: Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatbotMessages.appendChild(typingDiv);
        return typingDiv;
    }

    // Helper: Understand user input
    function understandInput(input, lang) {
        input = input.toLowerCase();
        let bestMatch = { confidence: 0 };

        // Search knowledge base
        for (const [category, topics] of Object.entries(knowledgeBase)) {
            for (const [topic, data] of Object.entries(topics)) {
                const score = fuzzball.partial_ratio(input, `${category} ${topic}`);
                if (score > bestMatch.confidence) {
                    bestMatch = {
                        confidence: score,
                        response: data.response,
                        followUp: data.followUp
                    };
                }
            }
        }

        return bestMatch;
    }

    // ======================
    // 6. INITIALIZE CHATBOT
    // ======================
    loadFAQs(); // Load FAQs on startup

    // Event listeners
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Welcome message
    setTimeout(() => {
        addBotMessage({
            en: "Welcome! Ask me about jobs, resumes, or interviews.",
            am: "እንኳን ደህና መጡ! ስራ፣ የትምህርት ዝርዝር፣ ወይም ቃለ መጠይቅ ይጠይቁኝ።"
        }, 'en', {
            en: ["How to apply?", "Resume tips", "Interview preparation"],
            am: ["እንዴት ማመልከት ይቻላል?", "የትምህርት ዝርዝር ምክሮች", "የቃለ መጠይቅ እድገት"]
        });
    }, 1000);
});