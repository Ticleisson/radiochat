
import { toast } from "sonner";
import { JitsiParticipant, JitsiEventHandlers } from "./types";
import { loadJitsiMeetScript, initJitsiMeet } from "./helpers";
import JitsiConnection from "./JitsiConnection";
import JitsiParticipants from "./JitsiParticipants";
import JitsiTracks from "./JitsiTracks";

class JitsiManager {
  private jitsiConnection: JitsiConnection;
  private jitsiParticipants: JitsiParticipants;
  private jitsiTracks: JitsiTracks;
  private eventHandlers: JitsiEventHandlers = {};

  constructor() {
    this.jitsiConnection = new JitsiConnection();
    this.jitsiParticipants = new JitsiParticipants(this.jitsiConnection);
    this.jitsiTracks = new JitsiTracks(this.jitsiConnection, this.jitsiParticipants);
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.jitsiConnection.setEventHandlers(this.eventHandlers);
    this.jitsiParticipants.setEventHandlers(this.eventHandlers);
    this.jitsiTracks.setEventHandlers(this.eventHandlers);
  }

  public async joinRoom(roomName: string, displayName: string) {
    const result = await this.jitsiConnection.joinRoom(roomName, displayName);
    
    if (result) {
      const room = this.jitsiConnection.getRoom();
      
      if (room) {
        // Configura os eventos para tracks e participantes
        this.jitsiParticipants.setupParticipantEvents();
        this.jitsiTracks.setupTrackEvents();
        
        // Define o nome de exibição e entra na sala
        room.setDisplayName(displayName);
        room.join();
        
        // Cria as tracks de áudio local
        await this.jitsiTracks.createLocalTracks();
      }
    }
    
    return result;
  }

  public getAllParticipants(): JitsiParticipant[] {
    return this.jitsiParticipants.getAllParticipants();
  }

  public toggleAudio() {
    return this.jitsiTracks.toggleAudio();
  }

  public async toggleVideo() {
    return this.jitsiTracks.toggleVideo();
  }

  public leaveRoom() {
    this.jitsiTracks.disposeLocalTracks();
    this.jitsiConnection.leaveRoom();
  }
}

export default JitsiManager;
