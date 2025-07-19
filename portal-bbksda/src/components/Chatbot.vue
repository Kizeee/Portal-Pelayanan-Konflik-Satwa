<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';

// --- PROPS & EMITS UNTUK KONTROL BUKA/TUTUP ---
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['close']);


// --- STATE MANAGEMENT (diadaptasi dari test_FAQ.html) ---
const chatWindow = ref(null);
const userInput = ref('');
const messages = ref([]);
let lastUserQuestion = '';

// --- FUNGSI-FUNGSI (diadaptasi dari test_FAQ.html) ---

// Fungsi untuk scroll otomatis ke pesan paling bawah
const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

// Fungsi untuk menangani klik pada tombol saran
const handleSuggestionClick = (suggestionText) => {
  sendMessage(suggestionText);
};

// Fungsi untuk mengirim feedback (jempol naik/turun)
const sendFeedback = async (message, feedbackType) => {
  message.feedback = feedbackType; // Update UI untuk menandai feedback sudah diberikan
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
    console.log('Feedback terkirim!');
  } catch (error) {
    console.error('Gagal mengirim feedback:', error);
  }
};

// Fungsi utama untuk mengirim pesan ke backend Python
const sendMessage = async (messageTextOverride) => {
  const messageText = messageTextOverride || userInput.value.trim();
  if (messageText === '') return;

  lastUserQuestion = messageText;
  
  // Tambah pesan pengguna ke tampilan
  messages.value.push({ id: Date.now(), text: messageText, sender: 'user' });
  scrollToBottom();

  if (!messageTextOverride) {
    userInput.value = '';
  }

  // Tampilkan indikator "mengetik..."
  messages.value.push({ id: 'loading', sender: 'loading' });
  scrollToBottom();

  try {
    const response = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) throw new Error('Gagal menghubungi server.');
    const data = await response.json();
    
    // Hapus indikator "mengetik..."
    messages.value = messages.value.filter(m => m.id !== 'loading');
    
    // Tambahkan respons dari bot ke tampilan
    messages.value.push({
      id: Date.now() + 1,
      text: data.response,
      sender: 'bot',
      suggestions: data.suggestions || [],
      link: data.link,
      link_text: data.link_text,
      whatsapp_link: data.whatsapp_link,
      social_links: data.social_links || [],
      image_url: data.image_url,
      feedback: data.response ? null : undefined, // Beri opsi feedback jika ada respons
    });

  } catch (error) {
    console.error('Error:', error);
    messages.value = messages.value.filter(m => m.id !== 'loading');
    messages.value.push({
      id: Date.now() + 1,
      text: 'Maaf, terjadi kesalahan. Pastikan server bantuan (Python) sedang berjalan.',
      sender: 'bot'
    });
  }
};

// Panggil "halo" saat komponen pertama kali dimuat untuk memicu sapaan
onMounted(() => {
  if (messages.value.length === 0) {
    sendMessage('halo');
  }
});

// Awasi perubahan pada array pesan untuk auto-scroll
watch(messages, scrollToBottom, { deep: true });
</script>

<template>
  <div v-if="props.show" class="fixed bottom-24 right-5 z-[2000]">
    
    <div class="chat-container">
      <div class="chat-header">
        <h2>Pusat Bantuan Interaktif</h2>
        <button @click="emit('close')" class="header-btn" title="Tutup">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="chat-window" ref="chatWindow">
        <div v-for="message in messages" :key="message.id" 
             :class="['message-wrapper', message.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper']">

          <div v-if="message.sender === 'loading'" class="loading-indicator">
            <span class="dot1"></span><span class="dot2"></span><span class="dot3"></span>
          </div>
          
          <div v-else :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']">
            {{ message.text }}
          </div>
          
          <span v-if="message.sender !== 'loading'" class="timestamp">
            {{ new Date(message.id).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
          </span>

          <div v-if="message.sender === 'bot'" class="bot-extras">
            <img v-if="message.image_url" :src="message.image_url" alt="Gambar terkait" class="bot-image">

            <div v-if="message.suggestions && message.suggestions.length > 0" class="suggestions-container">
              <button v-for="suggestion in message.suggestions" :key="suggestion" @click="handleSuggestionClick(suggestion)" class="suggestion-btn">
                {{ suggestion }}
              </button>
            </div>
            
            <div class="links-container">
              <a v-if="message.link" :href="message.link" target="_blank" class="link-btn simaksi">{{ message.link_text }}</a>
              <a v-if="message.whatsapp_link" :href="`https://wa.me/${message.whatsapp_link.number}`" target="_blank" class="link-btn whatsapp">{{ message.whatsapp_link.text }}</a>
              <a v-for="social in message.social_links" :key="social.platform" :href="social.url" target="_blank" :class="['link-btn', social.platform.toLowerCase()]">{{ social.text }}</a>
            </div>
            
            <div v-if="message.feedback === null" class="feedback-container">
              <button @click="sendFeedback(message, 'good')" class="feedback-btn" title="Jawaban membantu">👍</button>
              <button @click="sendFeedback(message, 'bad')" class="feedback-btn" title="Jawaban tidak membantu">👎</button>
            </div>
            <div v-else class="feedback-sent">
              <span v-if="message.feedback === 'good'">Terima kasih atas masukannya!</span>
              <span v-else>Terima kasih, kami akan perbaiki.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input type="text" v-model="userInput" @keydown.enter.prevent="sendMessage()" placeholder="Ketik pesan Anda...">
        <button @click="sendMessage()" title="Kirim">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ini adalah CSS yang diadaptasi dari test_FAQ.html */
.chat-container {
  width: 400px;
  height: 600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.chat-header {
  background-color: #386641; /* Warna hijau brand Anda */
  color: white;
  padding: 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
  flex-grow: 1;
}
.chat-window {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 90%;
}
.user-message-wrapper { align-items: flex-end; align-self: flex-end; }
.bot-message-wrapper { align-items: flex-start; align-self: flex-start;}
.message {
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.4;
  word-wrap: break-word;
  text-align: left;
}
.bot-message {
  background-color: #e9ebee;
  color: #1c1e21;
  border-bottom-left-radius: 4px;
}
.user-message {
  background-color: #386641; /* Warna hijau brand Anda */
  color: white;
  border-bottom-right-radius: 4px;
}
.timestamp {
  font-size: 0.7rem;
  color: #90949c;
  margin-top: 4px;
  padding: 0 8px;
}
.bot-extras {
  width: 100%;
}
.suggestions-container, .links-container, .feedback-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.feedback-container {
  flex-direction: row;
}
.suggestion-btn {
  background-color: #fff;
  border: 1px solid #6A994E;
  color: #386641;
  padding: 10px 15px;
  border-radius: 18px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}
.suggestion-btn:hover { background-color: #f0f2f5; }
.bot-image {
  max-width: 100%;
  border-radius: 12px;
  margin-top: 8px;
}
.link-btn {
  display: block;
  color: white !important;
  padding: 12px 15px;
  border-radius: 18px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
}
.link-btn.simaksi { background-color: #28a745; }
.link-btn.whatsapp { background-color: #25D366; }
.link-btn.facebook { background-color: #1877F2; }
.link-btn.instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
.link-btn.youtube { background-color: #FF0000; }
.chat-input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #ddd;
}
.chat-input input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 1rem;
  margin-right: 10px;
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
  justify-content: center;
  align-items: center;
}
.loading-indicator {
  display: flex;
  align-items: center;
  background-color: #e9ebee;
  border-radius: 18px;
  padding: 12px 15px;
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
.feedback-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
}
.feedback-sent {
  color: #6A994E;
  font-size: 0.8rem;
  margin-top: 8px;
}
.header-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
}
</style>