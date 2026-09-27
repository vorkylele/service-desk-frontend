export function ErrorAlert({ message }: { message: string }) {
  return message ? <div className="alert error">{message}</div> : null
}
