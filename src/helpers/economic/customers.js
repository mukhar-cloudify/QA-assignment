export const findOrCreateCustomer = async (
    economic,
    pipedrive,
    personId,
    organizationId
) => {
    // Creating E-conomic customer

    // payload available in person.json
    const { data: person } = await pipedrive.persons.get(personId);

    // payload available in organization.json
    const { data: org } = await pipedrive.organizations.get(organizationId);

    if (!org?.a69adbd4018835656f74238fb1b2baedd7020d81)
        throw new Error(
            `Payment term is missing from the organization with id ${organizationId}`
        );

    if (!person?.email[0]?.value)
        throw new Error(
            `Email is missing from the person with id ${personId}`
        );

    const ecoPaymentTerms = {
        150: 1, // ID for PaymentTerms "Netto 8 dage"
        151: 8, // ID for PaymentTerms "Netto 14 dage"
    };

    let address, city, zip, country;
    if (org.address) {
        [address, city, zip, country] = org.address.split(",");
    }
    if (!org?.["25044f0d69726b16896c9636185a4575f752d2ed"])
        throw new Error("CVR is missing in the organization");

    const ecoCustomerParams = {
        name: org?.name,
        email: person?.email[0]?.value,
        currency: "DKK",
        customerGroup: {
            customerGroupNumber: 1000, 
        },
        layout: {
            layoutNumber: 3,
        },
        paymentTerms: {
            paymentTermsNumber:
                ecoPaymentTerms[org?.a69adbd4018835656f74238fb1b2baedd7020d81],
        },
        vatZone: {
            vatZoneNumber: 1, // ID of the Vat zone "Domestic" A.K.A Denmark
        },
        corporateIdentificationNumber: `${org["25044f0d69726b16896c9636185a4575f752d2ed"]}`,
        address: address?.trim() ?? "",
        city: city?.trim() ?? "",
        country: country?.trim() ?? "",
        zip: zip?.trim() ?? "",
    };
    if (org?.["4175cb261c42da3c8dc2562614360624cb0daec8"])
        ecoCustomerParams.ean = `${org?.["4175cb261c42da3c8dc2562614360624cb0daec8"]}`;
    if (org?.e38ca748da5a60a9f164b72ac940b3a510c47bd6)
        ecoCustomerParams.ean = `${org?.e38ca748da5a60a9f164b72ac940b3a510c47bd6}`;

    if (org?.["25044f0d69726b16896c9636185a4575f752d2ed"])
        // CVR Custom Org Field in Pipedrive Organization
        ecoCustomerParams.customerNumber =
            org?.["25044f0d69726b16896c9636185a4575f752d2ed"];

    // payload available in customer.json
    const customer = await economic.customers.getOrCreate(
        `corporateIdentificationNumber$eq:${org?.["25044f0d69726b16896c9636185a4575f752d2ed"]}`,
        ecoCustomerParams
    );

    return { customer: updatedCustomer, org, person };
};
