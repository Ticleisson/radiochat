
import { toast } from "sonner";
import { JitsiEventHandlers } from "./types";
import { loadJitsiMeetScript, initJitsiMeet, showErrorToast } from "./helpers";

class JitsiConnection {
  private connection: any = null;
  private room: any = null;
  private eventHandlers: JitsiEventHandlers = {};
  private userName: string = "You (Host)";
  private roomName: string = "";
  private domain: string = "jitsi.radiochat.cleissoncardoso.com";
  private isInitialized: boolean = false;
  private isJoined: boolean = false;

  constructor() {
    this.loadJitsiMeetScript();
  }

  private loadJitsiMeetScript() {
    loadJitsiMeetScript(() => {
      this.initJitsiMeet();
    });
  }

  private initJitsiMeet() {
    if (!window.JitsiMeetJS) {
      setTimeout(() => this.initJitsiMeet(), 100);
      return;
    }

    if (initJitsiMeet()) {
      this.isInitialized = true;
    }
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public isRoomJoined(): boolean {
    return this.isJoined;
  }

  public getConnection() {
    return this.connection;
  }

  public getRoom() {
    return this.room;
  }

  public getUserName(): string {
    return this.userName;
  }

  public getRoomName(): string {
    return this.roomName;
  }

  public getDomain(): string {
    return this.domain;
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

  public onConnectionSuccess() {
    try {
      if (this.eventHandlers.connectionStatusChanged) {
        this.eventHandlers.connectionStatusChanged("connected");
      }
      
      const JitsiMeetJS = window.JitsiMeetJS;
      this.room = this.connection.initJitsiConference(this.roomName, {});
      
      return this.room;
    } catch (error) {
      console.error('Error during connection setup:', error);
      toast.error("Erro ao configurar a chamada");
      return null;
    }
  }

  public onConnectionFailed() {
    console.error('Connection failed!');
    toast.error("Falha na conexão com o servidor de chamadas");
    
    if (this.eventHandlers.connectionStatusChanged) {
      this.eventHandlers.connectionStatusChanged("failed");
    }
  }

  public onConnectionDisconnected() {
    console.log('Connection disconnected!');
    
    if (this.eventHandlers.connectionStatusChanged) {
      this.eventHandlers.connectionStatusChanged("disconnected");
    }
  }

  public onConferenceJoined() {
    console.log('Conference joined!');
    this.isJoined = true;
  }

  public leaveRoom() {
    if (!this.isJoined) {
      return;
    }
    
    // Sai da sala e desconecta
    if (this.room) {
      this.room.leave();
    }
    if (this.connection) {
      this.connection.disconnect();
    }
    this.isJoined = false;
  }
}

export default JitsiConnection;
