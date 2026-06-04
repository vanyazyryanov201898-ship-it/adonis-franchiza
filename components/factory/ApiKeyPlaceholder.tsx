"use client";

import { KeyRound, ExternalLink } from "lucide-react";

interface ApiKeyPlaceholderProps {
  serviceName: string;
  description?: string;
  docsUrl?: string;
  envKey?: string;
}

export default function ApiKeyPlaceholder({
  serviceName,
  description,
  docsUrl,
  envKey,
}: ApiKeyPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] text-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <KeyRound className="w-7 h-7 text-slate-500" />
      </div>

      <div>
        <p className="text-white font-semibold mb-1.5">Требуется {serviceName}</p>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
          {description || `Для создания видео через ${serviceName} нужно подключить API ключ.`}
        </p>
      </div>

      {envKey && (
        <div className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] font-mono text-xs text-slate-400">
          {envKey}=<span className="text-slate-600">ваш_ключ</span>
        </div>
      )}

      {docsUrl && (
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] text-sm text-slate-300 hover:text-white transition-all"
        >
          Получить ключ {serviceName}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <p className="text-xs text-slate-600">Добавь ключ в .env.local и перезапусти сервер</p>
    </div>
  );
}
