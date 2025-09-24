import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useHCKTransferPortal } from "./useHCKTransferPortal";

export const HCKTransferPortal = () => {
  const hkStore = useSimHCKStore();
  const { recruitingCategory } = useHCKTransferPortal();
  return <></>;
};
