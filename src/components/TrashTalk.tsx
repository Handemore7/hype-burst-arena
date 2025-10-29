import { useEffect, useState } from "react";

interface TrashTalkProps {
  message: string;
  color: string;
}

const trashTalkMessages = [
  "💀 GET REKT!",
  "🚀 ZOOMING PAST!",
  "👋 SEE YA!",
  "⚡ TOO FAST!",
  "🔥 ON FIRE!",
  "💥 BOOM!",
  "😤 DOMINATED!",
  "🎯 PRECISION!",
];

export const TrashTalk = ({ message, color }: TrashTalkProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const randomMessage = trashTalkMessages[Math.floor(Math.random() * trashTalkMessages.length)];

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 -top-16 text-2xl font-black whitespace-nowrap animate-float-up pointer-events-none z-50"
      style={{
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        color: color,
      }}
    >
      {randomMessage}
    </div>
  );
};
