export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80px] flex flex-col items-start">
        <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 ">
          <div className="flex items-center gap-1">
            <span className="size-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="size-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="size-1 bg-slate-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
