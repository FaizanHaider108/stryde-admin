import { FiAlertCircle } from "react-icons/fi";

type Props = {
  title: string;
  message: string;
  hint?: string;
};

export default function AdminAccessAlert({ title, message, hint }: Props) {
  return (
    <div className="admin-card flex items-start gap-3 border-amber-200 bg-amber-50 p-5 text-amber-950">
      <FiAlertCircle className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm opacity-90">{message}</p>
        {hint ? <p className="mt-2 text-xs opacity-80">{hint}</p> : null}
      </div>
    </div>
  );
}
