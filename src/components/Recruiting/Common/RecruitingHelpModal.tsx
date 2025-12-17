import { FC, useMemo } from "react";
import {
  Help1,
  League,
  ModalAction,
  SimCBB,
  SimCFB,
  SimCHL,
} from "../../../_constants/constants";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { usePagination } from "../../../_hooks/usePagination";
import {
  CBBPortalHelpContent,
  CBBRecruitingHelpContent,
  CFBRecruitingHelpContent,
  CHLPortalHelpContent,
  CHLRecruitingHelpContent,
} from "../../../_constants/helpContent";

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  modalAction: ModalAction;
}

export const RecruitingHelpModal: FC<HelpModalProps> = ({
  isOpen,
  onClose,
  league,
  modalAction,
}) => {
  const helpContent = useMemo(() => {
    if (league === SimCHL) {
      return CHLRecruitingHelpContent;
    }
    if (league === SimCFB) {
      return CFBRecruitingHelpContent;
    }
    if (league === SimCBB) {
      return CBBRecruitingHelpContent;
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
        title="Recruiting Help"
        classes="h-[60vh]"
      >
        <div className="flex-1 flex flex-col justify-between h-[75%]">
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
      </Modal>
    </>
  );
};

export const PortalHelpModal: FC<HelpModalProps> = ({
  isOpen,
  onClose,
  league,
  modalAction,
}) => {
  const helpContent = useMemo(() => {
    if (league === SimCHL) {
      return CHLPortalHelpContent;
    }
    if (league === SimCFB) {
      return CFBRecruitingHelpContent;
    }
    if (league === SimCBB) {
      return CBBPortalHelpContent;
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
        title="Portal Help"
        classes="h-[60vh]"
      >
        <div className="flex-1 flex flex-col justify-between h-[75%]">
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
      </Modal>
    </>
  );
};
