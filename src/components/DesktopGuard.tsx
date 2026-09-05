import React, { useState, useEffect } from 'react';
import { Monitor, ArrowLeft, ShieldAlert, Laptop } from 'lucide-react';

interface DesktopGuardProps {
  children: React.ReactNode;
  portalName?: string;
  onReturnToUser?: () => void;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({
  children,
  portalName = 'Admin / Maintenance',
  onReturnToUser
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <>{children}</>;
};
  

