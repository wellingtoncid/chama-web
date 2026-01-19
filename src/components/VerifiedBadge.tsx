import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const VerifiedBadge = ({ isVerified }: { isVerified: number | boolean }) => {
  if (!isVerified) return null;

  return (
    <div className="flex items-center text-blue-600 ml-1" title="Motorista Verificado">
      <CheckBadgeIcon className="h-5 w-5" />
      <span className="text-[10px] font-bold uppercase ml-0.5">Verificado</span>
    </div>
  );
};

export default VerifiedBadge;