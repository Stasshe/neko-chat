export function ButtonSpinner({ label = "処理中" }: { label?: string }) {
  return <span className="button-spinner" role="status" aria-label={label} />;
}
