export function LoadingState({ label = "読み込み中" }: { label?: string }) {
  return (
    <div className="status" role="status">
      <span className="status__spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="status status--error" role="alert">
      <p>{message}</p>
      {retry && (
        <button className="text-button" type="button" onClick={retry}>
          もう一度試す
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="status status--empty">
      <span className="paw" aria-hidden="true">
        ●
      </span>
      <p>{message}</p>
    </div>
  );
}
