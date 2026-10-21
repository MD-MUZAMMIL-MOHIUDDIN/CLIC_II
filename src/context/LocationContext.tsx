import React, { createContext, useContext, useState } from 'react';
import locationsSeed from '../data/locations.json';

interface LocationContextType {
  selectedState: string;
  selectedDistrict: string;
  selectedBlock: string;
  setSelectedState: (state: string) => void;
  setSelectedDistrict: (district: string) => void;
  setSelectedBlock: (block: string) => void;
  availableStates: string[];
  availableDistricts: string[];
  availableBlocks: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Indore');
  const [selectedBlock, setSelectedBlock] = useState<string>('Sanwer');

  const availableStates = locationsSeed.states.map(s => s.name);

  const stateObj = locationsSeed.states.find(s => s.name === selectedState);
  const availableDistricts = stateObj ? stateObj.districts.map(d => d.name) : [];

  const distObj = stateObj?.districts.find(d => d.name === selectedDistrict);
  const availableBlocks = distObj ? distObj.blocks : [];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const targetState = locationsSeed.states.find(s => s.name === state);
    if (targetState && targetState.districts.length > 0) {
      setSelectedDistrict(targetState.districts[0].name);
      setSelectedBlock(targetState.districts[0].blocks[0] || '');
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    if (stateObj) {
      const targetDist = stateObj.districts.find(d => d.name === district);
      if (targetDist && targetDist.blocks.length > 0) {
        setSelectedBlock(targetDist.blocks[0]);
      }
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        selectedDistrict,
        selectedBlock,
        setSelectedState: handleStateChange,
        setSelectedDistrict: handleDistrictChange,
        setSelectedBlock,
        availableStates,
        availableDistricts,
        availableBlocks
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
