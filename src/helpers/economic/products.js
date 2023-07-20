export const findProducts = async (economic, pipedrive, items) => {
    const products = [];
    if (!items)
        throw new Error(
            "Products are missing from Pipedrive deal"
        );
    for (const item of items) {
        // payload available in PDproductGet.json
        const { data: pdItem } = await pipedrive.products.get(item?.product_id);
        const productNumber = pdItem?.code;

        // payload available in ecoProduct.json
        const { collection: product } = await economic.products.filter(
            `productNumber$eq:${productNumber}`
        );
        console.log("<--- E-conomic Product --->", product[0]);

        if (product.length === 0)
            throw new Error(
                `Product with product number ${productNumber} is missing from e-conomic`
            );

        products.push({
            description: item?.comments ? item?.comments : item?.name,
            quantity: parseFloat(item?.quantity),
            unitNetPrice: parseFloat(item?.item_price),
            discountPercentage: parseFloat(item?.discount_percentage),
            product: {
                productNumber: productNumber,
            },
        });
    }
    return products;
};
