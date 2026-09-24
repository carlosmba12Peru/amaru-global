// frontend/src/components/VoiceStoryRecorder.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";
import { TraduccionPrePadron } from "@/locales/edan_i18n";

interface VoiceStoryRecorderProps {
    traduccion: TraduccionPrePadron;
    onAudioCaptured: (audioBlob: Blob | null, audioBase64: string | null, hashSha256: string | null) => void;
    disabled?: boolean;
}

export default function VoiceStoryRecorder({
    traduccion,
    onAudioCaptured,
    disabled = false
}: VoiceStoryRecorderProps) {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioHash, setAudioHash] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // Limpieza de temporizador al desmontar
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // Función auxiliar para calcular SHA-256 en el navegador
    const computeSha256 = async (blob: Blob): Promise<string> => {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        } catch {
            return `AUDIO-LOCAL-${Date.now().toString(16)}`;
        }
    };

    // Convertir Blob a Base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Iniciar Grabación
    const handleStartRecording = async () => {
        setErrorMsg(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorMsg("Su navegador no soporta grabación directa de audio. Puede redactar su testimonio en texto.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Preferir formato ligero y ampliamente soportado
            let mimeType = "audio/webm";
            if (!MediaRecorder.isTypeSupported("audio/webm")) {
                mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
            }

            const options = mimeType ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Calcular Hash criptográfico SHA-256
                const hash = await computeSha256(audioBlob);
                setAudioHash(hash);

                // Generar Base64 para adjunto en pre-padrón
                const base64 = await blobToBase64(audioBlob);
                onAudioCaptured(audioBlob, base64, hash);

                // Detener todas las pistas de audio para liberar el micrófono
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(250); // Muestras cada 250ms
            setIsRecording(true);
            setRecordingTime(0);

            // Temporizador: máximo 90 segundos de relato oral
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 90) {
                        handleStopRecording();
                        return 90;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error("Error al acceder al micrófono:", err);
            setErrorMsg("No se pudo acceder al micrófono. Por favor verifique los permisos en su dispositivo.");
        }
    };

    // Detener Grabación
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    // Reproducir / Pausar Audio grabado
    const togglePlayback = () => {
        if (!audioPlayerRef.current && audioUrl) {
            audioPlayerRef.current = new Audio(audioUrl);
            audioPlayerRef.current.onended = () => setIsPlaying(false);
        }

        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
                setIsPlaying(false);
            } else {
                audioPlayerRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    // Descartar Audio y volver a grabar
    const handleDiscardAudio = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setAudioHash(null);
        setIsPlaying(false);
        setRecordingTime(0);
        onAudioCaptured(null, null, null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entrada Oral / Rimanakuy (Voz)</span>
                </span>
                {isRecording && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 animate-pulse font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        REC {formatTime(recordingTime)} / 1:30
                    </span>
                )}
            </div>

            {errorMsg && (
                <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Estado 1: No hay audio grabado y no está grabando */}
            {!audioUrl && !isRecording && (
                <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={disabled}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs transition flex items-center justify-center gap-2 border border-amber-500/40 shadow-sm cursor-pointer disabled:opacity-50"
                >
                    <Mic className="w-4 h-4 text-amber-200" />
                    <span>{traduccion.botonGrabarVoz}</span>
                </button>
            )}

            {/* Estado 2: Grabando en vivo */}
            {isRecording && (
                <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                            className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                            style={{ width: `${(recordingTime / 90) * 100}%` }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleStopRecording}
                        className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer animate-pulse"
                    >
                        <Square className="w-4 h-4 fill-white" />
                        <span>{traduccion.botonPausarVoz} ({formatTime(recordingTime)})</span>
                    </button>
                </div>
            )}

            {/* Estado 3: Audio Grabado Listo para revisión */}
            {audioUrl && !isRecording && (
                <div className="p-2.5 bg-slate-900 rounded-lg border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{traduccion.notaAudioGrabado}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Duración: {formatTime(recordingTime)}
                        </span>
                    </div>

                    {audioHash && (
                        <div className="text-[9px] font-mono text-slate-400 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            SHA-256: {audioHash}
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={togglePlayback}
                            className="flex-1 py-1.5 px-2.5 rounded bg-emerald-700/60 hover:bg-emerald-600 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1.5 border border-emerald-500/40 cursor-pointer"
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="w-3 h-3 fill-white" />
                                    <span>Pausar</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 fill-white" />
                                    <span>{traduccion.botonEscucharGrabacion}</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscardAudio}
                            className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-[11px] font-semibold transition flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                            title={traduccion.botonDescartarAudio}
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>{traduccion.botonDescartarAudio}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
