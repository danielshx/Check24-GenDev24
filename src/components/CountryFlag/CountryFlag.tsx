export const CountryFlag: React.FC<{
  country: string;
  className?: string;
}> = ({ country, className }) => {
  return (
    <img
      className={className}
      src={"https://flagsapi.com/" + country.toUpperCase() + "/flat/64.png"}
      alt={country}
    />
  );
};
