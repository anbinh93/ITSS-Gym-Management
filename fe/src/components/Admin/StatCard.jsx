import './StatCard.css'
export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`card border-left border-${color} shadow h-100 py-2`}>
      <div className="card-body">
        <div className="row g-0 align-items-center">
          <div className="col me-2">
            <div className={`fw-bold text-uppercase mb-1 text-${color}`}>
              {title}
            </div>
            <div className="h5 mb-0 fw-bold text-dark">
              {value}
            </div>
          </div>
          <div className="col-auto">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}