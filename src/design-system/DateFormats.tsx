import { format } from "date-fns";

interface Props {
  date: Date;
  children?: undefined;
}

export const DateMMMD: React.FC<Props> = (props) => {
  return <>{format(props.date, "MMM d")}</>;
};

export const DateMMMMdyyyy: React.FC<Props> = (props) => {
  return <>{format(props.date, "MMMM d, yyyy")}</>;
};
