
import { toast } from "sonner";

// Interface para os participantes
export interface JitsiParticipant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
}

// Interface para callbacks de eventos
interface JitsiEventHandlers {
  onParticipantJoined?: (participant: JitsiParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onAudioMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  onVideoMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  onConnectionStatusChanged?: (status: string) => void;
  onTranscriptionReceived?: (text: string, participantId: string) => void;
}

class JitsiManager {
  private connection: any = null;
  private room: any = null;
  private localTracks: any[] = [];
  private remoteTracks: Record<string, any[]> = {};
  private participants: Record<string, JitsiParticipant> = {};
  private eventHandlers: JitsiEventHandlers = {};
  private userName: string = "You (Host)";
  private roomName: string = "";
  private domain: string = "meet.jit.si";
  private isInitialized: boolean = false;
  private isJoined: boolean = false;

  constructor() {
    // Carrega o script Jitsi Meet
    this.loadJitsiMeetScript();
  }

  private loadJitsiMeetScript() {
    if (window.JitsiMeetJS) {
      this.isInitialized = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/libs/lib-jitsi-meet.min.js';
    script.async = true;
    script.onload = () => {
      this.initJitsiMeet();
    };
    document.body.appendChild(script);
  }

  private initJitsiMeet() {
    if (!window.JitsiMeetJS) {
      setTimeout(() => this.initJitsiMeet(), 100);
      return;
    }

    const JitsiMeetJS = window.JitsiMeetJS;
    
    JitsiMeetJS.init();
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

    this.isInitialized = true;
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public async joinRoom(roomName: string, displayName: string) {
    if (!this.isInitialized) {
      setTimeout(() => this.joinRoom(roomName, displayName), 100);
      return;
    }

    try {
      this.roomName = roomName;
      this.userName = displayName;
      const JitsiMeetJS = window.JitsiMeetJS;
      
      // Configurações de conexão
      const options = {
        hosts: {
          domain: this.domain,
          muc: `conference.${this.domain}`
        },
        bosh: `https://${this.domain}/http-bind`,
        clientNode: 'http://jitsi.org/jitsimeet',
      };

      this.connection = new JitsiMeetJS.JitsiConnection(null, null, options);

      this.connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        this.onConnectionSuccess.bind(this)
      );
      
      this.connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        this.onConnectionFailed.bind(this)
      );
      
      this.connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        this.onConnectionDisconnected.bind(this)
      );

      this.connection.connect();
      
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error("Erro ao entrar na sala de chamada");
      return false;
    }
  }

  private async onConnectionSuccess() {
    try {
      if (this.eventHandlers.onConnectionStatusChanged) {
        this.eventHandlers.onConnectionStatusChanged("connected");
      }
      
      const JitsiMeetJS = window.JitsiMeetJS;
      this.room = this.connection.initJitsiConference(this.roomName, {});
      
      this.room.on(JitsiMeetJS.events.conference.TRACK_ADDED, this.onRemoteTrackAdded.bind(this));
      this.room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRemoteTrackRemoved.bind(this));
      this.room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.onConferenceJoined.bind(this));
      this.room.on(JitsiMeetJS.events.conference.USER_JOINED, this.onUserJoined.bind(this));
      this.room.on(JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft.bind(this));
      this.room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.onTrackMuteChanged.bind(this));
      this.room.on(JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
      
      // Transcrição (se disponível)
      if (this.room.isTranscriptionSupported()) {
        this.room.on(JitsiMeetJS.events.conference.TRANSCRIPTION_STATUS_CHANGED, 
          (status: string) => console.log('Transcription status:', status));
        this.room.on(JitsiMeetJS.events.conference.TRANSCRIPT_RECEIVED, 
          (participant: any, text: string) => {
            if (this.eventHandlers.onTranscriptionReceived) {
              this.eventHandlers.onTranscriptionReceived(text, participant.getId());
            }
          });
      }

      this.room.join();
      this.room.setDisplayName(this.userName);

      // Iniciar com áudio
      try {
        const localTracks = await JitsiMeetJS.createLocalTracks({ devices: ['audio'] });
        this.localTracks = localTracks;
        
        // Adiciona tracks locais à conferência
        for (const track of localTracks) {
          this.room.addTrack(track);
        }
        
      } catch (error) {
        console.error('Failed to create local tracks', error);
        toast.error("Não foi possível acessar seu microfone");
      }
      
    } catch (error) {
      console.error('Error during connection setup:', error);
      toast.error("Erro ao configurar a chamada");
    }
  }

  private onConnectionFailed() {
    console.error('Connection failed!');
    toast.error("Falha na conexão com o servidor de chamadas");
    
    if (this.eventHandlers.onConnectionStatusChanged) {
      this.eventHandlers.onConnectionStatusChanged("failed");
    }
  }

  private onConnectionDisconnected() {
    console.log('Connection disconnected!');
    
    if (this.eventHandlers.onConnectionStatusChanged) {
      this.eventHandlers.onConnectionStatusChanged("disconnected");
    }
  }

  private onConferenceJoined() {
    console.log('Conference joined!');
    this.isJoined = true;
    
    // Adiciona o usuário local como participante
    const localParticipant: JitsiParticipant = {
      id: 'host',
      name: this.userName,
      status: "connected",
      audio: true,
      video: false
    };
    
    this.participants['host'] = localParticipant;
    
    if (this.eventHandlers.onParticipantJoined) {
      this.eventHandlers.onParticipantJoined(localParticipant);
    }
  }

  private onUserJoined(id: string, user: any) {
    const displayName = user.getDisplayName() || `Participant ${Object.keys(this.participants).length + 1}`;
    
    const participant: JitsiParticipant = {
      id,
      name: displayName,
      status: "connected",
      audio: true,
      video: false
    };
    
    this.participants[id] = participant;
    
    if (this.eventHandlers.onParticipantJoined) {
      this.eventHandlers.onParticipantJoined(participant);
    }
  }

  private onUserLeft(id: string) {
    if (this.eventHandlers.onParticipantLeft) {
      this.eventHandlers.onParticipantLeft(id);
    }
    
    delete this.participants[id];
    delete this.remoteTracks[id];
  }

  private onRemoteTrackAdded(track: any) {
    if (track.isLocal()) {
      return;
    }
    
    const participantId = track.getParticipantId();
    
    if (!this.remoteTracks[participantId]) {
      this.remoteTracks[participantId] = [];
    }
    
    this.remoteTracks[participantId].push(track);
    
    // Atualiza o estado de áudio/vídeo do participante
    if (this.participants[participantId]) {
      const participant = this.participants[participantId];
      if (track.getType() === 'audio') {
        participant.audio = !track.isMuted();
      } else if (track.getType() === 'video') {
        participant.video = !track.isMuted();
      }
      
      if (track.getType() === 'audio' && this.eventHandlers.onAudioMuteStatusChanged) {
        this.eventHandlers.onAudioMuteStatusChanged(participantId, track.isMuted());
      } else if (track.getType() === 'video' && this.eventHandlers.onVideoMuteStatusChanged) {
        this.eventHandlers.onVideoMuteStatusChanged(participantId, track.isMuted());
      }
    }
  }

  private onRemoteTrackRemoved(track: any) {
    const participantId = track.getParticipantId();
    
    if (this.remoteTracks[participantId]) {
      const idx = this.remoteTracks[participantId].indexOf(track);
      if (idx !== -1) {
        this.remoteTracks[participantId].splice(idx, 1);
      }
    }
  }

  private onTrackMuteChanged(track: any) {
    const participantId = track.getParticipantId() || 'host';
    
    if (track.getType() === 'audio') {
      const muted = track.isMuted();
      if (this.participants[participantId]) {
        this.participants[participantId].audio = !muted;
      }
      
      if (this.eventHandlers.onAudioMuteStatusChanged) {
        this.eventHandlers.onAudioMuteStatusChanged(participantId, muted);
      }
    } else if (track.getType() === 'video') {
      const muted = track.isMuted();
      if (this.participants[participantId]) {
        this.participants[participantId].video = !muted;
      }
      
      if (this.eventHandlers.onVideoMuteStatusChanged) {
        this.eventHandlers.onVideoMuteStatusChanged(participantId, muted);
      }
    }
  }

  private onMessageReceived(participant: any, message: any) {
    console.log('Message received:', message);
  }

  public getAllParticipants(): JitsiParticipant[] {
    return Object.values(this.participants);
  }

  public toggleAudio() {
    if (!this.isJoined || this.localTracks.length === 0) {
      return false;
    }
    
    for (const track of this.localTracks) {
      if (track.getType() === 'audio') {
        if (track.isMuted()) {
          track.unmute();
          if (this.participants['host']) {
            this.participants['host'].audio = true;
          }
          return true;
        } else {
          track.mute();
          if (this.participants['host']) {
            this.participants['host'].audio = false;
          }
          return false;
        }
      }
    }
    return false;
  }

  public async toggleVideo() {
    const JitsiMeetJS = window.JitsiMeetJS;
    
    if (!this.isJoined) {
      return false;
    }
    
    // Verifica se já temos uma track de vídeo
    const videoTrack = this.localTracks.find(track => track.getType() === 'video');
    
    if (videoTrack) {
      // Se temos um vídeo, desativamos
      videoTrack.dispose();
      this.localTracks = this.localTracks.filter(track => track.getType() !== 'video');
      if (this.participants['host']) {
        this.participants['host'].video = false;
      }
      return false;
    } else {
      // Se não temos vídeo, criamos um
      try {
        const tracks = await JitsiMeetJS.createLocalTracks({ devices: ['video'] });
        for (const track of tracks) {
          this.localTracks.push(track);
          this.room.addTrack(track);
        }
        if (this.participants['host']) {
          this.participants['host'].video = true;
        }
        return true;
      } catch (error) {
        console.error('Failed to create video track', error);
        toast.error("Não foi possível acessar sua câmera");
        return false;
      }
    }
  }

  public leaveRoom() {
    if (!this.isJoined) {
      return;
    }
    
    // Dispõe de todas as trilhas locais
    for (const track of this.localTracks) {
      track.dispose();
    }
    this.localTracks = [];
    
    // Sai da sala e desconecta
    this.room.leave();
    this.connection.disconnect();
    this.isJoined = false;
  }
}

declare global {
  interface Window {
    JitsiMeetJS: any;
  }
}

// Exportamos uma única instância para uso em toda a aplicação
export const jitsiManager = new JitsiManager();
