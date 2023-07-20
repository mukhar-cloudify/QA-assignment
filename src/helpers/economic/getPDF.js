export const getPDF = async (economic, draftInvoiceNumber) => {
    const { data } = await economic.http.get(
        `/invoices/drafts/${draftInvoiceNumber}/pdf`,
        {
            // We want axios to convert data to buffer as we need raw data
            responseType: "arraybuffer",
            responseEncoding: "binary",
        }
    );
    return data;
};
