/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppUser } from '../types';

interface AppState {
  user: AppUser | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: AppUser }
  | { type: 'LOGOUT' };

const defaultUser: AppUser = { role: 'staff', name: '' };
const initialState: AppState = { user: defaultUser };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'LOGOUT': return { ...state, user: null };
    default: return state;
  }
}

interface AppContextType extends AppState {
  setUser: (user: AppUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const saved = sessionStorage.getItem('dinarr-user');
    return saved ? { user: JSON.parse(saved) } : { user: defaultUser };
  });

  useEffect(() => {
    if (state.user) sessionStorage.setItem('dinarr-user', JSON.stringify(state.user));
    else sessionStorage.removeItem('dinarr-user');
  }, [state.user]);

  return (
    <AppContext.Provider value={{
      ...state,
      setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
      logout: () => dispatch({ type: 'LOGOUT' }),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
