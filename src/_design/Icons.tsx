import React from "react";
import {
  LockClosedIcon,
  ScissorsIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UserIcon,
  ArrowsUpDownIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  TagIcon,
  BuildingOfficeIcon,
  PlusIcon,
  AcademicCapIcon,
  TrashIcon,
  FaceFrownIcon,
  CheckCircleIcon,
  XCircleIcon,
  BarsArrowDownIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  BellIcon,
  BellAlertIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BarsArrowUpIcon,
  MinusCircleIcon,
} from "@heroicons/react/16/solid";
import {
  GiDiamondTrophy,
  GiTrophyCup,
  GiRibbonMedal,
  GiTrophy,
  GiShieldBash,
  GiSoccerKick,
  GiAmericanFootballPlayer,
  GiTicTacToe,
} from "react-icons/gi";
import {
  FaMedal,
  FaChalkboardTeacher,
  FaSortAmountUp,
  FaHandshake,
} from "react-icons/fa";

// 🔑 Define Props Interface for LockIcon
interface LockIconProps {
  textColorClass?: "text-white" | "text-black" | string; // Add specific classes for better type safety
}

export const LockIcon: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return (
    <div className="absolute bottom-2 right-2">
      <LockClosedIcon
        className="size-6"
        style={{
          stroke: iconColor,
          fill: iconColor,
        }}
      />
    </div>
  );
};

export const ActionLock: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  return <LockClosedIcon className="size-5" />;
};

export const ScissorIcon: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <ScissorsIcon className="size-5" />;
};

export const ShieldExclamation: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <ShieldExclamationIcon className="size-5" />;
};

export const ShieldCheck: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <ShieldCheckIcon className={`size-5 ${textColorClass}`} />;
};

export const UserPlus: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <UserPlusIcon className="size-5" />;
};

export const User: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <UserIcon className={`size-5 ${textColorClass}`} />;
};

export const Info: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <IdentificationIcon className="size-5" />;
};

export const Plus: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <PlusIcon className="size-5" />;
};

export const Scholarship: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <AcademicCapIcon className="size-5" />;
};

export const ArrowsUpDown: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <ArrowsUpDownIcon className="size-5" />;
};

export const SadFace: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <FaceFrownIcon className="size-5" />;
};
export const CurrencyDollar: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";
  return <CurrencyDollarIcon className="size-5" />;
};

export const TrashCan: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";
  return <TrashIcon className="size-5" />;
};

export const Tag: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";
  return <TagIcon className="size-5" />;
};

export const BuildingOffice: React.FC<LockIconProps> = ({
  textColorClass = "text-black",
}) => {
  // ✅ Dynamically set stroke and fill based on the provided textColorClass
  const iconColor = textColorClass === "text-white" ? "#FFF" : "#000";

  return <BuildingOfficeIcon className="size-5" />;
};

export const CheckCircle: React.FC<LockIconProps> = ({
  textColorClass = "text-black", // Default color is black
}) => {
  return <CheckCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const CrossCircle: React.FC<LockIconProps> = ({
  textColorClass = "text-black", // Default color is black
}) => {
  return <XCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const DashCircle: React.FC<LockIconProps> = ({
  textColorClass = "text-black", // Default color is black
}) => {
  return <MinusCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const BarsArrowDown: React.FC<LockIconProps> = ({
  textColorClass = "text-white", // Default color is black
}) => {
  return <BarsArrowDownIcon className={`size-5 ${textColorClass}`} />;
};

export const BarsArrowUp: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <BarsArrowUpIcon className={`size-5 ${textColorClass}`} />;
};

export const InformationCircle: React.FC<LockIconProps> = ({
  textColorClass = "text-white", // Default color is black
}) => {
  return <InformationCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const PaperAirplane: React.FC<LockIconProps> = ({
  textColorClass = "text-white", // Default color is black
}) => {
  return <PaperAirplaneIcon className={`size-5 ${textColorClass}`} />;
};

export const Refresh: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <ArrowPathIcon className={`size-5 ${textColorClass}`} />;
};

export const Medic: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <PlusCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const Bell: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <BellIcon className={`size-5 ${textColorClass}`} />;
};

export const BellAlert: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <BellAlertIcon className={`size-5 ${textColorClass}`} />;
};

export const ChatBubble: React.FC<LockIconProps> = ({ textColorClass }) => {
  return (
    <ChatBubbleOvalLeftEllipsisIcon className={`size-5 ${textColorClass}`} />
  );
};

export const Close: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <XCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const QuestionMark: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <QuestionMarkCircleIcon className={`size-5 ${textColorClass}`} />;
};

export const Trophy: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiTrophyCup className={`size-5 ${textColorClass}`} />;
};

export const TrophyTwo: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiDiamondTrophy className={`size-5 ${textColorClass}`} />;
};

export const Medal: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiTrophy className={`size-5 ${textColorClass}`} />;
};

export const Ribbon: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiRibbonMedal className={`size-5 ${textColorClass}`} />;
};

export const ChalkBoard: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <FaChalkboardTeacher className={`size-5 ${textColorClass}`} />;
};

export const SortUp: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <FaSortAmountUp className={`size-5 ${textColorClass}`} />;
};

export const Handshake: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <FaHandshake className={`size-5 ${textColorClass}`} />;
};

export const ShieldBash: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiShieldBash className={`size-5 ${textColorClass}`} />;
};

export const KickBall: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiSoccerKick className={`size-5 ${textColorClass}`} />;
};

export const FootballPlayer: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiAmericanFootballPlayer className={`size-5 ${textColorClass}`} />;
};

export const TicTacToe: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <GiTicTacToe className={`size-5 ${textColorClass}`} />;
};

export const ArrowDown: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <ArrowDownIcon className={`size-5 ${textColorClass}`} />;
};

export const ArrowRight: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <ArrowRightIcon className={`size-5 ${textColorClass}`} />;
};

export const ArrowLeft: React.FC<LockIconProps> = ({ textColorClass }) => {
  return <ArrowLeftIcon className={`size-5 ${textColorClass}`} />;
};
