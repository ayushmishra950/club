import React, { useEffect, useState } from "react";
import { getLatestEvent } from "@/service/event";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "@/socket/socket";

const EventTicker: React.FC = () => {
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLatestEvent = async () => {
        try {
            const res = await getLatestEvent();
            if (res.status === 200 && res.data.success) {
                setEvent(res.data.event);
            }
        } catch (error) {
            console.error("Error fetching latest event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        socket.on("event", () => {
            fetchLatestEvent();
        })

        return () => {
            socket.off("event");
        }
    }, [])

    useEffect(() => {
        fetchLatestEvent();
    }, []);

    if (loading || !event) return null;

    return (
        <div className="w-full h-[50px] bg-blue-600 overflow-hidden flex items-center relative shadow-inner">
            {/* Ticker Container */}
            <div className="flex whitespace-nowrap animate-marquee items-center cursor-pointer" onClick={() => { navigate("/events") }}>
                <div className="flex items-center gap-6 px-4">
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                        Latest Event
                    </span>

                    <div className="flex items-center gap-4 text-white font-medium">
                        {(event?.createdBy?.profileImage || event.coverImage) && (
                            <img
                                src={event?.createdBy?.profileImage || event.coverImage}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover border-2 border-white/50"
                            />
                        )}
                        <span className="text-sm">{event.title}</span>

                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                            <Calendar size={14} />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                        </div>

                        <span className="text-white/40 mx-4">•</span>

                        <p className="text-sm text-blue-50 italic">
                            {event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                        </p>
                    </div>
                </div>

                {/* Duplicate for seamless loop */}
                <div className="flex items-center gap-6 px-4 ml-12">
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                        Latest Event
                    </span>

                    <div className="flex items-center gap-4 text-white font-medium">
                        {(event?.createdBy?.profileImage || event.coverImage) && (
                            <img
                                src={event?.createdBy?.profileImage || event.coverImage}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover border-2 border-white/50"
                            />
                        )}
                        <span className="text-sm">{event.title}</span>

                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                            <Calendar size={14} />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                        </div>

                        <span className="text-white/40 mx-4">•</span>

                        <p className="text-sm text-blue-50 italic">
                            {event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default EventTicker;
