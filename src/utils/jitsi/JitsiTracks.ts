
import { toast } from "sonner";
import JitsiConnection from "./JitsiConnection";
import JitsiParticipants from "./JitsiParticipants";
import { JitsiEventHandlers } from "./types";

class JitsiTracks {
  private localTracks: any[] = [];
  private remoteTracks: Record<string, any[]> = {};
  private jitsiConnection: JitsiConnection;
  private jitsiParticipants: JitsiParticipants;
  private eventHandlers: JitsiEventHandlers = {};

  constructor(
    jitsiConnection: JitsiConnection,
    jitsiParticipants: JitsiParticipants,
    eventHandlers: JitsiEventHandlers = {}
  ) {
    this.jitsiConnection = jitsiConnection;
    this.jitsiParticipants = jitsiParticipants;
    this.eventHandlers = eventHandlers;
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public setupTrackEvents() {
    const room = this.jitsiConnection.getRoom();
    if (!room) return;

    const JitsiMeetJS = window.JitsiMeetJS;
    
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, this.onRemoteTrackAdded.bind(this));
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRemoteTrackRemoved.bind(this));
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.onTrackMuteChanged.bind(this));
    
    // Transcrição (se disponível)
    if (room.isTranscriptionSupported()) {
      room.on(JitsiMeetJS.events.conference.TRANSCRIPTION_STATUS_CHANGED, 
        (status: string) => console.log('Transcription status:', status));
      room.on(JitsiMeetJS.events.conference.TRANSCRIPT_RECEIVED, 
        (participant: any, text: string) => {
          if (this.eventHandlers.onTranscriptionReceived) {
            this.eventHandlers.onTranscriptionReceived(text, participant.getId());
          }
        });
    }
  }

  public async createLocalTracks() {
    try {
      const room = this.jitsiConnection.getRoom();
      if (!room) return false;

      const JitsiMeetJS = window.JitsiMeetJS;
      const localTracks = await JitsiMeetJS.createLocalTracks({ devices: ['audio'] });
      this.localTracks = localTracks;
      
      // Adiciona tracks locais à conferência
      for (const track of localTracks) {
        room.addTrack(track);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to create local tracks', error);
      toast.error("Não foi possível acessar seu microfone");
      return false;
    }
  }

  public onRemoteTrackAdded(track: any) {
    if (track.isLocal()) {
      return;
    }
    
    const participantId = track.getParticipantId();
    
    if (!this.remoteTracks[participantId]) {
      this.remoteTracks[participantId] = [];
    }
    
    this.remoteTracks[participantId].push(track);
    
    // Atualiza o estado de áudio/vídeo do participante
    if (track.getType() === 'audio') {
      this.jitsiParticipants.updateParticipantAudioStatus(participantId, track.isMuted());
    } else if (track.getType() === 'video') {
      this.jitsiParticipants.updateParticipantVideoStatus(participantId, track.isMuted());
    }
  }

  public onRemoteTrackRemoved(track: any) {
    const participantId = track.getParticipantId();
    
    if (this.remoteTracks[participantId]) {
      const idx = this.remoteTracks[participantId].indexOf(track);
      if (idx !== -1) {
        this.remoteTracks[participantId].splice(idx, 1);
      }
    }
  }

  public onTrackMuteChanged(track: any) {
    const participantId = track.getParticipantId() || 'host';
    
    if (track.getType() === 'audio') {
      this.jitsiParticipants.updateParticipantAudioStatus(participantId, track.isMuted());
    } else if (track.getType() === 'video') {
      this.jitsiParticipants.updateParticipantVideoStatus(participantId, track.isMuted());
    }
  }

  public toggleAudio() {
    if (!this.jitsiConnection.isRoomJoined() || this.localTracks.length === 0) {
      return false;
    }
    
    for (const track of this.localTracks) {
      if (track.getType() === 'audio') {
        if (track.isMuted()) {
          track.unmute();
          this.jitsiParticipants.updateParticipantAudioStatus('host', false);
          return true;
        } else {
          track.mute();
          this.jitsiParticipants.updateParticipantAudioStatus('host', true);
          return false;
        }
      }
    }
    return false;
  }

  public async toggleVideo() {
    if (!this.jitsiConnection.isRoomJoined()) {
      return false;
    }
    
    const JitsiMeetJS = window.JitsiMeetJS;
    
    // Verifica se já temos uma track de vídeo
    const videoTrack = this.localTracks.find(track => track.getType() === 'video');
    
    if (videoTrack) {
      // Se temos um vídeo, desativamos
      videoTrack.dispose();
      this.localTracks = this.localTracks.filter(track => track.getType() !== 'video');
      this.jitsiParticipants.updateParticipantVideoStatus('host', true);
      return false;
    } else {
      // Se não temos vídeo, criamos um
      try {
        const tracks = await JitsiMeetJS.createLocalTracks({ devices: ['video'] });
        for (const track of tracks) {
          this.localTracks.push(track);
          this.jitsiConnection.getRoom().addTrack(track);
        }
        this.jitsiParticipants.updateParticipantVideoStatus('host', false);
        return true;
      } catch (error) {
        console.error('Failed to create video track', error);
        toast.error("Não foi possível acessar sua câmera");
        return false;
      }
    }
  }

  public disposeLocalTracks() {
    for (const track of this.localTracks) {
      track.dispose();
    }
    this.localTracks = [];
    this.remoteTracks = {};
  }

  public removeRemoteTracks(participantId: string) {
    delete this.remoteTracks[participantId];
  }

  public getLocalTracks() {
    return this.localTracks;
  }

  public getRemoteTracks() {
    return this.remoteTracks;
  }
}

export default JitsiTracks;
