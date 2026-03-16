import { Link } from "react-router-dom";

function ServiceCard({ to, icon, title, description, accent = "bg-blue-100 text-blue-700" }) {
  return (
    <Link to={to} className="service-card">
      <span className={`service-icon ${accent}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-xl font-bold text-slate-900">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">{description}</span>
      </span>
    </Link>
  );
}

export default ServiceCard;
