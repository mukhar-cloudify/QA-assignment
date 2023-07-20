// This file  takes base 64 pdf and converts it to pdf and then up
export const uploadPDF = async (
    pipedrive,
    dealId,
    draftInvoiceNumber,
    pdf,
    invoiceNumber
) => {
    console.log("Deal Id and Draft invoice number", dealId, invoiceNumber);

    const formData = new FormData();
    const readable = new Readable();
    readable.push(pdf); 
    readable.push(null);
    formData.append("deal_id", `${dealId}`);
    formData.append("file", readable, {
        filename: `${draftInvoiceNumber}.pdf`,
        contentType: "multipart/form-data",
        knownLength: readable.length,
    });

    const res = await pipedrive.http.post(`/files`, formData, {
        headers: formData.getHeaders(),
    });
    return res.data;
};
