import { FC, useMemo } from "react";
import { HelpModalProps } from "../../Recruiting/Common/RecruitingHelpModal";
import {
  Help1,
  SimCFB,
  SimCHL,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";
import {
  FBStatsHelpContent,
  HCKStatsHelpContent,
  NFLFreeAgencyHelpContent,
  PHLFreeAgencyHelpContent,
} from "../../../_constants/helpContent";
import { usePagination } from "../../../_hooks/usePagination";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";

export const StatsPageHelpModal: FC<HelpModalProps> = ({
  isOpen,
  onClose,
  league,
  modalAction,
}) => {
  const helpContent = useMemo(() => {
    if (league === SimPHL || league === SimCHL) {
      return HCKStatsHelpContent;
    }
    if (league === SimNFL || league === SimCFB) {
      return FBStatsHelpContent;
    }
    return [];
  }, [league]);
  const { currentPage, totalPages, goToNextPage, goToPreviousPage } =
    usePagination(helpContent.length, 1);

  const contentForPage = helpContent[currentPage];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Stats Page Help"
        classes="h-[75vh]"
        actions={<></>}
      >
        <div className="flex-1 flex flex-col justify-between h-[88%]">
          <div className="overflow-y-auto">
            {modalAction === Help1 && (
              <>
                {contentForPage.map((line, index) => (
                  <Text
                    key={index}
                    variant={index === 0 ? "h6" : "body-small"}
                    classes="mb-2 text-start"
                  >
                    {line}
                  </Text>
                ))}
              </>
            )}
          </div>
          <div className="flex justify-center items-center mt-4">
            <ButtonGroup>
              <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
                Prev
              </Button>
              <Text variant="body-small" className="flex items-center">
                {currentPage + 1}
              </Text>
              <Button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Modal>
    </>
  );
};
