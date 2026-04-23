import React from 'react';
import { FinanceConsoleFeature } from '../../admin/features/finance/components/FinanceConsoleFeature';

const FinanceConsole: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
      <FinanceConsoleFeature />
    </div>
  );
};

export default FinanceConsole;
