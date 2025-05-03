
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
  private connecting: boolean = false;

  constructor() {
    // Don't automatically load Jitsi script on construction
    // Only load when explicitly requested
  }

  private loadJitsiMeetScript(callback: () => void) {
    loadJitsiMeetScript(callback);
  }

  private initJitsiMeet(callback: () => void) {
    if (!window.JitsiMeetJS) {
      setTimeout(() => this.initJitsiMeet(callback), 100);
      return;
    }

    if (initJitsiMeet()) {
      this.isInitialized = true;
      callback();
    }
  }

  public setEventHandlers(handlers: JitsiEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public isRoomJoined(): boolean {
    return this.isJoined;
  }

  public isConnecting(): boolean {
    return this.connecting;
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
    // Start the explicit loading and initialization process
    this.connecting = true;
    
    return new Promise<boolean>((resolve) => {
      // First load the Jitsi script
      this.loadJitsiMeetScript(() => {
        // Then initialize Jitsi
        this.initJitsiMeet(() => {
          this.connectToRoom(roomName, displayName, resolve);
        });
      });
    });
  }
  
  private connectToRoom(roomName: string, displayName: string, resolve: (value: boolean) => void) {
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
        this.onConnectionFailed.bind(this, resolve)
      );
      
      this.connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        this.onConnectionDisconnected.bind(this)
      );

      this.connection.connect();
      
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error("Erro ao entrar na sala de chamada");
      this.connecting = false;
      if (this.eventHandlers.connectionStatusChanged) {
        this.eventHandlers.connectionStatusChanged("failed");
      }
      resolve(false);
    }
  }

  public onConnectionSuccess() {
    try {
      if (this.eventHandlers.connectionStatusChanged) {
        this.eventHandlers.connectionStatusChanged("connected");
      }
      
      const JitsiMeetJS = window.JitsiMeetJS;
      this.room = this.connection.initJitsiConference(this.roomName, {});
      this.connecting = false;
      
      return this.room;
    } catch (error) {
      console.error('Error during connection setup:', error);
      toast.error("Erro ao configurar a chamada");
      this.connecting = false;
      return null;
    }
  }

  public onConnectionFailed(resolve: (value: boolean) => void) {
    console.error('Connection failed!');
    toast.error("Falha na conexão com o servidor de chamadas");
    
    this.connecting = false;
    if (this.eventHandlers.connectionStatusChanged) {
      this.eventHandlers.connectionStatusChanged("failed");
    }
    resolve(false);
  }

  public onConnectionDisconnected() {
    console.log('Connection disconnected!');
    
    this.connecting = false;
    this.isJoined = false;
    if (this.eventHandlers.connectionStatusChanged) {
      this.eventHandlers.connectionStatusChanged("disconnected");
    }
  }

  public onConferenceJoined() {
    console.log('Conference joined!');
    this.isJoined = true;
  }

  public leaveRoom() {
    if (!this.isJoined && !this.connecting) {
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
    this.connecting = false;
  }
}

export default JitsiConnection;
