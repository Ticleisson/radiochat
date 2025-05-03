
import { useState, useEffect, useRef } from "react";
import { getRandomTranscription, formatCallDuration } from "@/utils/callTranscription";
import { Call } from "@/services/callsService";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";

export interface Participant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
}

export const useCallManagement = (callId: string | undefined) => {
  const [callParticipants, setCallParticipants] = useState<Participant[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState("00:00");
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [autoSaveTranscription, setAutoSaveTranscription] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const transcriptionInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (transcriptionInterval.current) clearInterval(transcriptionInterval.current);
    };
  }, []);
  
  // Start the call with provided call data
  const startCall = (callData: Call) => {
    if (!user) return;
    
    // Reset call state
    setTranscriptionText("");
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (transcriptionInterval.current) clearInterval(transcriptionInterval.current);
    
    // Set the initial participants (including the current user as the host)
    const participants: Participant[] = [
      {
        id: user.id,
        name: user.user_metadata?.name || "Apresentador",
        status: "connected",
        audio: true,
        video: false
      },
      // Add simulated participants for now
      {
        id: "guest1",
        name: "Convidado 1",
        status: "connecting",
        audio: false,
        video: false
      }
    ];
    
    setCallParticipants(participants);
    setIsConnected(true);
    
    // Start the call timer
    setStartTime(new Date());
    startCallTimer();
    
    // Simulate guest connecting after a short delay
    setTimeout(() => {
      setCallParticipants(prevParticipants => 
        prevParticipants.map(p => 
          p.id === "guest1" ? { ...p, status: "connected", audio: true } : p
        )
      );
    }, 3000);
  };
  
  // Start the call timer
  const startCallTimer = () => {
    setStartTime(new Date());
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    durationInterval.current = setInterval(() => {
      if (startTime) {
        setDuration(formatCallDuration(startTime));
      }
    }, 1000);
  };
  
  // Toggle participant's audio
  const toggleAudio = (participantId: string) => {
    setCallParticipants(participants => 
      participants.map(p => 
        p.id === participantId ? { ...p, audio: !p.audio } : p
      )
    );
  };
  
  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(prev => {
      const newIsRecording = !prev;
      
      if (newIsRecording) {
        startRecording();
      } else {
        stopRecording();
      }
      
      return newIsRecording;
    });
  };
  
  // Start recording
  const startRecording = () => {
    // In a real implementation, this would start the recording API
    // For now, we'll simulate new transcriptions appearing periodically
    transcriptionInterval.current = setInterval(() => {
      setTranscriptionText(prev => {
        const newTranscription = getRandomTranscription();
        return prev ? `${prev}\n\n${newTranscription}` : newTranscription;
      });
    }, 5000);
  };
  
  // Stop recording
  const stopRecording = () => {
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
  };
  
  // Save transcription (handled by parent component)
  
  // End call
  const endCallSession = () => {
    // Stop all intervals
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
    
    // Reset connection state
    setIsConnected(false);
    setIsRecording(false);
    
    // In a real implementation, this would disconnect from Jitsi
  };
  
  return {
    callParticipants,
    duration,
    isRecording,
    transcriptionText,
    autoSaveTranscription,
    isConnected,
    toggleAudio,
    toggleRecording,
    startCall,
    endCallSession
  };
};
