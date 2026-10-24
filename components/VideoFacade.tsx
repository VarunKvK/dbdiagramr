"use client";

import { useState } from "react";
import Image from "next/image";

export default function VideoFacade() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src="https://www.youtube-nocookie.com/embed/z-YlCbOBvjQ?autoplay=1"
        title="dbdiagramr demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-[20px] border border-white/15 bg-pine shadow-lg"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label="Play dbdiagramr demo"
      className="group relative block aspect-video w-full overflow-hidden rounded-[20px] border border-white/15 bg-pine shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-punch"
    >
      <Image
        src="/video/dbdiagramr-demo.jpg"
        alt=""
        width={1280}
        height={720}
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-xl transition-transform group-hover:scale-105">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
