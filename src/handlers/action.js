import { createDraftInvoice } from "../helpers/economic/draftInvoice.js";
import { findOrCreateCustomer } from "../helpers/economic/customers.js";
import { findProducts } from "../helpers/economic/products.js";
import { getPDF } from "../helpers/economic/getPDF.js";
import { uploadPDF } from "../helpers/pipedrive/createFilePD.js";
import { findCreateContact } from "../helpers/economic/contact.js";

export const action = async (event) => {
    try {
        const body = event?.body;
        let finalRefId, finalKey;

        if (!body?.isLightHouse) {
            finalRefId = body?.current?.id;
        } else {
            finalRefId = body?.refId;
            finalKey = body?.key;
        }

        if (!finalRefId) throw new Error(`Pipedrive Deal is missing`);

        const pipedrive = await app("pipedrive");
        const economic = await app("economic");

        // finalRefId is deal id & is a number
        const { data: deal } = await pipedrive.deals.get(finalRefId);
        // payload available in deal.json

        if (!deal?.org_id?.value)
            throw new Error(
                "Organization Id is missing from the deal"
            );

        const { customer, person } = await findOrCreateCustomer(
            economic,
            pipedrive,
            deal?.person_id?.value,
            deal?.org_id?.value
        );
        if (!customer?.customerNumber)
            throw new Error(
                `Customer could not be found/created!`
            );
        console.log("Customer Found/Created", customer);

        // payload available in PDproducts.json
        const { data: products } = await pipedrive.deals.attached(
            finalRefId,
            "products"
        );

        const lines = await findProducts(economic, pipedrive, products?.data);
        console.log("Product Found", lines);

        let contactId = 0;
        const draftInvoice = await createDraftInvoice(
            economic,
            customer?.customerNumber,
            lines,
            finalRefId,
            deal,
            contactId
        );
        if (!draftInvoice?.draftInvoiceNumber)
            throw new Error(
                `The draft invoice could not be created in E-conomic!`
            );



        // Return the success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
            }),
        };
    } catch (error) {
        // End the workflow with an error
        console.error(error?.response?.data);
        // Return the error response
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "error",
                error: error.message,
                stack: error?.stack ?? error?.response?.data,
            }),
        };
    }
};
