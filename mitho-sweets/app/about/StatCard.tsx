import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface StatCardProps {
  end: number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ end, label }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div ref={ref} className="text-center px-4">
      {inView ? (
        <CountUp
          start={0}
          end={end}
          duration={2}
          separator=","
          suffix="+"
        
        >
          {({ countUpRef }) => (
            <div>
              <span ref={countUpRef} className="text-3xl font-bold text-orange-600" />
              <div className="text-sm mt-1 text-gray-600">{label}</div>
            </div>
          )}
        </CountUp>
      ) : (
        <div>
          <span className="text-3xl font-bold text-orange-600">0</span>
          <div className="text-sm mt-1 text-gray-600">{label}</div>
        </div>
      )}
    </div>
  );
};
export default StatCard