import { FC, useState } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { DraftService } from "../../_services/draftService";
import { useSnackbar } from "notistack";

export const NFLUDFAAdminPanel: FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [isDryRun, setIsDryRun] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessUDFAs = async () => {
        const confirmMsg = isDryRun 
            ? "Run UDFA Dry Run? This will only log results to the server console." 
            : "WARNING: This will sign UDFAs to teams in the LIVE database and create 3-year contracts. This cannot be undone. Proceed?";
        
        if (window.confirm(confirmMsg)) {
            setIsProcessing(true);
            try {
                const res = await DraftService.ProcessUDFAs(isDryRun);
                enqueueSnackbar(res || "UDFA Processing Complete", { 
                    variant: isDryRun ? 'info' : 'success' 
                });
            } catch (error) {
                enqueueSnackbar("Error processing UDFAs", { variant: 'error' });
                console.error(error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <Border classes="w-full sm:max-w-[65vw] mt-4">
            <div className="flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h6">NFL UDFA Management</Text>
                </div>
                
                <div className="bg-gray-900 border-2 border-red-900 p-6 rounded-xl">
                    <Text variant="h6" className="text-red-500 mb-2 font-bold">UDFA Batch Processing</Text>
                    <Text variant="small" className="text-gray-400 mb-6 block">
                        This evaluates team point bids (1-20) for all undrafted players. 
                        Winners are signed to 3-year, $0.5M contracts.
                    </Text>
                    
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-blue-500"
                                checked={isDryRun} 
                                onChange={() => setIsDryRun(!isDryRun)} 
                            />
                            <Text variant="body">Dry Run Mode (Safe)</Text>
                        </label>

                        <Button 
                            onClick={handleProcessUDFAs} 
                            disabled={isProcessing}
                            variant={isDryRun ? "primary" : "danger"}
                        >
                            {isProcessing ? "Processing..." : isDryRun ? "Run Signing Simulation" : "EXECUTE LIVE SIGNINGS"}
                        </Button>
                    </div>

                    {isDryRun && (
                        <Text variant="xs" className="mt-4 text-blue-400 italic">
                            * Note: Results for simulations are printed in the backend terminal logs.
                        </Text>
                    )}
                </div>
            </div>
        </Border>
    );
};