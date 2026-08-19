import React from 'react';
import govLogoImg from '../assets/images/bahrain_gov_hospitals_logo_1787046319692.jpg';

interface GovernmentHospitalsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GovernmentHospitalsLogo: React.FC<GovernmentHospitalsLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses} shrink-0 flex items-center justify-center`}>
        <img
          src={govLogoImg}
          alt="Government Hospitals Logo - Kingdom of Bahrain"
          className="w-full h-full object-contain rounded-xs"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center select-none text-left">
          <span
            className="text-sm sm:text-base font-bold text-slate-900 leading-none tracking-tight font-serif"
            style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", direction: 'rtl' }}
          >
            المُسْتَشْفَيَاتِ الحُكُومِيَّة
          </span>
          <span
            className="text-xs sm:text-sm font-semibold text-slate-900 tracking-wide mt-1"
            style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}
          >
            Government Hospitals
          </span>
        </div>
      )}
    </div>
  );
};
export default GovernmentHospitalsLogo;
