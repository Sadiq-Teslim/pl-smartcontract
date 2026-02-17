import lighthouse from "@lighthouse-web3/sdk";

const API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "YOUR_API_KEY";

export const uploadNeuralHash = async (data: object) => {
    try {
        const jsonString = JSON.stringify(data);
        const output = await lighthouse.uploadText(jsonString, API_KEY);

        console.log("File Status:", output);
        return output.data.Hash; // Returns CID
    } catch (error) {
        console.warn("Lighthouse Upload Error (Switching to Mock):", error);
        // Fallback for Demo if API Key is missing/invalid
        return "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    }
};
