import { internationalizeNumber } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

function getInputWidth(inputValue: string) {
  let size = 0;

  for (let i = 0; i < inputValue.length; i++) {
    if (inputValue[i] === "," || inputValue[i] === ".") {
      size += 12;
    } else if (inputValue[i] === "1") {
      size += 22;
    } else {
      size += 30;
    }
  }

  return size;
}

function formatDefaultInputValue(value: number, locale: string) {
  return value.toLocaleString(locale);
}

function toNumber(value: string) {
  return Number(value.replace(",", "."));
}

type TNumberInputProps = {
  defaultValue: number;
  onChange: (value: number) => void;
};

export function NumberInput({ defaultValue, onChange }: TNumberInputProps) {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState(
    formatDefaultInputValue(defaultValue, locale)
  );

  useEffect(() => {
    if (toNumber(inputValue) !== defaultValue) {
      setInputValue(formatDefaultInputValue(defaultValue, locale));
    }
  }, [defaultValue]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let newValue = event.target.value;

    newValue = internationalizeNumber(newValue, locale)
      .replace(/[^0-9.,]/g, "")
      .replace(/([.,]).*\1/g, "$1")
      .replace(/^(?!0$|0[.,])0+/, "");

    if (newValue === "." || newValue === "," || newValue === "") {
      newValue = "0";
    }

    setInputValue(newValue);
    onChange(toNumber(newValue));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={inputValue}
      onChange={handleChange}
      onFocus={(event) => event.target.select()}
      autoComplete="off"
      autoCapitalize="off"
      className="text-5xl text-center rounded-lg focus:bg-gray-medium select-text"
      style={{ width: `${getInputWidth(inputValue)}px` }} //field-sizing-content isn't supported in Safari and Firefox
    />
  );
}
