
import { toast } from "sonner";
import { JitsiParticipant, JitsiEventHandlers } from "./types";
import JitsiConnection from "./JitsiConnection";
import JitsiParticipants from "./JitsiParticipants";
import JitsiTracks from "./JitsiTracks";

class JitsiManager {
  private jitsiConnection: JitsiConnection;
  private jitsiParticipants: JitsiParticipants;
  private jitsiTracks: JitsiTracks;
  private eventHandlers: JitsiEventHandlers = {};
  private isConnected: boolean = false;

  constructor() {
    this.jitsiConnection = new JitsiConnection();
    this.jitsiParticipants = new JitsiParticipants(this.jitsiConnection);
    this.jitsiTracks = new JitsiTracks(this.jitsiConnection, this.jitsiParticipants);
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    this.jitsiConnection.setEventHandlers({
      ...this.eventHandlers,
      connectionStatusChanged: (status) => {
        this.isConnected = status === "connected";
        if (this.eventHandlers.connectionStatusChanged) {
          this.eventHandlers.connectionStatusChanged(status);
        }
      }
    });
    this.jitsiParticipants.setEventHandlers(this.eventHandlers);
    this.jitsiTracks.setEventHandlers(this.eventHandlers);
  }

  public isConnectedToRoom(): boolean {
    return this.isConnected && this.jitsiConnection.isRoomJoined();
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
        
        // Create local audio tracks only when actually joining the room
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
    this.isConnected = false;
    this.jitsiTracks.disposeLocalTracks();
    this.jitsiConnection.leaveRoom();
  }
}

export default JitsiManager;
