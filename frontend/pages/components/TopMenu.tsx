'use client';
import { Menu, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  toggle: () => void;
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export default function TopMenu({ isOpen, toggle, onLogout, onNavigate }: Props) {
  return (
    <>
      <div className="d-md-none">
        <button
          onClick={toggle}
          className="btn btn-outline-primary"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
      <div
        className={`menu-transition d-md-flex gap-2 flex-column flex-md-row ${
          isOpen ? 'menu-open' : 'menu-closed'
        }`}
      >
        <button onClick={() => onNavigate('/form')} className="btn btn-primary-custom rounded-pill px-4 py-2">
          + Add Business
        </button>
        <button onClick={() => onNavigate('/employees')} className="btn btn-primary-custom rounded-pill px-4 py-2">
          View All Employees
        </button>
        <button onClick={onLogout} className="btn btn-primary-custom rounded-pill px-4 py-2">
          Logout
        </button>
      </div>
    </>
  );
}
