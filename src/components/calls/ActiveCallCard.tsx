
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
}

interface CallProps {
  id: string;
  name: string;
  participants: Participant[];
  startTime: Date;
  type: "audio" | "video";
}

const ActiveCallCard = ({ call }: { call: CallProps }) => {
  const navigate = useNavigate();
  
  const calculateDuration = () => {
    const diff = Date.now() - call.startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md">
      <div className="bg-radio px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="live-indicator"></div>
            <h3 className="font-medium text-white">{call.name}</h3>
          </div>
          <span className="rounded-full bg-white bg-opacity-20 px-2 py-0.5 text-xs text-white">
            {calculateDuration()}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            {call.participants.length} participant{call.participants.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="mb-4 space-y-2">
          {call.participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {participant.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {participant.status === "connected" ? "Connected" : 
                     participant.status === "connecting" ? "Connecting..." : "Disconnected"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                {participant.audio ? 
                  <Mic className="h-4 w-4 text-green-500" /> : 
                  <MicOff className="h-4 w-4 text-muted-foreground" />
                }
                {call.type === "video" && (
                  participant.video ? 
                    <Video className="h-4 w-4 text-green-500" /> : 
                    <VideoOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full bg-radio hover:bg-radio-light"
          onClick={() => navigate(`/call/${call.id}`)}
        >
          Join Call
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActiveCallCard;
