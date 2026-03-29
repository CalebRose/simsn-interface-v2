import { ReactNode } from "react";

// ✅ Define props interface
interface BorderProps {
  children: ReactNode;
  isFlex?: boolean;
  direction?: string;
  classes?: string;
  styles?: React.CSSProperties | undefined;
}

// ✅ Define props interface
interface BorderHiddenProps {
  children: ReactNode;
}

export const Border: React.FC<BorderProps> = ({
  children,
  direction = "col",
  classes = "py-2 px-2",
  isFlex = true,
  styles,
}) => {
  return (
    <div
      className={`${
        isFlex ? `flex flex-${direction}` : ""
      } border-2 rounded-xl mb-2 ${classes}`}
      style={{ ...styles }}
    >
      {children}
    </div>
  );
};

export const BorderHidden: React.FC<BorderHiddenProps> = ({ children }) => {
  return (
    <div className="hidden sm:flex sm:flex-col md:justify-between border-2 rounded-xl p-2 px-4 lg:px-6 mb-2">
      {children}
    </div>
  );
};

export const ForumBorder: React.FC<BorderProps> = ({
  children,
  direction = "col",
  classes = "py-2 px-2",
  isFlex = true,
  styles,
}) => {
  return (
    <div
      className={`${
        isFlex ? `flex flex-${direction}` : ""
      } rounded-xl mb-2 border ${classes}`}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-secondary)",
        ...styles,
      }}
    >
      {children}
    </div>
  );
};
