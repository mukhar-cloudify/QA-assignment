export const createDraftInvoice = async (
    economic,
    customerNumber,
    lines,
    dealId,
    deal,
    contactId
) => {
    const { data: invoiceBody } = await economic.http.get(
        `/customers/${customerNumber}/templates/invoice`,
        {},
        {
            log: true,
            logArgs: true,
            logResult: true,

            purpose: `Fetching Invoice Template for customer: ${customerNumber}`,
        }
    );
    invoiceBody.references = {
        other: `${dealId}`,
    };

    invoiceBody.notes = {
        heading: `Period`,
    };

    if (deal?.["276aa849d9199af41c9563cacc21de182df61632"]) {
        // Key for the custom Deal Field "Subscription Date"
        const date = new Date(
            deal?.["276aa849d9199af41c9563cacc21de182df61632"].toString()
        );
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.getMonth();
        invoiceBody.notes.heading += ` - ${day}.${month + 1}.${year} - ${day}.${
            month + 1
        }.${year + 1}`;
    }

    invoiceBody.lines = lines;
    if (deal?.c0ed23d04b5301592968afb9b5112bc3ba57569f) {
        invoiceBody.notes = {
            textLine1: `${deal?.c0ed23d04b5301592968afb9b5112bc3ba57569f}`,
        };
    }

    if (contactId) {
        invoiceBody.recipient.attention = {
            customerContactNumber: contactId, // Customercontact
        };
    }

    if (deal?.["4175cb261c42da3c8dc2562614360624cb0daec8"]) {
        // Deal Custom field for EAN
        invoiceBody.recipient.ean = `${deal?.["4175cb261c42da3c8dc2562614360624cb0daec8"]}`;
    }

    // payload available in invoice.json
    const draftInvoice = await economic.invoices.create("drafts", invoiceBody);
    return draftInvoice;
};
