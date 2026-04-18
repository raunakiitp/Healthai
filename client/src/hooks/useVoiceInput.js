import { useState, useRef, useEffect } from "react";

export function useVoiceInput({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onResult && onResult(finalTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      onError && onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported || isListening) return;
    setTranscript("");
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    if (!isListening) return;
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return { isListening, transcript, isSupported, startListening, stopListening, toggleListening };
}
