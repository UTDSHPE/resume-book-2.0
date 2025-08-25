
export const main = async (event) => {
    return { statusCode: 404, body: JSON.stringify({ error: "This handler does not return anything!" }) }
};
