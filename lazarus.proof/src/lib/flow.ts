import * as fcl from "@onflow/fcl";

const LAZARUS_GUARD_ADDRESS = "0x32258b0c4e249730";

fcl.config({
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "app.detail.title": "Lazarus.Proof",
    "app.detail.icon": "https://placekitten.com/g/200/200"
});

export const authenticate = async () => {
    try {
        await fcl.authenticate();
        const currentUser = await fcl.currentUser.snapshot();
        return currentUser;
    } catch (error) {
        console.error("FCL Auth Error:", error);
        return null;
    }
};

export const unauthenticate = () => fcl.unauthenticate();

export const subscribeToUser = (callback: (user: { addr: string | null; loggedIn: boolean | null }) => void) => {
    return fcl.currentUser.subscribe((user) => {
        callback({ addr: user.addr ?? null, loggedIn: user.loggedIn ?? null });
    });
};

export interface OnChainGuardStatus {
    isValid: boolean;
    secondsUntilExpiry: number;
    lastVerifiedCID: string;
    lastPulseTimestamp: number;
    pulseValidityWindow: number;
}

export const getGuardStatusOnChain = async (): Promise<OnChainGuardStatus> => {
    try {
        const result = await fcl.query({
            cadence: `
                import LazarusGuard from ${LAZARUS_GUARD_ADDRESS}

                access(all) fun main(): {String: AnyStruct} {
                    return {
                        "isValid": LazarusGuard.isNeuralPulseValid(),
                        "secondsUntilExpiry": LazarusGuard.secondsUntilExpiry(),
                        "lastVerifiedCID": LazarusGuard.lastVerifiedCID,
                        "lastPulseTimestamp": LazarusGuard.lastPulseTimestamp,
                        "pulseValidityWindow": LazarusGuard.PULSE_VALIDITY_WINDOW
                    }
                }
            `,
        });

        return {
            isValid: Boolean(result.isValid),
            secondsUntilExpiry: parseFloat(result.secondsUntilExpiry) || 0,
            lastVerifiedCID: String(result.lastVerifiedCID || ""),
            lastPulseTimestamp: parseFloat(result.lastPulseTimestamp) || 0,
            pulseValidityWindow: parseFloat(result.pulseValidityWindow) || 300,
        };
    } catch (error) {
        console.error("FCL Guard Status Query Error:", error);
        return {
            isValid: false,
            secondsUntilExpiry: 0,
            lastVerifiedCID: "",
            lastPulseTimestamp: 0,
            pulseValidityWindow: 300,
        };
    }
};

export const verifyIntent = async (cid: string): Promise<boolean> => {
    const status = await getGuardStatusOnChain();
    return status.isValid && status.lastVerifiedCID === cid;
};
