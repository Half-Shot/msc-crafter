import { useCodeASTContext } from "../../hooks/CodeASTContext";
import RawView from "../RawView";

const ProposalRawView = ({
  showThreads,
  onlyOpenThreads = false,
}: {
  showThreads: boolean;
  onlyOpenThreads?: boolean;
}) => {
  const tree = useCodeASTContext();
  return (
    <RawView
      tree={tree}
      showThreads={showThreads}
      onlyOpenThreads={onlyOpenThreads}
    />
  );
};

export default ProposalRawView;
