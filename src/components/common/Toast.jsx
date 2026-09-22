import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  const isWarning = toastMessage.type === 'warning';

  return (
    <div className="toast-notification">
      {isWarning ? (
        <AlertTriangle size={18} style={{ color: '#eac8a8' }} />
      ) : (
        <CheckCircle2 size={18} style={{ color: '#d4e7a2' }} />
      )}
      <span>{toastMessage.message}</span>
    </div>
  );
}
