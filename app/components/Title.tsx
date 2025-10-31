import { useDocumentTitle } from '../utils/useDocumentTitle';

type TitleProps = {
  title: string;
};

export default function Title({ title }: TitleProps) {
  useDocumentTitle(title);
  return null;
}
