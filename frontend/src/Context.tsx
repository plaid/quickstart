import React, { createContext, ReactNode, useState } from "react";

const Context = createContext("Linda");

interface DocsState {
  linkSuccess: boolean;
  isItemAccess: boolean;
}

const initialState: DocsState = {
  linkSuccess: false,
  isItemAccess: false,
};

const [context, setContext] = useState<DocsState>(initialState);

export const DocsProvider: React.FC<{
  children: ReactNode;
}> = (props) => {
  return (
    // @ts-ignore
    <Context.Provider value={{ ...context }}>{props.children}</Context.Provider>
  );
};

export default Context;
