document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const languageToggle = document.getElementById('languageToggle');
    
    // State
    let currentLanguage = 'en';
    
    // ======================
    // 1. ENHANCED KNOWLEDGE BASE
    // ======================
    const knowledgeBase = {
        "application": {
            "how to apply": {
                response: {
                    en: `<div class="knowledge-card">
                        <div class="knowledge-title">How to Apply for Jobs</div>
                        <div class="knowledge-desc">
                            1. Search jobs on our platform<br>
                            2. Click "Apply" on your chosen job<br>
                            3. Complete the application form<br>
                            4. Submit required documents
                        </div>
                        <a href="/jobs" class="knowledge-link">Browse available jobs →</a>
                    </div>`,
                    am: `<div class="knowledge-card">
                        <div class="knowledge-title">ስራ ለመመልከት መንገድ</div>
                        <div class="knowledge-desc">
                            1. በመድረካችን ላይ ስራዎችን ይፈልጉ<br>
                            2. በመረጡት ስራ ላይ "አመልክት" የሚለውን ይጫኑ<br>
                            3. ማመልከቻውን ይሙሉ<br>
                            4. የሚያስፈልጉ ሰነዶችን ያስገቡ
                        </div>
                    </div>`
                },
                followUp: {
                    en: ["What documents are needed?", "How to track my application?", "Can I apply for multiple jobs?"],
                    am: ["ምን ምን ሰነዶች ያስፈልጋሉ?", "ማመልከቻዬን እንዴት እከታተላለሁ?", "ለብዙ ስራዎች ማመልከት እችላለሁ?"]
                }
            },
            "documents": {
                response: {
                    en: "Typically you need: CV/resume, cover letter, educational certificates, and ID copy. Some jobs may require additional documents.",
                    am: "ብዙውን ጊዜ የሚያስፈልጉ: የትምህርት ዝርዝር፣ የስራ ልምድ ወረቀት፣ የትምህርት ማስረጃዎች፣ የመታወቂያ ማስረጃ። አንዳንድ ስራዎች ተጨማሪ ሰነዶችን ሊጠይቁ ይችላሉ።"
                }
            },
            "track": {
                response: {
                    en: "You can track your applications on the 'My Applications' page. Statuses include: Submitted, Under Review, Interview Scheduled, Rejected, or Hired.",
                    am: "'የእኔ ማመልከቶች' ገጽ ላይ ማመልከቻዎትን መከታተል ይችላሉ። ሁኔታዎች: ቀርቧል፣ በግምገማ ላይ፣ ቃለ መጠይቅ ተዘጋጅቷል፣ ተቀባይነት አላገኘም፣ ተቀብሏል።"
                }
            }
        },
        "resume": {
            "tips": {
                response: {
                    en: `<div class="knowledge-card">
                        <div class="knowledge-title">Resume Writing Tips</div>
                        <div class="knowledge-desc">
                            • Use action verbs (managed, developed, achieved)<br>
                            • Keep it 1-2 pages maximum<br>
                            • Tailor it to each job application<br>
                            • Include quantifiable achievements
                        </div>
                    </div>`,
                    am: `<div class="knowledge-card">
                        <div class="knowledge-title">የትምህርት ዝርዝር ምክሮች</div>
                        <div class="knowledge-desc">
                            • የስራ ቃላት ይጠቀሙ (ያስተዳደረ፣ አዘጋጀ፣ ተሳካ)<br>
                            • ከ1-2 ገጾች አይበልጡ<br>
                            • ለእያንዳንዱ ስራ ብቻ የተዘጋጀ ያድርጉት<br>
                            • በቁጥር የሚለካ ስኬቶችን ያካትቱ
                        </div>
                    </div>`
                }
            },
            "template": {
                response: {
                    en: `<div class="knowledge-card">
                        <div class="knowledge-title">Resume Templates</div>
                        <div class="knowledge-desc">
                            Download professional templates:
                            <a href="/templates/standard" class="knowledge-link">Standard</a> | 
                            <a href="/templates/modern" class="knowledge-link">Modern</a> |
                            <a href="/templates/creative" class="knowledge-link">Creative</a>
                        </div>
                    </div>`,
                    am: `<div class="knowledge-card">
                        <div class="knowledge-title">የትምህርት ዝርዝር አብነቶች</div>
                        <div class="knowledge-desc">
                            አመልካቾችን ያውርዱ:
                            <a href="/templates/standard" class="knowledge-link">መደበኛ</a> | 
                            <a href="/templates/modern" class="knowledge-link">ዘመናዊ</a> |
                            <a href="/templates/creative" class="knowledge-link">ፈጠራዊ</a>
                        </div>
                    </div>`
                }
            }
        },
        "interview": {
            "prepare": {
                response: {
                    en: `<div class="knowledge-card">
                        <div class="knowledge-title">Interview Preparation</div>
                        <div class="knowledge-desc">
                            1. Research the company<br>
                            2. Practice common questions<br>
                            3. Prepare your own questions<br>
                            4. Dress professionally<br>
                            5. Arrive 10 minutes early
                        </div>
                    </div>`,
                    am: `<div class="knowledge-card">
                        <div class="knowledge-title">ለቃለ መጠይቅ እድገት</div>
                        <div class="knowledge-desc">
                            1. ስለ ኩባንያው ይመረምሩ<br>
                            2. የተለመዱ ጥያቄዎችን ይለማመዱ<br>
                            3. የራስዎን ጥያቄዎች ያዘጋጁ<br>
                            4. ብቁ አለባበስ ይልበሱ<br>
                            5. ከ10 ደቂቃ በፊት ይድረሱ
                        </div>
                    </div>`
                }
            },
            "questions": {
                response: {
                    en: "Common interview questions: 1) Tell me about yourself 2) Why do you want this job? 3) What are your strengths? 4) Where do you see yourself in 5 years? 5) Do you have any questions for us?",
                    am: "የተለመዱ የቃለ መጠይቅ ጥያቄዎች: 1) ስለራስዎ ይንገሩን 2) ይህን ስራ የፈለጉት ለምንድን ነው? 3) ጥንካሮችዎ ምንድን ናቸው? 4) እራስዎን በ5 ዓመት ውስጥ የት አይተዋችሁ? 5) ለእኛ ማንኛውም ጥያቄ አለዎት?"
                }
            }
        },
        "general": {
            "about": {
                response: {
                    en: "ስራ-ገበያ is Ethiopia's leading job platform connecting employers with qualified candidates. We offer job postings, resume building, and interview scheduling tools.",
                    am: "ስራ-ገበያ የኢትዮጵያ አለቃ የስራ መድረክ ነው፣ አሰሪዎችን ከብቁ አመልካቾች ጋር የሚያገናኝ። የስራ ማስታወቂያዎችን፣ የትምህርት ዝርዝር አዘጋጅ እና የቃለ መጠይቅ የመዘጋጀት መሳሪያዎችን እናቀርባለን።"
                }
            },
            "contact": {
                response: {
                    en: "Contact us at: Phone: +251 123 456 789 | Email: info@serategna.com | Office: Addis Ababa, Bole Road",
                    am: "ያግኙን፡ ስልክ፡ +251 123 456 789 | ኢሜይል፡ info@serategna.com | ቢሮ፡ አዲስ አበባ፣ ቦሌ መንገድ"
                }
            }
        }
    };

    // Common questions with quick responses
    const commonResponses = {
        "hi": {
            en: "Hello! How can I help you with your job search today?",
            am: "ሰላም! በስራ ፍለጋዎ እንዴት ልርዳችሁ እችላለሁ?"
        },
        "hello": {
            en: "Hi there! Ask me about jobs, resumes, or interviews.",
            am: "ሰላም! ስለ ስራዎች፣ የትምህርት ዝርዝር፣ ወይም ቃለ መጠይቅ ጠይቁኝ።"
        },
        "thanks": {
            en: "You're welcome! Is there anything else I can help with?",
            am: "አይረበሽም! ሌላ ልርዳችሁ የምችለው ነገር አለ?"
        },
        "thank you": {
            en: "Happy to help! Let me know if you have other questions.",
            am: "ለመርዳት ደስ ብሎኛል! ሌላ ጥያቄ ካለዎት ይጠቀሱኝ።"
        },
        "bye": {
            en: "Goodbye! Come back if you need more job search help.",
            am: "ደህና ሁኑ! ተጨማሪ እርዳታ ከፈለጉ ይመለሱ።"
        }
    };

    // ======================
    // 2. LANGUAGE TOGGLE
    // ======================
    languageToggle.addEventListener('click', function() {
        currentLanguage = currentLanguage === 'en' ? 'am' : 'en';
        this.textContent = currentLanguage === 'en' ? 'AM' : 'EN';
        const placeholder = currentLanguage === 'en' 
            ? "Ask about jobs, resumes, or interviews..." 
            : "ስለ ስራ፣ የትምህርት ዝርዝር፣ ወይም ቃለ መጠይቅ ጠይቅ...";
        chatbotInput.placeholder = placeholder;
    });

    // ======================
    // 3. CHATBOT FUNCTIONS
    // ======================
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return typingDiv;
    }

    function addBotMessage(content, followUpOptions = null) {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        
        if (typeof content === 'string') {
            botMessage.textContent = content;
        } else {
            botMessage.innerHTML = content[currentLanguage] || content.en || content;
        }

        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        botMessage.appendChild(timeDiv);

        // Add quick replies if available
        if (followUpOptions) {
            const quickRepliesDiv = document.createElement('div');
            quickRepliesDiv.className = 'quick-replies';
            
            const options = followUpOptions[currentLanguage] || followUpOptions.en || followUpOptions;
            options.forEach(option => {
                const reply = document.createElement('div');
                reply.className = 'quick-reply';
                reply.textContent = option;
                reply.onclick = () => sendMessage(option);
                quickRepliesDiv.appendChild(reply);
            });
            
            botMessage.appendChild(quickRepliesDiv);
        }

        // Add feedback buttons
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'chatbot-feedback';
        feedbackDiv.innerHTML = `
            <button class="feedback-btn" onclick="this.innerHTML = '<i class=\'fas fa-check\'></i> Thanks!'">
                <i class="fas fa-thumbs-up"></i> Helpful
            </button>
            <button class="feedback-btn" onclick="this.innerHTML = '<i class=\'fas fa-times\'></i> Sorry!'">
                <i class="fas fa-thumbs-down"></i> Not helpful
            </button>
        `;
        botMessage.appendChild(feedbackDiv);

        chatbotMessages.appendChild(botMessage);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function understandInput(input) {
        input = input.toLowerCase().trim();
        
        // 1. Check common responses first
        for (const [keyword, response] of Object.entries(commonResponses)) {
            if (fuzzball.ratio(input, keyword) > 85) {
                return {
                    type: "common",
                    response: response
                };
            }
        }
        
        // 2. Search knowledge base
        let bestMatch = { confidence: 0 };
        
        for (const [category, topics] of Object.entries(knowledgeBase)) {
            for (const [topic, data] of Object.entries(topics)) {
                // Check both category and topic matches
                const categoryMatch = fuzzball.partial_ratio(input, category);
                const topicMatch = fuzzball.partial_ratio(input, topic);
                const combinedMatch = fuzzball.partial_ratio(input, `${category} ${topic}`);
                
                const score = Math.max(categoryMatch, topicMatch, combinedMatch);
                
                if (score > bestMatch.confidence) {
                    bestMatch = {
                        confidence: score,
                        data: data
                    };
                }
            }
        }

        if (bestMatch.confidence > 65) {
            return {
                type: "knowledge",
                response: bestMatch.data.response,
                followUp: bestMatch.data.followUp || null
            };
        }
        
        // 3. Fallback for unknown questions
        return {
            type: "fallback",
            response: {
                en: "I'm not sure I understand. Here are some things I can help with:",
                am: "አልገባኝም። ሊጠይቁ የሚችሉ ነገሮች:"
            },
            followUp: {
                en: ["How to apply for jobs?", "Resume writing tips", "Interview preparation"],
                am: ["ስራ እንዴት ማመልከት ይቻላል?", "የትምህርት ዝርዝር ምክሮች", "ለቃለ መጠይቅ እድገት"]
            }
        };
    }

    async function sendMessage(userInput = chatbotInput.value.trim()) {
        if (!userInput) return;

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = userInput;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        userMessage.appendChild(timeDiv);
        
        chatbotMessages.appendChild(userMessage);
        chatbotInput.value = '';
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        // Process after delay
        setTimeout(() => {
            typingIndicator.remove();
            
            // Get response
            const { type, response, followUp } = understandInput(userInput);
            addBotMessage(response, followUp);
        }, 1000 + Math.random() * 1000);
    }

    // ======================
    // 4. EVENT LISTENERS
    // ======================
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ======================
    // 5. INITIALIZE CHATBOT
    // ======================
    // Welcome message
    setTimeout(() => {
        addBotMessage({
            en: "Welcome to ስራ-ገበያ Job Assistant! How can I help you today?",
            am: "ወደ ስራ-ገበያ የስራ ረዳት እንኳን ደህና መጡ! ዛሬ እንዴት ልርዳዎት እችላለሁ?"
        }, {
            en: ["How to apply for jobs?", "Resume help", "Interview tips"],
            am: ["ስራ እንዴት ማመልከት ይቻላል?", "የትምህርት ዝርዝር እርዳታ", "የቃለ መጠይቅ ምክሮች"]
        });
    }, 500);
});