import { useEffect, useState } from "react";
import Select from "react-select";

const CustomSelect = (props) => {
  const [value, setValue] = useState();

  useEffect(() => {
    findVal();
  }, [value,,props.value,props.options]);
  const customStyles = {
    control: (base) => ({
      ...base,
      height: 40,
      minHeight: 40,
      width: "100%",
    }),
    menu: (base) => ({
      ...base,
      width: "100%",
      zIndex : 99999,
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      height: 40,
      // position: 'initial',
      padding: "0px 8px",
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: 40,
    }),
    input: (provided, state) => ({
      ...provided,
      height: 40,
      padding: 0,
      margin: 0,
    }),
    container: (provided, state) => ({
      ...provided,
      minWidth: "100%",
    }),
  };

  const handleChange = (selectedOption) => {
    setValue(selectedOption)
    props.onChange(selectedOption);
  };
  const findVal = () => {
    let x = props.options.filter((option) => option.value === props.value)[0];
    setValue(x);
  };

  return (
    <Select
      styles={customStyles}
      options={props.options}
      onChange={handleChange}
      value={value}
    />
  );
};
export { CustomSelect };
