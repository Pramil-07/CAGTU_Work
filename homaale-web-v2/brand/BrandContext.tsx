'use client';
import React, { createContext, useContext } from 'react';
import { BrandData } from './brandDataCagtu';
import { cagtuBrand } from './brandDataCagtu';
import { homaaleBrand } from './brandDataHomaale';
import { useBrand } from '@/hooks/useBrand';

interface BrandContextType {
  brandData: BrandData;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hostname = useBrand();
  const isCagtu = hostname === 'cagtu';
  const brandData = isCagtu ? cagtuBrand : homaaleBrand;

  return (
    <BrandContext.Provider value={{ brandData }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrandData = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrandData must be used within a BrandProvider');
  }
  return context;
};