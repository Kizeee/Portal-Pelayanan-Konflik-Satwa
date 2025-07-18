<script setup>
import { ref, onMounted, nextTick } from 'vue';

const chatWindow = ref(null);
const userInput = ref('');
let lastUserQuestion = '';

const messages = ref([]);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

const addMessage = (text, sender, data = {}) => {
  const { suggestions = [], link, link_text, whatsapp_link, social_links = [], image_url } = data;
  
  messages.value.push({
    id: Date.now() + Math.random(),
    text,
    sender,
    suggestions,
    link,
    link_text,
    whatsapp_link,
    social_links,
    image_url,
    feedback: null,
  });

  scrollToBottom();
};

const handleSuggestionClick = (suggestionText) => {
  sendMessage(suggestionText);
};

const showLoadingIndicator = () => {
  messages.value.push({ id: 'loading', sender: 'loading' });
  scrollToBottom();
};

const hideLoadingIndicator = () => {
  messages.value = messages.value.filter(m => m.id !== 'loading');
};

const sendMessage = async (messageTextOverride) => {
  const messageText = messageTextOverride || userInput.value.trim();
  if (messageText === '') return;

  lastUserQuestion = messageText;
  addMessage(messageText, 'user');
  userInput.value = '';
  showLoadingIndicator();

  try {
    const response = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) throw new Error('Gagal menghubungi server.');
    const data = await response.json();
    
    setTimeout(() => {
      hideLoadingIndicator();
      addMessage(data.response, 'bot', data);
    }, 500);

  } catch (error) {
    console.error('Error:', error);
    hideLoadingIndicator();
    addMessage('Maaf, terjadi kesalahan. Pastikan server bantuan sedang berjalan dan coba lagi nanti.', 'bot');
  }
};

const sendFeedback = async (message, feedbackType) => {
  message.feedback = feedbackType; // Update feedback status
  try {
    await fetch('http://127.0.0.1:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: lastUserQuestion,
        answer: message.text,
        feedback: feedbackType,
      }),
    });
    console.log('Feedback sent!');
  } catch (error) {
    console.error('Failed to send feedback:', error);
  }
};

onMounted(() => {
  // Kirim "halo" untuk memicu sapaan real-time dari backend
  sendMessage('halo');
});
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Pusat Bantuan Interaktif</h2>
      <p>Tanyakan apa saja seputar BKSDA Riau</p>
    </div>
    <div class="chat-window" ref="chatWindow">
      <div v-for="message in messages" :key="message.id" class="message-wrapper">
        <div v-if="message.sender === 'loading'" class="loading-indicator">
          <span class="dot1"></span><span class="dot2"></span><span class="dot3"></span>
        </div>
        
        <div v-else :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']">
          {{ message.text }}
        </div>
        
        <div v-if="message.sender === 'bot'" class="bot-extras">
          <!-- PERUBAHAN: Tampilkan gambar jika ada -->
          <img v-if="message.image_url" :src="message.image_url" alt="Gambar terkait" class="chat-image">

          <div v-if="message.suggestions && message.suggestions.length > 0" class="suggestions-container">
            <button v-for="suggestion in message.suggestions" :key="suggestion" @click="handleSuggestionClick(suggestion)" class="suggestion-btn">
              {{ suggestion }}
            </button>
          </div>
          
          <div v-if="message.social_links && message.social_links.length > 0" class="social-links-container">
             <a v-for="social in message.social_links" :key="social.platform" :href="social.url" target="_blank" :class="['link-btn', social.platform.toLowerCase()]">{{ social.text }}</a>
          </div>

          <div v-if="message.whatsapp_link" class="social-links-container">
            <a :href="`https://wa.me/${message.whatsapp_link.number}`" target="_blank" class="link-btn whatsapp">{{ message.whatsapp_link.text }}</a>
          </div>

          <div v-if="message.link && message.link_text" class="social-links-container">
            <a :href="message.link" target="_blank" class="link-btn simaksi">{{ message.link_text }}</a>
          </div>
          
          <div v-if="!message.feedback" class="feedback-container">
            <button @click="sendFeedback(message, 'good')" class="feedback-btn" title="Jawaban membantu">👍</button>
            <button @click="sendFeedback(message, 'bad')" class="feedback-btn" title="Jawaban tidak membantu">👎</button>
          </div>
          <div v-else class="feedback-sent">
            <span v-if="message.feedback === 'good'" class="text-green-600 text-sm">Terima kasih atas masukannya!</span>
            <span v-else class="text-red-600 text-sm">Terima kasih, kami akan perbaiki.</span>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" v-model="userInput" @keydown.enter="sendMessage()" placeholder="Ketik pesan Anda...">
      <button @click="sendMessage()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 600px;
  height: 70vh;
  min-height: 500px;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  margin: auto;
}
.chat-header {
  background-color: #386641; /* brand-green */
  color: white;
  padding: 1rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  text-align: center;
}
.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
.chat-header p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}
.chat-window {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.message {
  padding: 0.75rem 1rem;
  border-radius: 1.25rem;
  max-width: 80%;
  line-height: 1.5;
  word-wrap: break-word;
}
.bot-message {
  background-color: #f3f4f6; /* gray-100 */
  color: #1f2937; /* gray-800 */
  align-self: flex-start;
  border-bottom-left-radius: 0.25rem;
}
.user-message {
  background-color: #386641; /* brand-green */
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0.25rem;
}
.bot-extras {
  align-self: flex-start;
  max-width: 80%;
  margin-top: 0.5rem;
}
.chat-image {
  max-width: 100%;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}
.suggestions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-self: flex-start;
}
.suggestion-btn {
  background-color: #fff;
  border: 1px solid #6A994E; /* brand-green-light */
  color: #386641;
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}
.suggestion-btn:hover {
  background-color: #f7fafc;
}
.link-btn {
  display: inline-block;
  color: white !important;
  padding: 0.75rem 1rem;
  border-radius: 1.25rem;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.link-btn:hover { opacity: 0.9; }
.link-btn.simaksi { background-color: #28a745; }
.link-btn.whatsapp { background-color: #25D366; }
.link-btn.facebook { background-color: #1877F2; }
.link-btn.instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
.link-btn.youtube { background-color: #FF0000; }

.social-links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.chat-input {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}
.chat-input input {
  flex-grow: 1;
  border: 1px solid #d1d5db;
  border-radius: 1.25rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  margin-right: 0.75rem;
}
.chat-input button {
  background-color: #386641;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}
.chat-input button:hover {
  background-color: #6A994E;
}
.loading-indicator {
  display: flex;
  align-items: center;
  background-color: #e9ebee;
  border-radius: 18px;
  padding: 12px 15px;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.loading-indicator span {
  height: 8px;
  width: 8px;
  background-color: #90949c;
  border-radius: 50%;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}
.loading-indicator .dot1 { animation-delay: -0.32s; }
.loading-indicator .dot2 { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
.feedback-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-self: flex-start;
}
.feedback-sent {
  margin-top: 0.5rem;
}
.feedback-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feedback-btn:hover {
  background-color: #f3f4f6;
}
</style>