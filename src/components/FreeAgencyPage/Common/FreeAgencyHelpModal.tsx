import { FC, useMemo } from "react";
import { HelpModalProps } from "../../Recruiting/Common/RecruitingHelpModal";
import { Help1, SimNBA, SimNFL, SimPHL } from "../../../_constants/constants";
import {
  NBAFreeAgencyHelpContent,
  NFLFreeAgencyHelpContent,
  PHLFreeAgencyHelpContent,
} from "../../../_constants/helpContent";
import { usePagination } from "../../../_hooks/usePagination";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";

export const FreeAgencyHelpModal: FC<HelpModalProps> = ({
  isOpen,
  onClose,
  league,
  modalAction,
}) => {
  const helpContent = useMemo(() => {
    if (league === SimPHL) {
      return PHLFreeAgencyHelpContent;
    }
    if (league === SimNFL) {
      return NFLFreeAgencyHelpContent;
    }
    if (league === SimNBA) {
      return NBAFreeAgencyHelpContent;
    }
    return [];
  }, [league]);
  const { currentPage, totalPages, goToNextPage, goToPreviousPage } =
    usePagination(helpContent.length, 1);

  const contentForPage = useMemo(() => {
    if (helpContent.length === 0) {
      return [];
    }
    return helpContent[currentPage];
  }, [currentPage, helpContent]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Free Agency Help"
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
