import { createClient } from '@farcaster/quick-auth';
import { sdk } from '@farcaster/frame-sdk';

const quickAuth = createClient();

export async function verifyAuth(request: Request): Promise<{ fid: number } | null> {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;

    try {
        const payload = await quickAuth.verifyJwt({
            token: auth.split(' ')[1],
            domain: (new URL(process.env.NEXT_PUBLIC_URL!)).hostname
        });

        return { fid: Number(payload.sub) };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}

// Helper to get user info from Farcaster API
export async function getUserInfo(fid: number) {
    try {
        const response = await fetch(
            `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`
        );
        if (!response.ok) return null;

        const data = await response.json();
        return {
            fid,
            address: data?.result?.address?.address
        };
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        return null;
    }
}

// Helper function to make authenticated requests
export const fetchWithAuth = sdk.quickAuth.fetch; 