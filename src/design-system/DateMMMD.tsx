import { format } from "date-fns";

interface Props {
  date: Date;
  children?: undefined;
}

const DateMMMD: React.FC<Props> = (props) => {
  return <>{format(props.date, "MMM d")}</>;
};

export default DateMMMD;
