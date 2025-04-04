import React, { useState } from "react";
import { useLeagueStore } from "../context/LeagueContext";
import { League, SimCHL } from "../_constants/constants";
import { useNavigate } from "react-router-dom";

// 🔑 Define Props Interface for SideMenuItem
interface SideMenuItemProps {
  logo?: string;
  label: string;
  league?: League;
  isRoute?: boolean;
  route?: string;
  click?: () => void;
  toggle: () => void;
  dropdown?: SideMenuItemProps[];
  isTop?: boolean;
}

export const SideMenuItem: React.FC<SideMenuItemProps> = ({
  logo,
  label,
  league,
  isRoute = false,
  route = "",
  click,
  toggle,
  dropdown,
  isTop = false,
}) => {
  const navigate = useNavigate();
  const { setSelectedLeague } = useLeagueStore();
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (dropdown) {
      setIsOpen(!isOpen);
      return;
    }

    if (toggle !== undefined) {
      toggle();
    }

    if (league) {
      setSelectedLeague(league);
    }

    // ✅ If route is provided, navigate
    if (isRoute && route) {
      navigate(route);
    }

    // ✅ Execute additional click event if provided
    if (click) {
      click();
    }
  };

  return (
    <li className={`flex flex-col items-center ${isTop ? "w-full" : ""}`}>
      <button
        onClick={handleClick}
        className={`flex w-full p-2 text-gray-900 ${
          dropdown ? "rounded-lg" : ""
        } dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group`}
      >
        {logo && (
          <img
            src={logo}
            alt="sport logo"
            className="max-h-8 max-w-6 object-contain"
          />
        )}
        <span className="ml-3">{label}</span>
        {dropdown && <span className="ml-auto">{isOpen ? "▲" : "▼"}</span>}
      </button>

      {isOpen && dropdown && (
        <ul className="pl-4 w-full">
          {dropdown.map((item, index) => (
            <SideMenuItem key={index} {...item} league={league} />
          ))}
        </ul>
      )}
    </li>
  );
};

// ✅ Grey Label Component
interface GreyLabelProps {
  label: string;
}

export const GreyLabel: React.FC<GreyLabelProps> = ({ label }) => (
  <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
    {label}
  </span>
);

// ✅ Number Label Component
interface NumberLabelProps {
  num: number;
}

export const NumberLabel: React.FC<NumberLabelProps> = ({ num }) => (
  <span className="inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
    {num}
  </span>
);
