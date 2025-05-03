
import { JitsiParticipant, JitsiEventHandlers } from "./types";
import JitsiConnection from "./JitsiConnection";

class JitsiParticipants {
  private participants: Record<string, JitsiParticipant> = {};
  private eventHandlers: JitsiEventHandlers = {};
  private jitsiConnection: JitsiConnection;

  constructor(jitsiConnection: JitsiConnection, eventHandlers: JitsiEventHandlers = {}) {
    this.jitsiConnection = jitsiConnection;
    this.eventHandlers = eventHandlers;
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public setupParticipantEvents() {
    const room = this.jitsiConnection.getRoom();
    if (!room) return;

    const JitsiMeetJS = window.JitsiMeetJS;
    
    room.on(JitsiMeetJS.events.conference.USER_JOINED, this.onUserJoined.bind(this));
    room.on(JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft.bind(this));
    room.on(JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.onConferenceJoined.bind(this));
  }

  public onConferenceJoined() {
    // Adiciona o usuário local como participante
    const localParticipant: JitsiParticipant = {
      id: 'host',
      name: this.jitsiConnection.getUserName(),
      status: "connected",
      audio: true,
      video: false
    };
    
    this.participants['host'] = localParticipant;
    
    if (this.eventHandlers.onParticipantJoined) {
      this.eventHandlers.onParticipantJoined(localParticipant);
    }

    // Propaga o evento para o JitsiConnection
    this.jitsiConnection.onConferenceJoined();
  }

  public onUserJoined(id: string, user: any) {
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

  public onUserLeft(id: string) {
    if (this.eventHandlers.onParticipantLeft) {
      this.eventHandlers.onParticipantLeft(id);
    }
    
    delete this.participants[id];
  }

  public onMessageReceived(participant: any, message: any) {
    console.log('Message received:', message);
  }

  public getAllParticipants(): JitsiParticipant[] {
    return Object.values(this.participants);
  }

  public getParticipant(id: string): JitsiParticipant | undefined {
    return this.participants[id];
  }

  public updateParticipantAudioStatus(participantId: string, muted: boolean) {
    if (this.participants[participantId]) {
      this.participants[participantId].audio = !muted;
      
      if (this.eventHandlers.onAudioMuteStatusChanged) {
        this.eventHandlers.onAudioMuteStatusChanged(participantId, muted);
      }
    }
  }

  public updateParticipantVideoStatus(participantId: string, muted: boolean) {
    if (this.participants[participantId]) {
      this.participants[participantId].video = !muted;
      
      if (this.eventHandlers.onVideoMuteStatusChanged) {
        this.eventHandlers.onVideoMuteStatusChanged(participantId, muted);
      }
    }
  }
}

export default JitsiParticipants;
