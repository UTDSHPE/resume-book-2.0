
export const handleLinkedInLogin = async (apiGatewayUrl: string) => {
    if (!apiGatewayUrl) {
        console.error('API Gateway URL is not set');
        alert('API Gateway URL is not configured. Please check your environment variables.');
        return;
    }
    // Redirect to Lambda endpoint that initiates LinkedIn OAuth flow
    window.location.href = `${apiGatewayUrl}/auth/linkedin`;
};