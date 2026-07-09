/**
 * RoomFlow - Oda JavaScript
 * ====================================
 * WebRTC ve Socket.io işlemleri
 */

const socket = io();
let localStream;
let peerConnections = {};
let remoteStreams = {};
let screenStream = null;
const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: 'turn:' + (window.TURN_SERVER_URL || 'openrelay.metered.ca:80'),
      username: window.TURN_USERNAME || 'openrelayproject',
      credential: window.TURN_PASSWORD || 'openrelayproject'
    }
  ]
};

// ===== BAŞLATMA =====
async function initRoom() {
  console.log('🎬 Oda başlatılıyor...');
  
  try {
    // Lokal stream al
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 1280, height: 720 }
    });
    
    document.getElementById('localVideo').srcObject = localStream;
    console.log('✅ Lokal stream başlatıldı');
    
    // Odaya katıl
    socket.emit('room:join', {
      roomId: ROOM_ID,
      userId: 'user_' + Date.now(),
      username: 'Kullanıcı ' + Math.random().toString(36).substr(2, 9)
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
    alert('Mikrofon/Kamera izni gerekli!');
  }
}

// ===== SOCKET.IO EVENTS =====

// Katılımcı listesi güncelleme
socket.on('room:participants', (data) => {
  console.log('👥 Katılımcılar güncelendi:', data.participants);
  
  const participantsList = document.getElementById('participantsList');
  participantsList.innerHTML = '';
  
  let count = 0;
  data.participants.forEach(participant => {
    count++;
    const item = document.createElement('div');
    item.className = 'participant-item';
    item.innerHTML = `
      <div class="participant-status"></div>
      <span class="participant-name">${participant.username || 'Misafir'}</span>
      <div class="participant-icons">
        ${participant.micEnabled !== false ? '🎙️' : '🔇'}
        ${participant.cameraEnabled !== false ? '📷' : '❌'}
      </div>
    `;
    participantsList.appendChild(item);
  });
  
  document.getElementById('participantCount').textContent = count;
});

// WebRTC Offer
socket.on('peer:offer', async (data) => {
  console.log('📤 Offer alındı:', data.from);
  
  const peerConnection = createPeerConnection(data.from);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
  
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  
  socket.emit('peer:answer', {
    to: data.from,
    from: socket.id,
    answer: answer
  });
});

// WebRTC Answer
socket.on('peer:answer', async (data) => {
  console.log('📥 Answer alındı:', data.from);
  
  const peerConnection = peerConnections[data.from];
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }
});

// ICE Candidate
socket.on('peer:ice-candidate', async (data) => {
  const peerConnection = peerConnections[data.from];
  if (peerConnection && data.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('ICE error:', error);
    }
  }
});

// Kullanıcı bağlantısı koptu
socket.on('user:disconnected', (data) => {
  console.log('👋 Kullanıcı ayrıldı:', data.socketId);
  
  const peerConnection = peerConnections[data.socketId];
  if (peerConnection) {
    peerConnection.close();
    delete peerConnections[data.socketId];
  }
  
  const videoContainer = document.querySelector(`[data-socket-id="${data.socketId}"]`);
  if (videoContainer) {
    videoContainer.remove();
  }
});

// ===== PEER CONNECTION =====
function createPeerConnection(remoteSocketId) {
  console.log('🔗 Peer bağlantısı oluşturuluyor:', remoteSocketId);
  
  const peerConnection = new RTCPeerConnection(STUN_SERVERS);
  peerConnections[remoteSocketId] = peerConnection;
  
  // Lokal stream'i ekle
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  // Remote stream
  peerConnection.ontrack = (event) => {
    console.log('📹 Remote stream alındı:', remoteSocketId);
    remoteStreams[remoteSocketId] = event.streams[0];
    addVideoElement(remoteSocketId, event.streams[0]);
  };
  
  // ICE Candidate
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('peer:ice-candidate', {
        to: remoteSocketId,
        from: socket.id,
        candidate: event.candidate
      });
    }
  };
  
  // Connection State
  peerConnection.onconnectionstatechange = () => {
    console.log('🔌 Bağlantı durumu:', peerConnection.connectionState);
  };
  
  return peerConnection;
}

function addVideoElement(socketId, stream) {
  let videoContainer = document.querySelector(`[data-socket-id="${socketId}"]`);
  
  if (!videoContainer) {
    videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.setAttribute('data-socket-id', socketId);
    videoContainer.innerHTML = `
      <video autoplay playsinline></video>
      <div class="video-label">Konuk</div>
      <div class="video-stats"></div>
    `;
    document.getElementById('videoGrid').appendChild(videoContainer);
  }
  
  const video = videoContainer.querySelector('video');
  video.srcObject = stream;
}

// ===== CONTROLS =====
let micEnabled = true;
let cameraEnabled = true;
let screenSharing = false;

document.getElementById('btnMic').addEventListener('click', () => {
  micEnabled = !micEnabled;
  localStream.getAudioTracks().forEach(track => {
    track.enabled = micEnabled;
  });
  
  const btn = document.getElementById('btnMic');
  btn.classList.toggle('active', micEnabled);
  
  socket.emit('control:mic-toggle', {
    roomId: ROOM_ID,
    enabled: micEnabled
  });
  
  console.log('🎙️ Mikrofon:', micEnabled ? 'AÇIK' : 'KAPAL');
});

document.getElementById('btnCamera').addEventListener('click', () => {
  cameraEnabled = !cameraEnabled;
  localStream.getVideoTracks().forEach(track => {
    track.enabled = cameraEnabled;
  });
  
  const btn = document.getElementById('btnCamera');
  btn.classList.toggle('active', cameraEnabled);
  
  console.log('📷 Kamera:', cameraEnabled ? 'AÇIK' : 'KAPAL');
});

document.getElementById('btnScreen').addEventListener('click', async () => {
  try {
    if (!screenSharing) {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      screenSharing = true;
      document.getElementById('btnScreen').classList.add('active');
      console.log('🖥️ Ekran paylaşımı başladı');
      
      // Tüm peer'lara gönder
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peerConnections).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });
      
      screenStream.getVideoTracks()[0].onended = () => {
        screenSharing = false;
        document.getElementById('btnScreen').classList.remove('active');
        console.log('🖥️ Ekran paylaşımı kapandı');
      };
    } else {
      screenStream.getTracks().forEach(track => track.stop());
      screenSharing = false;
      document.getElementById('btnScreen').classList.remove('active');
      
      // Kamera takılsın
      const cameraTrack = localStream.getVideoTracks()[0];
      Object.values(peerConnections).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      });
    }
  } catch (error) {
    console.error('Ekran paylaşım hatası:', error);
  }
});

// Linki kopyala
document.getElementById('btnCopyLink').addEventListener('click', () => {
  const link = window.location.href;
  navigator.clipboard.writeText(link);
  alert('✅ Link kopyalandı!');
});

// Odadan ayrıl
function leaveRoom() {
  if (confirm('Odadan ayrılmak istediğinize emin misiniz?')) {
    socket.emit('room:leave', { roomId: ROOM_ID });
    
    // Stream'leri kapat
    localStream.getTracks().forEach(track => track.stop());
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Peer connections'ı kapat
    Object.values(peerConnections).forEach(pc => pc.close());
    
    // Ana sayfaya dön
    window.location.href = '/';
  }
}

// ===== BAŞLATMA =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 Oda JavaScript yüklendi');
  initRoom();
});
