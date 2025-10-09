// PATH: src/SocialLinks.jsx
import React from "react";

export default function SocialLinks() {
  const cls = "bg-white/5 hover:bg-white/10 p-2 rounded transition";
  const icon = "h-6 w-6";
  return (
    <div className="grid grid-cols-6 gap-3 items-center">
      <a className={cls} href="https://facebook.com/mustwants" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.01 3.66 9.17 8.44 9.93v-7.02H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.93z"/></svg>
      </a>
      <a className={cls} href="https://instagram.com/mustwants" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/></svg>
      </a>
      <a className={cls} href="https://twitter.com/mustwants" target="_blank" rel="noopener noreferrer" aria-label="X">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M3 3h3.6l5.14 7.26L16.8 3H21l-7.66 10.78L21 21h-3.6l-5.34-7.55L7.2 21H3l7.86-10.92z"/></svg>
      </a>
      <a className={cls} href="https://linkedin.com/company/mustwants" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 2.5 6 2.49 2.49 0 0 1 4.98 3.5zM3 8.98h4v12H3zM9 8.98h3.84v1.64h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.11v6.33h-4v-5.61c0-1.34-.03-3.06-1.87-3.06-1.88 0-2.17 1.47-2.17 2.97v5.7H9z"/></svg>
      </a>
      <a className={cls} href="https://youtube.com/mustwants" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.38.58A3 3 0 0 0 .5 6.2 47.1 47.1 0 0 0 0 12a47.1 47.1 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12C4.6 20.5 12 20.5 12 20.5s7.4 0 9.38-.58A3 3 0 0 0 23.5 17.8 47.1 47.1 0 0 0 24 12a47.1 47.1 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12z"/></svg>
      </a>
      <a className={cls} href="https://bsky.app/profile/mustwants" target="_blank" rel="noopener noreferrer" aria-label="BlueSky">
        <svg viewBox="0 0 24 24" className={icon} fill="currentColor"><path d="M12 10.1C9.7 6.2 5.3 2 3.2 2 1.5 2 1 3.3 1 4.6c0 2.4 1.9 4.6 4.3 6.6-2.4 1.9-4.3 4.2-4.3 6.6C1 19.9 1.5 22 3.2 22c2.1 0 6.5-4.2 8.8-8.1 2.3 3.9 6.7 8.1 8.8 8.1 1.7 0 2.2-2.1 2.2-4.2 0-2.4-1.9-4.7-4.3-6.6 2.4-2 4.3-4.2 4.3-6.6C23 3.3 22.5 2 20.8 2c-2.1 0-6.5 4.2-8.8 8.1z"/></svg>
      </a>
    </div>
  );
}
