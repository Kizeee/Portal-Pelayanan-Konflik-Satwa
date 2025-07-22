<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

// --- PROPS & EMITS ---
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])

// --- STATE MANAGEMENT ---
const chatWindow = ref(null)
const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)

// --- HELPER FUNCTIONS ---

// Scroll otomatis ke pesan paling bawah
const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight
    }
  })
}

// Fungsi BARU untuk menghapus percakapan
const clearChat = () => {
  messages.value = [] // Mengosongkan array pesan
  sendMessage('halo') // Memulai kembali dengan sapaan awal
}

// --- API & MESSAGE HANDLING ---

// Mengirim feedback ke server
const sendFeedback = async (message, feedbackType) => {
  message.feedback = feedbackType // Update UI untuk menandai feedback
  try {
    await fetch('http://127.0.0.1:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: message.question, // Membutuhkan pertanyaan asli
        answer: message.text,
        feedback: feedbackType,
      }),
    })
    console.log('Feedback terkirim!')
  } catch (error) {
    console.error('Gagal mengirim feedback:', error)
  }
}

// Fungsi utama untuk mengirim pesan
const sendMessage = async (messageTextOverride) => {
  const text = messageTextOverride || userInput.value.trim()
  if (!text) return

  // Simpan pertanyaan pengguna saat ini
  const userQuestion = text

  // Tambahkan pesan pengguna ke UI
  messages.value.push({
    id: `user-${Date.now()}`,
    text: text,
    sender: 'user',
  })

  if (!messageTextOverride) {
    userInput.value = ''
  }

  isLoading.value = true
  scrollToBottom()

  try {
    const response = await fetch('http://127.0.0.1:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })

    if (!response.ok) {
      // Menangkap error HTTP seperti 404 atau 500
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.response) {
      throw new Error('Format respons dari server tidak valid.')
    }

    // Tambahkan respons bot ke UI
    messages.value.push({
      id: `bot-${Date.now()}`,
      text: data.response,
      sender: 'bot',
      question: userQuestion, // Sertakan pertanyaan asli untuk feedback
      suggestions: data.suggestions || [],
      link: data.link,
      link_text: data.link_text,
      whatsapp_link: data.whatsapp_link,
      social_links: data.social_links || [],
      image_url: data.image_url,
      resorts: data.resorts || [],
      feedback: data.response ? null : undefined, // Inisialisasi status feedback
    })
  } catch (error) {
    console.error('Error:', error)
    let errorMessage = 'Maaf, terjadi kesalahan saat menghubungi server.'
    if (error.message.includes('Failed to fetch')) {
      errorMessage =
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau pastikan server backend berjalan.'
    }

    // Tampilkan pesan error di chat
    messages.value.push({
      id: `error-${Date.now()}`,
      text: errorMessage,
      sender: 'bot',
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// --- LIFECYCLE HOOKS ---

// Panggil "halo" saat komponen pertama kali dimuat
onMounted(() => {
  if (props.show && messages.value.length === 0) {
    sendMessage('halo')
  }
})

// Awasi perubahan pada array pesan untuk auto-scroll
watch(messages, scrollToBottom, { deep: true })

// Awasi prop 'show' untuk memuat pesan awal saat chatbox muncul
watch(
  () => props.show,
  (newValue) => {
    if (newValue && messages.value.length === 0) {
      sendMessage('halo')
    }
  },
)
</script>

<template>
  <div v-if="props.show" class="fixed bottom-24 right-5 z-[2000]">
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <h2>Pusat Bantuan Interaktif</h2>
        <div class="header-buttons">
          <button @click="clearChat" class="header-btn" title="Hapus Percakapan">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <button @click="emit('close')" class="header-btn" title="Tutup">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Jendela Chat -->
      <div class="chat-window" ref="chatWindow">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'message-wrapper',
            message.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper',
          ]"
        >
          <!-- Pesan Pengguna & Bot -->
          <div :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']">
            {{ message.text }}
          </div>
          <span class="timestamp">{{
            new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }}</span>

          <!-- Konten Tambahan dari Bot -->
          <div v-if="message.sender === 'bot'" class="bot-extras">
            <img
              v-if="message.image_url"
              :src="message.image_url"
              alt="Gambar terkait"
              class="bot-image"
            />

            <!-- Daftar Resort -->
            <div v-if="message.resorts && message.resorts.length > 0" class="resort-list">
              <div v-for="resort in message.resorts" :key="resort.name" class="resort-item">
                <div class="resort-name">{{ resort.name }}</div>
                <div class="resort-area">{{ resort.wilayah_kerja }}</div>
                <a :href="resort.location_url" target="_blank" class="map-link"
                  >Lihat Peta Wilayah</a
                >
              </div>
            </div>

            <!-- Tombol Saran -->
            <div
              v-if="message.suggestions && message.suggestions.length > 0"
              class="suggestions-container"
            >
              <button
                v-for="suggestion in message.suggestions"
                :key="suggestion"
                @click="sendMessage(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion }}
              </button>
            </div>

            <!-- Tombol Link -->
            <div class="links-container">
              <a
                v-if="message.link"
                :href="message.link"
                target="_blank"
                class="link-btn simaksi"
                >{{ message.link_text }}</a
              >
              <a
                v-if="message.whatsapp_link"
                :href="`https://wa.me/${message.whatsapp_link.number}`"
                target="_blank"
                class="link-btn whatsapp"
                >{{ message.whatsapp_link.text }}</a
              >
              <a
                v-for="social in message.social_links"
                :key="social.platform"
                :href="social.url"
                target="_blank"
                :class="['link-btn', social.platform.toLowerCase()]"
                >{{ social.text }}</a
              >
            </div>

            <!-- Tombol Feedback -->
            <div v-if="message.feedback === null" class="feedback-container">
              <button
                @click="sendFeedback(message, 'good')"
                class="feedback-btn"
                title="Jawaban membantu"
              >
                👍
              </button>
              <button
                @click="sendFeedback(message, 'bad')"
                class="feedback-btn"
                title="Jawaban tidak membantu"
              >
                👎
              </button>
            </div>
            <div v-else-if="message.feedback" class="feedback-sent">
              <span v-if="message.feedback === 'good'">Terima kasih atas masukannya!</span>
              <span v-else>Terima kasih, kami akan perbaiki.</span>
            </div>
          </div>
        </div>

        <!-- Indikator Loading -->
        <div v-if="isLoading" class="message-wrapper bot-message-wrapper">
          <div class="loading-indicator">
            <span class="dot1"></span><span class="dot2"></span><span class="dot3"></span>
          </div>
        </div>
      </div>

      <!-- Input Chat -->
      <div class="chat-input">
        <input
          type="text"
          v-model="userInput"
          @keydown.enter.prevent="sendMessage()"
          placeholder="Ketik pesan Anda..."
          :disabled="isLoading"
        />
        <button @click="sendMessage()" title="Kirim" :disabled="isLoading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS Anda sebagian besar sudah bagus, hanya beberapa penyesuaian kecil */
.chat-container {
  width: 400px;
  height: 600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}
.chat-header {
  background-color: #386641;
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
  font-size: 1.1rem;
  font-weight: 600;
  flex-grow: 1; /* Membuat judul mengambil sisa ruang */
}
.header-buttons {
  display: flex;
  align-items: center;
  gap: 8px; /* Jarak antar tombol */
}
.chat-window {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f0f2f5;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 90%;
}
.user-message-wrapper {
  align-items: flex-end;
  align-self: flex-end;
}
.bot-message-wrapper {
  align-items: flex-start;
  align-self: flex-start;
}
.message {
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.4;
  word-wrap: break-word;
  text-align: left;
}
.bot-message {
  background-color: #ffffff;
  color: #1c1e21;
  border-bottom-left-radius: 4px;
}
.user-message {
  background-color: #386641;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.suggestions-container,
.links-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.suggestion-btn {
  background-color: #fff;
  border: 1px solid #6a994e;
  color: #386641;
  padding: 10px 15px;
  border-radius: 18px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}
.suggestion-btn:hover {
  background-color: #f7f7f7;
}
.bot-image {
  max-width: 100%;
  border-radius: 12px;
}
/* Penambahan untuk daftar resort */
.resort-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.resort-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}
.resort-name {
  font-weight: bold;
  color: #1c1e21;
  margin-bottom: 5px;
}
.resort-area {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 8px;
}
.map-link {
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 15px;
  font-size: 0.8rem;
  text-align: center;
  align-self: flex-start;
  transition: background-color 0.2s;
}
.map-link:hover {
  background-color: #218838;
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
.link-btn.simaksi {
  background-color: #28a745;
}
.link-btn.whatsapp {
  background-color: #25d366;
}
.link-btn.facebook {
  background-color: #1877f2;
}
.link-btn.instagram {
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
}
.link-btn.youtube {
  background-color: #ff0000;
}
.chat-input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #ddd;
  background-color: #ffffff;
}
.chat-input input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 1rem;
  margin-right: 10px;
  transition: border-color 0.2s;
}
.chat-input input:focus {
  outline: none;
  border-color: #386641;
}
.chat-input input:disabled {
  background-color: #f5f5f5;
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
  transition: background-color 0.2s;
}
.chat-input button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
.loading-indicator {
  display: flex;
  align-items: center;
  background-color: #ffffff;
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
.loading-indicator .dot1 {
  animation-delay: -0.32s;
}
.loading-indicator .dot2 {
  animation-delay: -0.16s;
}
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
.feedback-container {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
.feedback-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}
.feedback-btn:hover {
  background-color: #f0f0f0;
  border-color: #aaa;
}
.feedback-sent {
  color: #6a994e;
  font-size: 0.8rem;
  margin-top: 8px;
  font-style: italic;
}
.header-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
}
</style>
