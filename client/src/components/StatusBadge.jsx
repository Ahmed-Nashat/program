const STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STYLES[status] || 'bg-slate-100 text-slate-600'}`}
  >
    {status}
  </span>
);

export default StatusBadge;
