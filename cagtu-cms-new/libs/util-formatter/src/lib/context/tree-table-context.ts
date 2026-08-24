import { createContext, Dispatch, SetStateAction } from 'react';

interface TreeTableContextType {
    openRows: number[];
    setOpenRows?: Dispatch<SetStateAction<number[]>>;
}

export const TreeTableContext = createContext<TreeTableContextType>({ openRows: [] });

export default TreeTableContext;
