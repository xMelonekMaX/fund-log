import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setData(JSON.parse(item));
    } else if (defaultValue !== undefined) {
      setData(defaultValue);
      window.localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }, [key, defaultValue]);

  function setJSONToLocalStorage(newData: T | ((prevData: T) => T)) {
    const valueToStore =
      typeof newData === "function"
        ? (newData as (prevData: T | undefined) => T)(data)
        : newData;

    setData(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  }

  return [data, setJSONToLocalStorage] as const;
}
